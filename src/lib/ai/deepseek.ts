/**
 * DeepSeek AI service for sentiment analysis
 * Uses the DeepSeek chat API for cost-effective sentiment classification
 */

import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export type SentimentResult = "positive" | "neutral" | "negative";

export interface SentimentAnalysisResult {
  sentiment: SentimentResult;
  confidence: number;
}

/**
 * Analyze the sentiment of a review text using DeepSeek API
 * @param reviewText - The review text to analyze
 * @returns Sentiment analysis result with classification and confidence
 */
export async function analyzeSentiment(
  reviewText: string
): Promise<SentimentAnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.warn(
      "DEEPSEEK_API_KEY not configured, using fallback sentiment analysis"
    );
    return fallbackSentimentAnalysis(reviewText);
  }

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis system. Analyze the sentiment of customer reviews and respond ONLY with one word: positive, neutral, or negative. Do not include any other text or explanation.",
          },
          {
            role: "user",
            content: `Analyze the sentiment of this review:\n\n"${reviewText}"\n\nSentiment:`,
          },
        ],
        temperature: 0.1, // Low temperature for consistent classification
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const sentimentText = response.data.choices[0].message.content
      .trim()
      .toLowerCase();

    // Validate and normalize sentiment
    let sentiment: SentimentResult;
    if (sentimentText.includes("positive")) {
      sentiment = "positive";
    } else if (sentimentText.includes("negative")) {
      sentiment = "negative";
    } else {
      sentiment = "neutral";
    }

    return {
      sentiment,
      confidence: 0.9, // DeepSeek doesn't provide confidence, use fixed value
    };
  } catch (error) {
    console.error("DeepSeek API error:", error);
    // Fall back to basic analysis on API failure
    return fallbackSentimentAnalysis(reviewText);
  }
}

/**
 * Fallback sentiment analysis using keyword matching
 * Used when DeepSeek API is unavailable or not configured
 */
function fallbackSentimentAnalysis(text: string): SentimentAnalysisResult {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveWords = [
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "perfect",
    "best",
    "awesome",
    "outstanding",
    "superb",
    "brilliant",
    "highly recommend",
    "five star",
    "5 star",
    "happy",
    "satisfied",
    "impressed",
    "thank",
    "helpful",
    "friendly",
    "professional",
  ];

  // Negative keywords
  const negativeWords = [
    "terrible",
    "awful",
    "horrible",
    "worst",
    "bad",
    "poor",
    "disappointing",
    "disappointed",
    "hate",
    "never again",
    "waste",
    "rude",
    "unprofessional",
    "scam",
    "fraud",
    "broken",
    "defective",
    "refund",
    "complaint",
    "one star",
    "1 star",
    "angry",
    "frustrated",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }

  let sentiment: SentimentResult;
  if (positiveCount > negativeCount) {
    sentiment = "positive";
  } else if (negativeCount > positiveCount) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  return {
    sentiment,
    confidence: 0.6, // Lower confidence for fallback analysis
  };
}
