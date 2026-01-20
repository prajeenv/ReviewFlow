/**
 * Database-related types
 * Re-exports Prisma-generated types with custom extensions
 */

// Re-export all Prisma-generated types
export type {
  User,
  Account,
  Session,
  VerificationToken,
  BrandVoice,
  Review,
  ReviewResponse,
  ResponseVersion,
  CreditUsage,
  SentimentUsage,
  Tier,
} from "@prisma/client";

// Import for use in custom types
import type {
  User,
  BrandVoice,
  Review,
  ReviewResponse,
  ResponseVersion,
  CreditUsage,
  SentimentUsage,
} from "@prisma/client";

// ============================================
// COMPOSITE TYPES (with relations)
// ============================================

/**
 * User with all related data
 */
export interface UserWithRelations extends User {
  brandVoice: BrandVoice | null;
  reviews: Review[];
  creditUsage: CreditUsage[];
  sentimentUsage: SentimentUsage[];
}

/**
 * User with just brand voice
 */
export interface UserWithBrandVoice extends User {
  brandVoice: BrandVoice | null;
}

/**
 * Review with its response
 */
export interface ReviewWithResponse extends Review {
  response: ReviewResponse | null;
}

/**
 * Review with response and all versions
 */
export interface ReviewWithResponseAndVersions extends Review {
  response: (ReviewResponse & {
    versions: ResponseVersion[];
  }) | null;
}

/**
 * Review with user info (for admin views)
 */
export interface ReviewWithUser extends Review {
  user: Pick<User, "id" | "email" | "name">;
}

/**
 * Full review with all relations
 */
export interface ReviewFull extends Review {
  user: Pick<User, "id" | "email" | "name">;
  response: (ReviewResponse & {
    versions: ResponseVersion[];
  }) | null;
}

// ============================================
// CREDIT/USAGE TYPES
// ============================================

/**
 * Credit usage with review context
 */
export interface CreditUsageWithReview extends CreditUsage {
  review: Pick<Review, "id" | "platform" | "reviewerName"> | null;
}

/**
 * Sentiment usage with review context
 */
export interface SentimentUsageWithReview extends SentimentUsage {
  review: Pick<Review, "id" | "platform" | "reviewerName"> | null;
}

// ============================================
// ENUMS (matching Prisma)
// ============================================

/**
 * Subscription tiers
 */
export const TierValues = {
  FREE: "FREE",
  STARTER: "STARTER",
  GROWTH: "GROWTH",
} as const;

/**
 * Supported platforms
 */
export const PlatformValues = {
  GOOGLE: "google",
  AMAZON: "amazon",
  SHOPIFY: "shopify",
  TRUSTPILOT: "trustpilot",
  FACEBOOK: "facebook",
  YELP: "yelp",
  OTHER: "other",
} as const;

export type Platform = (typeof PlatformValues)[keyof typeof PlatformValues];

/**
 * Sentiment values
 */
export const SentimentValues = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative",
} as const;

export type Sentiment = (typeof SentimentValues)[keyof typeof SentimentValues];

/**
 * Response tone values
 */
export const ToneValues = {
  DEFAULT: "default",
  PROFESSIONAL: "professional",
  FRIENDLY: "friendly",
  EMPATHETIC: "empathetic",
  FORMAL: "formal",
  CASUAL: "casual",
} as const;

export type Tone = (typeof ToneValues)[keyof typeof ToneValues];

/**
 * Credit action types
 */
export const CreditActionValues = {
  GENERATE_RESPONSE: "GENERATE_RESPONSE",
  REGENERATE: "REGENERATE",
  REFUND: "REFUND",
} as const;

export type CreditAction = (typeof CreditActionValues)[keyof typeof CreditActionValues];

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Prisma select for user public fields
 */
export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  tier: true,
  credits: true,
  creditsResetDate: true,
  sentimentCredits: true,
  sentimentResetDate: true,
  createdAt: true,
} as const;

/**
 * Type for user public data (no password)
 */
export type UserPublic = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "image"
  | "tier"
  | "credits"
  | "creditsResetDate"
  | "sentimentCredits"
  | "sentimentResetDate"
  | "createdAt"
>;

/**
 * Prisma select for review list view
 */
export const reviewListSelect = {
  id: true,
  platform: true,
  reviewText: true,
  rating: true,
  reviewerName: true,
  reviewDate: true,
  detectedLanguage: true,
  sentiment: true,
  createdAt: true,
  response: {
    select: {
      id: true,
      responseText: true,
      isEdited: true,
      isPublished: true,
      createdAt: true,
    },
  },
} as const;
