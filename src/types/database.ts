/**
 * Database-related types (mirrors Prisma schema)
 * These will be replaced by Prisma-generated types after schema setup
 */

import type { Sentiment, Platform, SubscriptionTier, ResponseTone } from "@/lib/constants";

// User model
export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  businessName: string | null;
  tier: SubscriptionTier;
  credits: number;
  creditsResetDate: Date | null;
  sentimentUsed: number;
  sentimentQuota: number;
  sentimentResetDate: Date | null;
  emailVerified: Date | null;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Review model
export interface Review {
  id: string;
  userId: string;
  platform: Platform;
  reviewText: string;
  rating: number | null;
  reviewerName: string | null;
  reviewDate: Date | null;
  detectedLanguage: string;
  sentiment: Sentiment | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ReviewResponse model
export interface ReviewResponse {
  id: string;
  reviewId: string;
  responseText: string;
  tone: ResponseTone;
  isEdited: boolean;
  editedAt: Date | null;
  isApproved: boolean;
  approvedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ResponseVersion model
export interface ResponseVersion {
  id: string;
  responseId: string;
  versionNumber: number;
  responseText: string;
  tone: ResponseTone;
  createdAt: Date;
}

// BrandVoice model
export interface BrandVoice {
  id: string;
  userId: string;
  tone: string;
  formality: number;
  keyPhrases: string[];
  avoidPhrases: string[];
  styleNotes: string | null;
  signatureClosing: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// CreditUsage model
export interface CreditUsage {
  id: string;
  userId: string;
  creditsUsed: number;
  action: string;
  reviewId: string | null;
  details: string | null;
  createdAt: Date;
}

// SentimentUsage model
export interface SentimentUsage {
  id: string;
  userId: string;
  reviewId: string;
  sentiment: Sentiment;
  details: string | null;
  createdAt: Date;
}

// Account model (for OAuth)
export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

// Session model
export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

// VerificationToken model
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// Type for review with response included
export interface ReviewWithResponse extends Review {
  response: ReviewResponse | null;
}

// Type for user with brand voice
export interface UserWithBrandVoice extends User {
  brandVoice: BrandVoice | null;
}
