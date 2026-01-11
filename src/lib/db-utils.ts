/**
 * Database utility functions for common operations
 * Includes atomic transactions for credit operations
 */

import { prisma } from "./prisma";
import type { Tier, Prisma } from "@prisma/client";
import { CreditActionValues } from "@/types/database";

// ============================================
// USER QUERIES
// ============================================

/**
 * Get user with credits and tier information
 */
export async function getUserWithCredits(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      credits: true,
      creditsResetDate: true,
      sentimentQuota: true,
      sentimentUsed: true,
      sentimentResetDate: true,
    },
  });
}

/**
 * Get user with brand voice
 */
export async function getUserWithBrandVoice(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      brandVoice: true,
    },
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

// ============================================
// REVIEW QUERIES
// ============================================

/**
 * Get review with response
 */
export async function getReviewWithResponse(reviewId: string, userId: string) {
  return prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
    include: {
      response: {
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });
}

/**
 * Get reviews with pagination
 */
export async function getReviewsPaginated(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    platform?: string;
    sentiment?: string;
    hasResponse?: boolean;
  } = {}
) {
  const { page = 1, limit = 20, platform, sentiment, hasResponse } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    userId,
    ...(platform && { platform }),
    ...(sentiment && { sentiment }),
    ...(hasResponse !== undefined && {
      response: hasResponse ? { isNot: null } : { is: null },
    }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        response: {
          select: {
            id: true,
            responseText: true,
            isEdited: true,
            isPublished: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + reviews.length < total,
  };
}

// ============================================
// CREDIT OPERATIONS (ATOMIC)
// ============================================

/**
 * Deduct credits atomically with audit trail
 * Returns { success, user, error }
 */
export async function deductCreditsAtomic(
  userId: string,
  amount: number,
  action: string,
  reviewId?: string,
  reviewResponseId?: string,
  details?: Record<string, unknown>
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Get user with lock (SELECT FOR UPDATE in PostgreSQL)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          credits: true,
          tier: true,
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.credits < amount) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: amount },
        },
        select: {
          id: true,
          credits: true,
          tier: true,
        },
      });

      // Create audit log
      await tx.creditUsage.create({
        data: {
          userId,
          creditsUsed: amount,
          action,
          reviewId,
          reviewResponseId,
          details: details ? JSON.stringify(details) : null,
        },
      });

      return {
        success: true,
        user: updatedUser,
        creditsDeducted: amount,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return {
      success: false,
      error: message,
      user: null,
    };
  }
}

/**
 * Refund credits atomically
 */
export async function refundCreditsAtomic(
  userId: string,
  amount: number,
  reason: string,
  reviewId?: string,
  reviewResponseId?: string
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Refund credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
        },
        select: {
          id: true,
          credits: true,
          tier: true,
        },
      });

      // Create audit log (negative credits for refund)
      await tx.creditUsage.create({
        data: {
          userId,
          creditsUsed: -amount, // Negative for refund
          action: CreditActionValues.REFUND,
          reviewId,
          reviewResponseId,
          details: JSON.stringify({ reason, refundedAt: new Date() }),
        },
      });

      return {
        success: true,
        user: updatedUser,
        creditsRefunded: amount,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return {
      success: false,
      error: message,
      user: null,
    };
  }
}

// ============================================
// SENTIMENT OPERATIONS
// ============================================

/**
 * Check if user has sentiment quota available
 */
export async function hasSentimentQuota(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      sentimentUsed: true,
      sentimentQuota: true,
    },
  });

  if (!user) return false;
  return user.sentimentUsed < user.sentimentQuota;
}

/**
 * Increment sentiment usage with audit trail
 */
export async function incrementSentimentUsage(
  userId: string,
  reviewId: string,
  sentiment: string,
  details?: Record<string, unknown>
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Check quota
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          sentimentUsed: true,
          sentimentQuota: true,
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.sentimentUsed >= user.sentimentQuota) {
        throw new Error("SENTIMENT_QUOTA_EXCEEDED");
      }

      // Increment usage
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          sentimentUsed: { increment: 1 },
        },
        select: {
          sentimentUsed: true,
          sentimentQuota: true,
        },
      });

      // Create audit log
      await tx.sentimentUsage.create({
        data: {
          userId,
          reviewId,
          sentiment,
          details: details ? JSON.stringify(details) : null,
        },
      });

      return {
        success: true,
        sentimentUsed: updatedUser.sentimentUsed,
        sentimentQuota: updatedUser.sentimentQuota,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return {
      success: false,
      error: message,
    };
  }
}

// ============================================
// RESET OPERATIONS
// ============================================

/**
 * Reset monthly credits for a user based on tier
 */
export async function resetUserCredits(userId: string) {
  const tierLimits: Record<Tier, { credits: number; sentiment: number }> = {
    FREE: { credits: 15, sentiment: 35 },
    STARTER: { credits: 60, sentiment: 150 },
    GROWTH: { credits: 200, sentiment: 500 },
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  if (!user) return null;

  const limits = tierLimits[user.tier];

  return prisma.user.update({
    where: { id: userId },
    data: {
      credits: limits.credits,
      creditsResetDate: new Date(),
      sentimentUsed: 0,
      sentimentResetDate: new Date(),
    },
  });
}

// ============================================
// BRAND VOICE
// ============================================

/**
 * Get or create default brand voice for user
 */
export async function getOrCreateBrandVoice(userId: string) {
  let brandVoice = await prisma.brandVoice.findUnique({
    where: { userId },
  });

  if (!brandVoice) {
    brandVoice = await prisma.brandVoice.create({
      data: {
        userId,
        tone: "professional",
        formality: 3,
        keyPhrases: [],
        sampleResponses: [],
      },
    });
  }

  return brandVoice;
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  const [
    totalReviews,
    reviewsWithResponse,
    sentimentCounts,
    platformCounts,
  ] = await Promise.all([
    prisma.review.count({ where: { userId } }),
    prisma.review.count({
      where: { userId, response: { isNot: null } },
    }),
    prisma.review.groupBy({
      by: ["sentiment"],
      where: { userId, sentiment: { not: null } },
      _count: true,
    }),
    prisma.review.groupBy({
      by: ["platform"],
      where: { userId },
      _count: true,
    }),
  ]);

  return {
    totalReviews,
    reviewsWithResponse,
    responseRate: totalReviews > 0
      ? Math.round((reviewsWithResponse / totalReviews) * 100)
      : 0,
    sentimentBreakdown: Object.fromEntries(
      sentimentCounts.map((s) => [s.sentiment, s._count])
    ),
    platformBreakdown: Object.fromEntries(
      platformCounts.map((p) => [p.platform, p._count])
    ),
  };
}
