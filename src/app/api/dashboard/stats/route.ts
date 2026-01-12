import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants";
import type { SubscriptionTier } from "@/lib/constants";

export async function GET() {
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

    // Fetch user with reviews and responses
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tier: true,
        credits: true,
        creditsResetDate: true,
        sentimentQuota: true,
        sentimentUsed: true,
        sentimentResetDate: true,
        reviews: {
          select: {
            id: true,
            platform: true,
            reviewText: true,
            rating: true,
            sentiment: true,
            createdAt: true,
            response: {
              select: {
                id: true,
                isEdited: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        },
        { status: 404 }
      );
    }

    // Get total responses count
    const totalResponses = await prisma.reviewResponse.count({
      where: {
        review: {
          userId: session.user.id,
        },
      },
    });

    // Calculate edit rate (percentage of responses that were edited)
    const editedResponses = await prisma.reviewResponse.count({
      where: {
        review: {
          userId: session.user.id,
        },
        isEdited: true,
      },
    });

    const avgEditRate =
      totalResponses > 0
        ? Math.round((editedResponses / totalResponses) * 100)
        : 0;

    // Get tier limits
    const tierLimits = TIER_LIMITS[user.tier as SubscriptionTier] || TIER_LIMITS.FREE;

    // Calculate credits used (total - remaining)
    const creditsUsed = tierLimits.credits - user.credits;

    // Format recent reviews
    const recentReviews = user.reviews.map((review) => ({
      id: review.id,
      platform: review.platform,
      reviewText: review.reviewText,
      rating: review.rating,
      sentiment: review.sentiment,
      createdAt: review.createdAt.toISOString(),
      hasResponse: !!review.response,
    }));

    return NextResponse.json({
      success: true,
      data: {
        credits: {
          remaining: user.credits,
          total: tierLimits.credits,
          used: creditsUsed > 0 ? creditsUsed : 0,
          resetDate: user.creditsResetDate.toISOString(),
        },
        sentiment: {
          remaining: user.sentimentQuota - user.sentimentUsed,
          total: user.sentimentQuota,
          used: user.sentimentUsed,
          resetDate: user.sentimentResetDate.toISOString(),
        },
        tier: user.tier,
        stats: {
          totalReviews: user._count.reviews,
          totalResponses,
          avgEditRate,
        },
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch dashboard stats" },
      },
      { status: 500 }
    );
  }
}
