import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VALIDATION_LIMITS } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateResponseSchema = z.object({
  responseText: z
    .string()
    .min(1, "Response text is required")
    .max(VALIDATION_LIMITS.RESPONSE_TEXT_MAX, `Response must be under ${VALIDATION_LIMITS.RESPONSE_TEXT_MAX} characters`),
});

/**
 * PUT /api/reviews/[id]/response - Edit response manually
 *
 * - Update responseText
 * - Set isEdited = true
 * - Set editedAt timestamp
 * - Create new ResponseVersion entry
 * - No credit deduction for manual edits
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateResponseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validationResult.error.issues[0]?.message || "Invalid input",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { responseText } = validationResult.data;

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

    // Update response and create version in a transaction
    const updatedResponse = await prisma.$transaction(async (tx) => {
      // Update ReviewResponse
      const updated = await tx.reviewResponse.update({
        where: { id: review.response!.id },
        data: {
          responseText,
          isEdited: true,
          editedAt: new Date(),
        },
      });

      // Create new ResponseVersion for edit
      await tx.responseVersion.create({
        data: {
          reviewResponseId: updated.id,
          responseText,
          toneUsed: review.response!.toneUsed,
          creditsUsed: 0, // No credits for manual edits
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: {
        response: {
          id: updatedResponse.id,
          reviewId: updatedResponse.reviewId,
          responseText: updatedResponse.responseText,
          isEdited: updatedResponse.isEdited,
          editedAt: updatedResponse.editedAt?.toISOString() || null,
          toneUsed: updatedResponse.toneUsed,
          isPublished: updatedResponse.isPublished,
          createdAt: updatedResponse.createdAt.toISOString(),
          updatedAt: updatedResponse.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error updating response:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update response",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]/response - Delete response
 *
 * - Delete ReviewResponse and all versions (cascade)
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

    // Delete response (versions cascade automatically via Prisma schema)
    await prisma.reviewResponse.delete({
      where: { id: review.response.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Response deleted successfully",
        deletedResponseId: review.response.id,
      },
    });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete response",
        },
      },
      { status: 500 }
    );
  }
}
