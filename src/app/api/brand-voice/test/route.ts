import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testBrandVoiceSchema } from "@/lib/validations";
import { generateReviewResponse } from "@/lib/ai/claude";
import { detectLanguage } from "@/lib/language-detection";

/**
 * POST /api/brand-voice/test - Test brand voice with a sample review
 * Generates a response using the user's brand voice settings
 * Does NOT deduct credits (test mode)
 */
export async function POST(request: NextRequest) {
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
    const validationResult = testBrandVoiceSchema.safeParse(body);
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

    const { reviewText, platform, rating } = validationResult.data;

    // Get user's brand voice (or create default)
    let brandVoice = await prisma.brandVoice.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandVoice) {
      // Create default brand voice if doesn't exist
      brandVoice = await prisma.brandVoice.create({
        data: {
          userId: session.user.id,
          tone: "professional",
          formality: 3,
          keyPhrases: ["Thank you", "We appreciate your feedback"],
          styleNotes: "Be genuine and empathetic",
          sampleResponses: [],
        },
      });
    }

    // Detect language of the review
    const languageResult = detectLanguage(reviewText);

    // Generate test response using Claude
    const generatedResponse = await generateReviewResponse({
      reviewText,
      platform: platform || "Google",
      rating,
      detectedLanguage: languageResult.language,
      brandVoice: {
        tone: brandVoice.tone,
        formality: brandVoice.formality,
        keyPhrases: brandVoice.keyPhrases,
        styleNotes: brandVoice.styleNotes,
        sampleResponses: brandVoice.sampleResponses,
      },
      isTestMode: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        response: {
          responseText: generatedResponse.responseText,
          model: generatedResponse.model,
          isTestMode: true,
          creditsUsed: 0, // No credits deducted for test mode
        },
        review: {
          reviewText,
          platform: platform || "Google",
          rating,
          detectedLanguage: languageResult.language,
        },
        brandVoice: {
          tone: brandVoice.tone,
          formality: brandVoice.formality,
          keyPhrases: brandVoice.keyPhrases,
          styleNotes: brandVoice.styleNotes,
        },
      },
    });
  } catch (error) {
    console.error("Error testing brand voice:", error);

    // Check if it's an API key error
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "API_NOT_CONFIGURED",
            message: "AI service is not configured. Please contact support.",
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate test response",
        },
      },
      { status: 500 }
    );
  }
}
