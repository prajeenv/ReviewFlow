import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants";
import type { SubscriptionTier } from "@/lib/constants";

/**
 * GET /api/sentiment/usage - Get sentiment usage history
 * Returns list of sentiment analysis records with review previews
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;

    // Get sentiment usage history
    const usageRecords = await prisma.sentimentUsage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        review: {
          select: {
            id: true,
            platform: true,
            rating: true,
          },
        },
      },
    });

    // Get sentiment distribution stats
    const sentimentCounts = await prisma.review.groupBy({
      by: ["sentiment"],
      where: {
        userId: session.user.id,
        sentiment: { not: null },
      },
      _count: {
        sentiment: true,
      },
    });

    // Calculate distribution percentages
    const totalWithSentiment = sentimentCounts.reduce(
      (sum, item) => sum + item._count.sentiment,
      0
    );

    const distribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    for (const item of sentimentCounts) {
      if (item.sentiment && item.sentiment in distribution) {
        distribution[item.sentiment as keyof typeof distribution] =
          totalWithSentiment > 0
            ? Math.round((item._count.sentiment / totalWithSentiment) * 100)
            : 0;
      }
    }

    // Get user's sentiment credits info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        sentimentCredits: true,
        sentimentResetDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        usage: usageRecords.map((record) => {
          // Parse details JSON if available
          let details: {
            platform?: string;
            rating?: number;
            preview?: string;
            analyzedAt?: string;
          } = {};
          if (record.details) {
            try {
              details = JSON.parse(record.details);
            } catch {
              // Ignore parse errors
            }
          }

          return {
            id: record.id,
            sentiment: record.sentiment,
            createdAt: record.createdAt.toISOString(),
            reviewId: record.reviewId,
            platform: details.platform || record.review?.platform || null,
            rating: details.rating ?? record.review?.rating ?? null,
            preview: details.preview || null,
          };
        }),
        distribution: {
          positive: distribution.positive,
          neutral: distribution.neutral,
          negative: distribution.negative,
          total: totalWithSentiment,
        },
        quota: user
          ? (() => {
              const tierLimits = TIER_LIMITS[user.tier as SubscriptionTier] || TIER_LIMITS.FREE;
              return {
                used: tierLimits.sentimentQuota - user.sentimentCredits,
                total: tierLimits.sentimentQuota,
                remaining: user.sentimentCredits,
                resetDate: user.sentimentResetDate.toISOString(),
              };
            })()
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching sentiment usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch sentiment usage",
        },
      },
      { status: 500 }
    );
  }
}
