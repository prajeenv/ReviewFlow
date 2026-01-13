import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { brandVoiceSchema } from "@/lib/validations";

// Default brand voice settings
const DEFAULT_BRAND_VOICE = {
  tone: "professional",
  formality: 3,
  keyPhrases: ["Thank you", "We appreciate your feedback"],
  styleNotes: "Be genuine and empathetic",
  sampleResponses: [],
};

/**
 * GET /api/brand-voice - Get user's brand voice settings
 * Creates default brand voice if none exists
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

    // Try to find existing brand voice
    let brandVoice = await prisma.brandVoice.findUnique({
      where: { userId: session.user.id },
    });

    // Create default if doesn't exist
    if (!brandVoice) {
      brandVoice = await prisma.brandVoice.create({
        data: {
          userId: session.user.id,
          ...DEFAULT_BRAND_VOICE,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        brandVoice: {
          id: brandVoice.id,
          tone: brandVoice.tone,
          formality: brandVoice.formality,
          keyPhrases: brandVoice.keyPhrases,
          styleNotes: brandVoice.styleNotes,
          sampleResponses: brandVoice.sampleResponses,
          createdAt: brandVoice.createdAt.toISOString(),
          updatedAt: brandVoice.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching brand voice:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch brand voice",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/brand-voice - Update user's brand voice settings
 * Creates brand voice if doesn't exist (upsert)
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const validationResult = brandVoiceSchema.safeParse(body);
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

    const { tone, formality, keyPhrases, styleNotes, sampleResponses } = validationResult.data;

    // Upsert brand voice (create if doesn't exist, update if exists)
    const brandVoice = await prisma.brandVoice.upsert({
      where: { userId: session.user.id },
      update: {
        tone,
        formality,
        keyPhrases: keyPhrases || [],
        styleNotes: styleNotes || null,
        sampleResponses: sampleResponses || [],
      },
      create: {
        userId: session.user.id,
        tone,
        formality,
        keyPhrases: keyPhrases || [],
        styleNotes: styleNotes || null,
        sampleResponses: sampleResponses || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        brandVoice: {
          id: brandVoice.id,
          tone: brandVoice.tone,
          formality: brandVoice.formality,
          keyPhrases: brandVoice.keyPhrases,
          styleNotes: brandVoice.styleNotes,
          sampleResponses: brandVoice.sampleResponses,
          createdAt: brandVoice.createdAt.toISOString(),
          updatedAt: brandVoice.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error updating brand voice:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update brand voice",
        },
      },
      { status: 500 }
    );
  }
}
