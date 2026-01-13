/**
 * Claude AI service for response generation
 * Uses Anthropic's Claude API for generating brand-aligned review responses
 */

import Anthropic from "@anthropic-ai/sdk";

// Default model for response generation
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface BrandVoiceConfig {
  tone: string;
  formality: number;
  keyPhrases: string[];
  styleNotes: string | null;
  sampleResponses: string[];
}

interface GenerateResponseParams {
  reviewText: string;
  platform: string;
  rating?: number | null;
  detectedLanguage?: string;
  brandVoice: BrandVoiceConfig;
  isTestMode?: boolean;
}

interface GeneratedResponse {
  responseText: string;
  model: string;
}

/**
 * Get formality description based on level (1-5)
 */
function getFormalityDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: "very casual and conversational, like talking to a friend",
    2: "casual but still polite and friendly",
    3: "balanced mix of professional and approachable",
    4: "formal and professional with proper business language",
    5: "very formal, polished, and highly professional",
  };
  return descriptions[level] || descriptions[3];
}

/**
 * Generate a response to a review using Claude AI
 */
export async function generateReviewResponse(
  params: GenerateResponseParams
): Promise<GeneratedResponse> {
  const {
    reviewText,
    platform,
    rating,
    detectedLanguage = "English",
    brandVoice,
    isTestMode = false,
  } = params;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  // Build the system prompt with brand voice configuration
  const systemPrompt = buildSystemPrompt(brandVoice, detectedLanguage);

  // Build the user prompt with review details
  const userPrompt = buildUserPrompt({
    reviewText,
    platform,
    rating,
    detectedLanguage,
    isTestMode,
  });

  try {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response received from Claude");
    }

    return {
      responseText: textContent.text.trim(),
      model: response.model,
    };
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}

/**
 * Build the system prompt with brand voice configuration
 */
function buildSystemPrompt(
  brandVoice: BrandVoiceConfig,
  language: string
): string {
  const { tone, formality, keyPhrases, styleNotes, sampleResponses } =
    brandVoice;

  let prompt = `You are a customer service representative writing responses to customer reviews.

IMPORTANT INSTRUCTIONS:
1. Write the response in ${language} (the same language as the review)
2. Keep the response under 500 characters
3. Be genuine and human - avoid sounding robotic or template-like
4. Address specific points mentioned in the review when relevant
5. Never be defensive or argumentative, even for negative reviews

BRAND VOICE CONFIGURATION:
- Tone: ${tone}
- Formality Level: ${getFormalityDescription(formality)}`;

  if (keyPhrases.length > 0) {
    prompt += `\n- Key Phrases to include when appropriate: ${keyPhrases.join(", ")}`;
  }

  if (styleNotes) {
    prompt += `\n- Style Guidelines: ${styleNotes}`;
  }

  if (sampleResponses.length > 0) {
    prompt += `\n\nSAMPLE RESPONSES FOR REFERENCE (match this style):`;
    sampleResponses.forEach((sample, index) => {
      prompt += `\n${index + 1}. "${sample}"`;
    });
  }

  prompt += `\n\nRespond ONLY with the response text. Do not include any explanations, notes, or meta-commentary.`;

  return prompt;
}

/**
 * Build the user prompt with review details
 */
function buildUserPrompt(params: {
  reviewText: string;
  platform: string;
  rating?: number | null;
  detectedLanguage: string;
  isTestMode: boolean;
}): string {
  const { reviewText, platform, rating, detectedLanguage, isTestMode } = params;

  let prompt = `Write a response to this ${platform} review`;

  if (rating) {
    prompt += ` (${rating}/5 stars)`;
  }

  prompt += ` in ${detectedLanguage}:

"${reviewText}"`;

  if (isTestMode) {
    prompt += `\n\n(This is a test response to preview the brand voice settings)`;
  }

  return prompt;
}
