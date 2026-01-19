import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants";
import type { SubscriptionTier } from "@/lib/constants";

/**
 * GET /api/credits
 * Returns the current user's credit balance and sentiment quota
 */
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

    // Get tier limits
    const tierLimits = TIER_LIMITS[user.tier as SubscriptionTier] || TIER_LIMITS.FREE;

    // Calculate credits used (total - remaining)
    const creditsUsed = tierLimits.credits - user.credits;

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
      },
    });
  } catch (error) {
    console.error("Credits fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch credits" },
      },
      { status: 500 }
    );
  }
}
