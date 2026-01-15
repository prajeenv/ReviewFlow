import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reviews/[id]/publish - Approve/publish response
 *
 * - Set isPublished = true
 * - Set publishedAt timestamp
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id: reviewId } = await params;

    // Get review with response
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
      include: {
        response: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Review not found" },
        },
        { status: 404 }
      );
    }

    if (!review.response) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_RESPONSE",
            message: "No response exists for this review",
          },
        },
        { status: 400 }
      );
    }

    // Check if already published
    if (review.response.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_PUBLISHED",
            message: "This response is already published",
          },
        },
        { status: 400 }
      );
    }

    // Update response as published
    const updatedResponse = await prisma.reviewResponse.update({
      where: { id: review.response.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        response: {
          id: updatedResponse.id,
          reviewId: updatedResponse.reviewId,
          responseText: updatedResponse.responseText,
          isPublished: updatedResponse.isPublished,
          publishedAt: updatedResponse.publishedAt?.toISOString() || null,
          isEdited: updatedResponse.isEdited,
          toneUsed: updatedResponse.toneUsed,
          createdAt: updatedResponse.createdAt.toISOString(),
          updatedAt: updatedResponse.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error publishing response:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to publish response",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]/publish - Unpublish response
 *
 * - Set isPublished = false
 * - Clear publishedAt timestamp
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id: reviewId } = await params;

    // Get review with response
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: session.user.id,
      },
      include: {
        response: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Review not found" },
        },
        { status: 404 }
      );
    }

    if (!review.response) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_RESPONSE",
            message: "No response exists for this review",
          },
        },
        { status: 400 }
      );
    }

    // Check if already unpublished
    if (!review.response.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_PUBLISHED",
            message: "This response is not published",
          },
        },
        { status: 400 }
      );
    }

    // Update response as unpublished
    const updatedResponse = await prisma.reviewResponse.update({
      where: { id: review.response.id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        response: {
          id: updatedResponse.id,
          reviewId: updatedResponse.reviewId,
          responseText: updatedResponse.responseText,
          isPublished: updatedResponse.isPublished,
          publishedAt: null,
          isEdited: updatedResponse.isEdited,
          toneUsed: updatedResponse.toneUsed,
          createdAt: updatedResponse.createdAt.toISOString(),
          updatedAt: updatedResponse.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error unpublishing response:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to unpublish response",
        },
      },
      { status: 500 }
    );
  }
}
