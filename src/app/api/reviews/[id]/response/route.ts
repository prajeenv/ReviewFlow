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
  toneUsed: z.string().optional(), // Optional: provided when restoring a version
  isRestore: z.boolean().optional(), // If true, this is a restore (not a manual edit)
});

/**
 * PUT /api/reviews/[id]/response - Edit response manually or restore a version
 *
 * For manual edits:
 * - Save current text to version history (so it can be restored later)
 * - Update responseText with new text
 * - Set isEdited = true, editedAt = now
 * - No credit deduction (creditsUsed = 0 for edit versions)
 *
 * For restores (isRestore = true):
 * - Update responseText and toneUsed from the restored version
 * - No version entry created (version already exists in history)
 * - Preserve isEdited and editedAt state
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

    const { responseText, toneUsed, isRestore } = validationResult.data;

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

    // Determine the tone to use (provided tone for restores, or keep current for edits)
    const newToneUsed = toneUsed || review.response!.toneUsed;

    // For manual edits (not restores), save the current state to version history first
    // This preserves the pre-edit text so user can restore it later
    // No credits charged for manual edits
    const updatedResponse = await prisma.$transaction(async (tx) => {
      // Only create version entry for edits, not restores
      // Also skip if the text hasn't actually changed
      if (!isRestore && responseText !== review.response!.responseText) {
        // Save the current (pre-edit) text to version history
        // This allows the user to restore to this version later
        // Preserve the creditsUsed of the current response (1 if generated/regenerated, 0 if edited)
        await tx.responseVersion.create({
          data: {
            reviewResponseId: review.response!.id,
            responseText: review.response!.responseText, // Save CURRENT text before overwriting
            toneUsed: review.response!.toneUsed,
            creditsUsed: review.response!.creditsUsed, // Preserve what this version cost
          },
        });
      }

      // Update the response with new text
      const updated = await tx.reviewResponse.update({
        where: { id: review.response!.id },
        data: {
          responseText,
          toneUsed: newToneUsed,
          isEdited: !isRestore, // Not edited if just restoring a previous version
          editedAt: isRestore ? review.response!.editedAt : new Date(),
          // For manual edits, set creditsUsed to 0 so if this version goes to history
          // later (via regenerate), it correctly shows as 0 credits
          // For restores, preserve the original creditsUsed from the restored version
          creditsUsed: isRestore ? review.response!.creditsUsed : 0,
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
