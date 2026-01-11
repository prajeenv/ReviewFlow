/**
 * API request and response types
 */

import type { Sentiment, Platform, SubscriptionTier } from "@/lib/constants";

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Review API types
export interface ReviewApiResponse {
  id: string;
  platform: Platform;
  reviewText: string;
  rating: number | null;
  reviewerName: string | null;
  reviewDate: string | null;
  detectedLanguage: string;
  sentiment: Sentiment | null;
  createdAt: string;
  updatedAt: string;
  response?: GeneratedResponseData | null;
}

export interface GeneratedResponseData {
  id: string;
  responseText: string;
  tone: string;
  isEdited: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// User API types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  businessName: string | null;
  tier: SubscriptionTier;
  credits: number;
  sentimentUsed: number;
  sentimentQuota: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface CreditsInfo {
  credits: number;
  tier: SubscriptionTier;
  creditsResetDate: string | null;
}

export interface SentimentUsageInfo {
  used: number;
  quota: number;
  resetDate: string | null;
}

// Brand voice API types
export interface BrandVoiceData {
  id: string;
  tone: string;
  formality: number;
  keyPhrases: string[];
  avoidPhrases: string[];
  styleNotes: string | null;
  signatureClosing: string | null;
  updatedAt: string;
}

// Credit usage API types
export interface CreditUsageEntry {
  id: string;
  creditsUsed: number;
  action: string;
  reviewId: string | null;
  details: string | null;
  createdAt: string;
}

// Auth API types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  tier: SubscriptionTier;
  emailVerified: boolean;
}

// Error codes
export const API_ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",

  // Resource errors
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  SENTIMENT_QUOTA_EXCEEDED: "SENTIMENT_QUOTA_EXCEEDED",
  REVIEW_NOT_FOUND: "REVIEW_NOT_FOUND",
  RESPONSE_NOT_FOUND: "RESPONSE_NOT_FOUND",
  DUPLICATE_REVIEW: "DUPLICATE_REVIEW",

  // Service errors
  AI_SERVICE_UNAVAILABLE: "AI_SERVICE_UNAVAILABLE",
  EMAIL_SERVICE_UNAVAILABLE: "EMAIL_SERVICE_UNAVAILABLE",

  // General errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
