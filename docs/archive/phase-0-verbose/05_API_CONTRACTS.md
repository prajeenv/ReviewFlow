# API Contracts: ReviewFlow MVP Phase 1
## Complete REST API Specification

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Status:** Ready for Development  
**Base URL:** `https://api.reviewflow.com/v1`  
**API Style:** RESTful JSON

---

## Document Purpose

This document defines all API endpoints for ReviewFlow Phase 1. Use this as:
- **Single source of truth** for frontend-backend contracts
- **Implementation reference** for API development
- **Testing guide** for API validation
- **Documentation base** for API consumers

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Review Management](#review-management)
5. [Response Generation](#response-generation)
6. [Brand Voice](#brand-voice)
7. [Credit System](#credit-system)
8. [Analytics & Sentiment](#analytics--sentiment)
9. [GDPR & Data Export](#gdpr--data-export)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Webhooks (Future)](#webhooks-future)

---

## API Overview

### Design Principles

**1. RESTful Architecture**
- Resources identified by URLs
- HTTP methods indicate operations (GET, POST, PUT, DELETE)
- Stateless requests (JWT authentication)
- JSON request/response format

**2. Consistent Patterns**
```
GET    /resource         → List all
GET    /resource/:id     → Get one
POST   /resource         → Create
PUT    /resource/:id     → Update (full)
PATCH  /resource/:id     → Update (partial)
DELETE /resource/:id     → Delete
```

**3. Standard Response Format**
```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-06T14:23:00Z",
    "requestId": "req_abc123"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Review text is required",
    "details": {
      "field": "reviewText",
      "constraint": "required"
    }
  },
  "meta": {
    "timestamp": "2026-01-06T14:23:00Z",
    "requestId": "req_abc123"
  }
}
```

### Authentication

**Method:** JWT Bearer Token

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Structure:**
```typescript
{
  "userId": "user_abc123",
  "email": "user@example.com",
  "tier": "FREE",
  "iat": 1704556980,
  "exp": 1707148980  // 30 days
}
```

### Rate Limiting

**Per User:**
- 100 requests/minute (standard endpoints)
- 10 requests/minute (AI generation endpoints)
- 1 request/minute (data export)

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704556980
```

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (log and alert) |
| 503 | Service Unavailable | Maintenance or overload |

---

## Authentication

### POST /auth/signup

**Description:** Create new user account

**Authentication:** None required

**Request Body:**
```typescript
{
  "email": string,     // Required, valid email format
  "password": string,  // Required, min 8 chars
  "name"?: string      // Optional
}
```

**Validation Rules:**
```typescript
{
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128
  },
  name: {
    required: false,
    minLength: 1,
    maxLength: 100
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "FREE",
      "credits": 15,
      "sentimentQuota": 35,
      "createdAt": "2026-01-06T14:23:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-02-05T14:23:00Z"
  }
}
```

**Error Responses:**

```json
// 409 - Email already exists
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists"
  }
}

// 400 - Invalid email format
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid",
    "details": {
      "field": "email",
      "value": "not-an-email"
    }
  }
}

// 400 - Password too short
{
  "success": false,
  "error": {
    "code": "PASSWORD_TOO_SHORT",
    "message": "Password must be at least 8 characters",
    "details": {
      "field": "password",
      "minLength": 8
    }
  }
}
```

**Example cURL:**
```bash
curl -X POST https://api.reviewflow.com/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

---

### POST /auth/login

**Description:** Authenticate user and get JWT token

**Authentication:** None required

**Request Body:**
```typescript
{
  "email": string,     // Required
  "password": string   // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "FREE",
      "credits": 12,
      "sentimentQuota": 35,
      "sentimentUsed": 8
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-02-05T14:23:00Z"
  }
}
```

**Error Responses:**

```json
// 401 - Invalid credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}

// 401 - Account not verified
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in"
  }
}
```

**Rate Limiting:** 5 attempts per 15 minutes per IP

**Example cURL:**
```bash
curl -X POST https://api.reviewflow.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

---

### POST /auth/logout

**Description:** Invalidate current JWT token

**Authentication:** Required (Bearer token)

**Request Body:** None

**Success Response (204):**
```
No content
```

**Example cURL:**
```bash
curl -X POST https://api.reviewflow.com/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### POST /auth/password-reset/request

**Description:** Request password reset email

**Authentication:** None required

**Request Body:**
```typescript
{
  "email": string  // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, you will receive a password reset link"
  }
}
```

**Note:** Always returns success (security - don't reveal if email exists)

**Example cURL:**
```bash
curl -X POST https://api.reviewflow.com/v1/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### POST /auth/password-reset/confirm

**Description:** Reset password with token from email

**Authentication:** None required (token in URL)

**Request Body:**
```typescript
{
  "token": string,      // Required (from email link)
  "newPassword": string // Required, min 8 chars
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully"
  }
}
```

**Error Responses:**

```json
// 400 - Invalid or expired token
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Password reset token is invalid or expired"
  }
}
```

---

## User Management

### GET /user/profile

**Description:** Get current user profile

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "FREE",
      "credits": 12,
      "creditsTotal": 15,
      "creditsResetDate": "2026-02-01T00:00:00Z",
      "sentimentQuota": 35,
      "sentimentUsed": 8,
      "sentimentResetDate": "2026-02-01T00:00:00Z",
      "createdAt": "2025-12-15T10:30:00Z",
      "updatedAt": "2026-01-06T14:23:00Z"
    }
  }
}
```

**Example cURL:**
```bash
curl -X GET https://api.reviewflow.com/v1/user/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### PUT /user/profile

**Description:** Update user profile

**Authentication:** Required

**Request Body:**
```typescript
{
  "name"?: string,   // Optional
  "email"?: string   // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "newemail@example.com",
      "name": "Jane Doe",
      "tier": "FREE",
      "credits": 12,
      "updatedAt": "2026-01-06T14:30:00Z"
    }
  }
}
```

**Error Responses:**

```json
// 409 - Email already taken
{
  "success": false,
  "error": {
    "code": "EMAIL_TAKEN",
    "message": "This email is already registered to another account"
  }
}
```

**Example cURL:**
```bash
curl -X PUT https://api.reviewflow.com/v1/user/profile \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "newemail@example.com"
  }'
```

---

### DELETE /user/account

**Description:** Delete user account (GDPR Right to Erasure)

**Authentication:** Required

**Request Body:**
```typescript
{
  "password": string,  // Required (confirm identity)
  "confirm": boolean   // Required (must be true)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Account deletion initiated. All personal data will be removed within 30 days.",
    "deletionId": "del_abc123"
  }
}
```

**Error Responses:**

```json
// 401 - Wrong password
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Password is incorrect"
  }
}

// 400 - Confirmation not provided
{
  "success": false,
  "error": {
    "code": "CONFIRMATION_REQUIRED",
    "message": "You must confirm account deletion"
  }
}
```

**Example cURL:**
```bash
curl -X DELETE https://api.reviewflow.com/v1/user/account \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "password": "securepass123",
    "confirm": true
  }'
```

---

## Review Management

### POST /reviews

**Description:** Add a new review manually

**Authentication:** Required

**Request Body:**
```typescript
{
  "platform": string,        // Required: "google" | "amazon" | "shopify" | "trustpilot" | "other"
  "reviewText": string,      // Required, 1-2000 chars
  "rating"?: number,         // Optional, 1-5
  "reviewerName"?: string,   // Optional
  "reviewDate"?: string,     // Optional, ISO 8601 format
  "externalId"?: string,     // Optional, ID from source platform
  "externalUrl"?: string     // Optional, link to original review
}
```

**Validation Rules:**
```typescript
{
  platform: {
    required: true,
    enum: ["google", "amazon", "shopify", "trustpilot", "facebook", "yelp", "other"]
  },
  reviewText: {
    required: true,
    minLength: 1,
    maxLength: 2000,
    trim: true
  },
  rating: {
    required: false,
    min: 1,
    max: 5,
    integer: true
  },
  reviewerName: {
    required: false,
    maxLength: 100
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "rev_abc123",
      "userId": "user_abc123",
      "platform": "google",
      "reviewText": "Great service! Very happy with the experience.",
      "rating": 5,
      "reviewerName": "John S.",
      "detectedLanguage": "English",
      "sentiment": "positive",
      "createdAt": "2026-01-06T14:23:00Z"
    },
    "sentimentQuotaRemaining": 34
  }
}
```

**Error Responses:**

```json
// 400 - Review text too long
{
  "success": false,
  "error": {
    "code": "TEXT_TOO_LONG",
    "message": "Review text cannot exceed 2000 characters",
    "details": {
      "field": "reviewText",
      "maxLength": 2000,
      "actualLength": 2150
    }
  }
}

// 400 - Invalid rating
{
  "success": false,
  "error": {
    "code": "INVALID_RATING",
    "message": "Rating must be between 1 and 5",
    "details": {
      "field": "rating",
      "value": 6
    }
  }
}

// 429 - Sentiment quota exceeded
{
  "success": false,
  "error": {
    "code": "SENTIMENT_QUOTA_EXCEEDED",
    "message": "Monthly sentiment analysis quota exceeded",
    "details": {
      "quotaUsed": 35,
      "quotaTotal": 35,
      "resetDate": "2026-02-01T00:00:00Z"
    }
  }
}
```

**Example cURL:**
```bash
curl -X POST https://api.reviewflow.com/v1/reviews \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google",
    "reviewText": "Great service! Very happy with the experience.",
    "rating": 5,
    "reviewerName": "John S."
  }'
```

**Implementation Notes:**

Sentiment analysis is automatically performed when a review is added:

```typescript
// Backend implementation
async function createReview(userId: string, reviewData: any) {
  await prisma.$transaction(async (tx) => {
    // 1. Create review
    const review = await tx.review.create({ data: reviewData });
    
    // 2. Check sentiment quota
    const user = await tx.user.findUnique({ where: { id: userId } });
    
    if (user.sentimentUsed < user.sentimentQuota) {
      // 3. Analyze sentiment (DeepSeek API)
      const sentiment = await analyzeSentiment(review.reviewText);
      
      // 4. Update review
      await tx.review.update({
        where: { id: review.id },
        data: { sentiment }
      });
      
      // 5. Increment counter
      await tx.user.update({
        where: { id: userId },
        data: { sentimentUsed: { increment: 1 } }
      });
      
      // 6. Log sentiment usage (fraud prevention audit trail)
      await tx.sentimentUsage.create({
        data: {
          userId,
          reviewId: review.id,
          sentiment,
          details: JSON.stringify({
            platform: review.platform,
            rating: review.rating,
            preview: review.reviewText.substring(0, 100),
            analyzedAt: new Date()
          })
        }
      });
    }
    // If quota exceeded, sentiment remains null
  });
}
```

**Why Log Sentiment Usage:**
- Prevents fraud (user can't delete reviews and claim "I never used quota")
- Audit trail survives review deletion (like credit usage)
- Shows what was analyzed even if review deleted
- GDPR compliant (snapshots anonymized on account deletion)

---

### GET /reviews

**Description:** List all reviews for current user

**Authentication:** Required

**Query Parameters:**
```typescript
{
  page?: number,        // Default: 1
  perPage?: number,     // Default: 20, max: 100
  platform?: string,    // Filter by platform
  sentiment?: string,   // Filter by sentiment: "positive" | "neutral" | "negative"
  hasResponse?: boolean, // Filter: true (with response) | false (without)
  sortBy?: string,      // "createdAt" | "rating" | "sentiment"
  sortOrder?: string    // "asc" | "desc" (default: desc)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_abc123",
        "platform": "google",
        "reviewText": "Great service! Very happy...",
        "rating": 5,
        "sentiment": "positive",
        "detectedLanguage": "English",
        "hasResponse": true,
        "createdAt": "2026-01-06T14:23:00Z"
      },
      {
        "id": "rev_def456",
        "platform": "amazon",
        "reviewText": "Product arrived damaged...",
        "rating": 1,
        "sentiment": "negative",
        "detectedLanguage": "English",
        "hasResponse": false,
        "createdAt": "2026-01-05T10:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Example cURL:**
```bash
# Get all reviews
curl -X GET https://api.reviewflow.com/v1/reviews \
  -H "Authorization: Bearer eyJhbGc..."

# Get negative reviews without responses
curl -X GET "https://api.reviewflow.com/v1/reviews?sentiment=negative&hasResponse=false" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### GET /reviews/:id

**Description:** Get single review with response (if exists)

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "rev_abc123",
      "platform": "google",
      "reviewText": "Great service! Very happy with the experience.",
      "rating": 5,
      "reviewerName": "John S.",
      "reviewDate": "2026-01-05T00:00:00Z",
      "detectedLanguage": "English",
      "sentiment": "positive",
      "externalId": "ChZDSUhNMG9nS0VJQ0FnSURGd...",
      "externalUrl": "https://g.co/kgs/...",
      "createdAt": "2026-01-06T14:23:00Z",
      "response": {
        "id": "res_xyz789",
        "responseText": "Thank you so much for the wonderful feedback!",
        "toneUsed": "friendly",
        "creditsUsed": 1,
        "isEdited": false,
        "isPublished": true,
        "publishedAt": "2026-01-06T14:30:00Z",
        "createdAt": "2026-01-06T14:25:00Z"
      }
    }
  }
}
```

**Error Responses:**

```json
// 404 - Review not found or not owned by user
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review not found"
  }
}
```

**Example cURL:**
```bash
curl -X GET https://api.reviewflow.com/v1/reviews/rev_abc123 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### PUT /reviews/:id

**Description:** Update review text (before generating response)

**Authentication:** Required

**Request Body:**
```typescript
{
  "reviewText": string,  // Required, 1-2000 chars
  "rating"?: number      // Optional, 1-5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "rev_abc123",
      "reviewText": "Updated review text...",
      "rating": 4,
      "updatedAt": "2026-01-06T15:00:00Z"
    }
  }
}
```

**Error Responses:**

```json
// 403 - Review has response (cannot edit)
{
  "success": false,
  "error": {
    "code": "REVIEW_HAS_RESPONSE",
    "message": "Cannot edit review after response has been generated. Delete response first."
  }
}
```

---

### DELETE /reviews/:id

**Description:** Delete review (and cascade delete response)

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Review deleted successfully",
    "creditsRefunded": 0
  }
}
```

**Note:** Credits are NOT refunded when review is deleted

**Example cURL:**
```bash
curl -X DELETE https://api.reviewflow.com/v1/reviews/rev_abc123 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Response Generation

### POST /reviews/:id/response

**Description:** Generate AI response for a review

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Request Body:**
```typescript
{
  "toneModifier"?: string  // Optional: "more_friendly" | "more_professional" | "more_apologetic" | "more_enthusiastic"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "res_xyz789",
      "reviewId": "rev_abc123",
      "responseText": "Thank you so much for the wonderful feedback! We're thrilled to hear you had a great experience.",
      "toneUsed": "friendly",
      "creditsUsed": 1,
      "isEdited": false,
      "isPublished": false,
      "createdAt": "2026-01-06T14:25:00Z"
    },
    "creditsRemaining": 11
  }
}
```

**Error Responses:**

```json
// 403 - Insufficient credits
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Not enough credits to generate response",
    "details": {
      "creditsAvailable": 0,
      "creditsRequired": 1,
      "resetDate": "2026-02-01T00:00:00Z"
    }
  }
}

// 409 - Response already exists
{
  "success": false,
  "error": {
    "code": "RESPONSE_EXISTS",
    "message": "A response already exists for this review. Use regenerate endpoint instead."
  }
}

// 429 - Rate limit exceeded
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many generation requests. Please wait 60 seconds."
  }
}

// 500 - AI API error (with refund)
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate response. Your credit has been refunded.",
    "details": {
      "reason": "API_TIMEOUT",
      "creditRefunded": true
    }
  }
}
```

**Example cURL:**
```bash
# Generate with default tone
curl -X POST https://api.reviewflow.com/v1/reviews/rev_abc123/response \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{}'

# Generate with tone modifier
curl -X POST https://api.reviewflow.com/v1/reviews/rev_abc123/response \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "toneModifier": "more_apologetic"
  }'
```

---

### POST /reviews/:id/response/regenerate

**Description:** Regenerate AI response with different tone

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Request Body:**
```typescript
{
  "toneModifier"?: string  // Optional tone modifier
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "res_xyz789",
      "reviewId": "rev_abc123",
      "responseText": "We're incredibly grateful for your kind words! Thank you for choosing us.",
      "toneUsed": "more_enthusiastic",
      "creditsUsed": 2,
      "versionNumber": 2,
      "isEdited": false,
      "isPublished": false,
      "createdAt": "2026-01-06T14:25:00Z",
      "updatedAt": "2026-01-06T14:28:00Z"
    },
    "creditsRemaining": 10,
    "previousVersions": [
      {
        "versionNumber": 1,
        "responseText": "Thank you so much for the wonderful feedback!",
        "toneUsed": "friendly",
        "createdAt": "2026-01-06T14:25:00Z"
      }
    ]
  }
}
```

**Error Responses:**

```json
// 404 - No response exists yet
{
  "success": false,
  "error": {
    "code": "NO_RESPONSE_EXISTS",
    "message": "No response exists for this review. Use generate endpoint first."
  }
}

// 403 - Insufficient credits
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Not enough credits to regenerate response"
  }
}
```

---

### PUT /reviews/:id/response

**Description:** Manually edit AI-generated response

**Authentication:** Required

**Request Body:**
```typescript
{
  "responseText": string  // Required, 1-500 chars
}
```

**Validation Rules:**
```typescript
{
  responseText: {
    required: true,
    minLength: 1,
    maxLength: 500,
    trim: true
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "res_xyz789",
      "responseText": "Thank you! We appreciate your feedback and hope to see you again soon.",
      "isEdited": true,
      "editedAt": "2026-01-06T14:35:00Z"
    }
  }
}
```

**Note:** Editing does NOT cost additional credits

**Example cURL:**
```bash
curl -X PUT https://api.reviewflow.com/v1/reviews/rev_abc123/response \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "responseText": "Thank you! We appreciate your feedback."
  }'
```

---

### POST /reviews/:id/response/approve

**Description:** Mark response as approved/published

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "res_xyz789",
      "isPublished": true,
      "publishedAt": "2026-01-06T14:40:00Z"
    }
  }
}
```

---

### DELETE /reviews/:id/response

> **DEPRECATED (January 18, 2026):** This endpoint was removed. Users can regenerate responses instead. Kept for historical reference only.

**Description:** Delete response only (keep review)

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Response deleted successfully",
    "creditsRefunded": 0
  }
}
```

**Note:** Credits are NOT refunded when response is deleted

**Example cURL:**
```bash
curl -X DELETE https://api.reviewflow.com/v1/reviews/rev_abc123/response \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Brand Voice

### GET /brand-voice

**Description:** Get user's brand voice settings

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "brandVoice": {
      "id": "bv_abc123",
      "userId": "user_abc123",
      "tone": "professional",
      "formality": 3,
      "keyPhrases": [
        "Thank you for your feedback",
        "We appreciate your business"
      ],
      "styleNotes": "Be warm but professional. Avoid slang.",
      "sampleResponses": [
        "Thank you for the wonderful review! We're delighted to hear...",
        "We appreciate your feedback and apologize for any inconvenience..."
      ],
      "createdAt": "2025-12-15T10:30:00Z",
      "updatedAt": "2026-01-06T14:00:00Z"
    }
  }
}
```

**Error Responses:**

```json
// 404 - No brand voice set yet
{
  "success": false,
  "error": {
    "code": "NO_BRAND_VOICE",
    "message": "Brand voice not configured yet"
  }
}
```

---

### PUT /brand-voice

**Description:** Create or update brand voice settings

**Authentication:** Required

**Request Body:**
```typescript
{
  "tone": string,           // Required: "friendly" | "professional" | "casual" | "formal"
  "formality": number,      // Required: 1-5 (1=casual, 5=formal)
  "keyPhrases"?: string[],  // Optional, max 20 phrases
  "styleNotes"?: string,    // Optional, max 500 chars
  "sampleResponses"?: string[] // Optional, max 5 samples
}
```

**Validation Rules:**
```typescript
{
  tone: {
    required: true,
    enum: ["friendly", "professional", "casual", "formal"]
  },
  formality: {
    required: true,
    min: 1,
    max: 5,
    integer: true
  },
  keyPhrases: {
    required: false,
    maxItems: 20,
    itemMaxLength: 50
  },
  styleNotes: {
    required: false,
    maxLength: 500
  },
  sampleResponses: {
    required: false,
    maxItems: 5,
    itemMaxLength: 500
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "brandVoice": {
      "id": "bv_abc123",
      "tone": "friendly",
      "formality": 2,
      "keyPhrases": ["Thanks so much", "We love hearing from you"],
      "styleNotes": "Casual and warm, like talking to a friend",
      "updatedAt": "2026-01-06T15:00:00Z"
    }
  }
}
```

**Example cURL:**
```bash
curl -X PUT https://api.reviewflow.com/v1/brand-voice \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "tone": "friendly",
    "formality": 2,
    "keyPhrases": ["Thanks so much", "We love hearing from you"],
    "styleNotes": "Casual and warm, like talking to a friend"
  }'
```

---

## Credit System

### GET /credits/balance

**Description:** Get current credit balance and quota info

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "credits": {
      "available": 12,
      "total": 15,
      "used": 3,
      "resetDate": "2026-02-01T00:00:00Z"
    },
    "sentiment": {
      "available": 27,
      "total": 35,
      "used": 8,
      "resetDate": "2026-02-01T00:00:00Z"
    },
    "tier": "FREE"
  }
}
```

---

### GET /credits/usage

**Description:** Get paginated credit usage history

**Authentication:** Required

**Query Parameters:**
```typescript
{
  page?: number,      // Default: 1
  perPage?: number,   // Default: 20, max: 100
  action?: string,    // Filter: "GENERATE_RESPONSE" | "REGENERATE" | "REFUND"
  startDate?: string, // ISO 8601 format
  endDate?: string    // ISO 8601 format
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "usage": [
      {
        "id": "cu_abc123",
        "action": "GENERATE_RESPONSE",
        "creditsUsed": 1,
        "createdAt": "2026-01-06T14:25:00Z",
        "review": {
          "id": "rev_abc123",
          "preview": "Great service! Very happy...",
          "platform": "google",
          "rating": 5,
          "status": "active"
        },
        "response": {
          "preview": "Thank you so much for the wonderful...",
          "tone": "friendly",
          "status": "active"
        }
      },
      {
        "id": "cu_def456",
        "action": "REGENERATE",
        "creditsUsed": 1,
        "createdAt": "2026-01-06T14:28:00Z",
        "review": {
          "id": "rev_abc123",
          "preview": "Great service! Very happy...",
          "platform": "google",
          "rating": 5,
          "status": "active"
        },
        "response": {
          "preview": "We're incredibly grateful for your...",
          "tone": "more_enthusiastic",
          "status": "active"
        }
      },
      {
        "id": "cu_ghi789",
        "action": "GENERATE_RESPONSE",
        "creditsUsed": 1,
        "createdAt": "2026-01-05T10:15:00Z",
        "review": {
          "id": null,
          "preview": "Terrible service! Manager [NAME]...",
          "platform": "amazon",
          "rating": 1,
          "status": "deleted"
        },
        "response": {
          "preview": "We sincerely apologize...",
          "tone": "apologetic",
          "status": "deleted"
        },
        "isAnonymized": false
      },
      {
        "id": "cu_jkl012",
        "action": "REFUND",
        "creditsUsed": -1,
        "createdAt": "2026-01-04T09:20:00Z",
        "review": null,
        "response": null,
        "details": {
          "reason": "API_ERROR"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 48,
      "totalPages": 3
    },
    "summary": {
      "totalCreditsUsed": 51,
      "totalCreditsRefunded": 3,
      "netCreditsUsed": 48
    }
  }
}
```

**Example cURL:**
```bash
# Get all usage
curl -X GET https://api.reviewflow.com/v1/credits/usage \
  -H "Authorization: Bearer eyJhbGc..."

# Get only regenerations
curl -X GET "https://api.reviewflow.com/v1/credits/usage?action=REGENERATE" \
  -H "Authorization: Bearer eyJhbGc..."

# Get usage for date range
curl -X GET "https://api.reviewflow.com/v1/credits/usage?startDate=2026-01-01&endDate=2026-01-07" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### GET /credits/sentiment-usage

**Description:** Get paginated sentiment analysis usage history

**Authentication:** Required

**Query Parameters:**
```typescript
{
  page?: number,      // Default: 1
  perPage?: number,   // Default: 20, max: 100
  sentiment?: string, // Filter: "positive" | "neutral" | "negative"
  startDate?: string, // ISO 8601 format
  endDate?: string    // ISO 8601 format
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "usage": [
      {
        "id": "su_abc123",
        "sentiment": "positive",
        "createdAt": "2026-01-06T14:23:00Z",
        "review": {
          "id": "rev_abc123",
          "preview": "Great service! Very happy...",
          "platform": "google",
          "rating": 5,
          "status": "active"
        }
      },
      {
        "id": "su_def456",
        "sentiment": "negative",
        "createdAt": "2026-01-05T10:15:00Z",
        "review": {
          "id": null,
          "preview": "Terrible service! Manager...",
          "platform": "amazon",
          "rating": 1,
          "status": "deleted"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 28,
      "totalPages": 2
    },
    "summary": {
      "totalAnalyzed": 28,
      "positive": 18,
      "neutral": 5,
      "negative": 5,
      "quotaUsed": 28,
      "quotaTotal": 35,
      "quotaRemaining": 7
    }
  }
}
```

**Example cURL:**
```bash
# Get all sentiment usage
curl -X GET https://api.reviewflow.com/v1/credits/sentiment-usage \
  -H "Authorization: Bearer eyJhbGc..."

# Get only negative sentiments
curl -X GET "https://api.reviewflow.com/v1/credits/sentiment-usage?sentiment=negative" \
  -H "Authorization: Bearer eyJhbGc..."

# Get usage for date range
curl -X GET "https://api.reviewflow.com/v1/credits/sentiment-usage?startDate=2026-01-01&endDate=2026-01-07" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Implementation Notes:**

Similar to credit usage, sentiment usage is logged for fraud prevention:

```typescript
// Backend query
async function getSentimentUsage(
  userId: string,
  filters: { page?: number; sentiment?: string; /* ... */ }
) {
  const usage = await prisma.sentimentUsage.findMany({
    where: {
      userId,
      sentiment: filters.sentiment,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate
      }
    },
    include: {
      review: {
        select: {
          id: true,
          reviewText: true,
          platform: true,
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (filters.page - 1) * filters.perPage,
    take: filters.perPage
  });
  
  // Parse details field for deleted reviews
  return usage.map(record => {
    const details = record.details ? JSON.parse(record.details) : {};
    
    return {
      id: record.id,
      sentiment: record.sentiment,
      createdAt: record.createdAt,
      review: record.review ? {
        id: record.review.id,
        preview: record.review.reviewText.substring(0, 50),
        platform: record.review.platform,
        rating: record.review.rating,
        status: 'active'
      } : {
        id: null,
        preview: details.preview || '[Review deleted]',
        platform: details.platform || 'unknown',
        rating: details.rating || null,
        status: 'deleted'
      }
    };
  });
}
```

**Why Track Sentiment Usage:**
- Prevent quota fraud (users deleting reviews to "get quota back")
- Audit trail survives review deletion
- Shows what was analyzed even if review deleted
- Evidence for dispute resolution

---

## Analytics & Sentiment

### GET /analytics/summary

**Description:** Get analytics summary for dashboard

**Authentication:** Required

**Query Parameters:**
```typescript
{
  period?: string  // "week" | "month" | "all" (default: "month")
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "reviews": {
      "total": 45,
      "withResponses": 32,
      "responseRate": 71.1
    },
    "sentiment": {
      "positive": 28,
      "neutral": 10,
      "negative": 7
    },
    "platforms": {
      "google": 20,
      "amazon": 15,
      "shopify": 10
    },
    "averageRating": 4.2,
    "creditsUsed": 38,
    "topReviewers": [
      {
        "name": "John S.",
        "count": 3
      }
    ]
  }
}
```

---

## GDPR & Data Export

### GET /user/export

**Description:** Export all user data (GDPR Right of Access)

**Authentication:** Required

**Rate Limit:** 1 request/minute

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "FREE",
      "credits": 12,
      "sentimentQuota": 35,
      "sentimentUsed": 8,
      "createdAt": "2025-12-15T10:30:00Z"
    },
    "reviews": [
      {
        "id": "rev_abc123",
        "platform": "google",
        "reviewText": "Great service!",
        "rating": 5,
        "sentiment": "positive",
        "createdAt": "2026-01-06T14:23:00Z",
        "response": {
          "responseText": "Thank you!",
          "isPublished": true
        }
      }
    ],
    "brandVoice": {
      "tone": "professional",
      "formality": 3
    },
    "creditUsage": [
      {
        "action": "GENERATE_RESPONSE",
        "creditsUsed": 1,
        "createdAt": "2026-01-06T14:25:00Z"
      }
    ],
    "sentimentUsage": [
      {
        "sentiment": "positive",
        "createdAt": "2026-01-06T14:23:00Z"
      }
    ],
    "exportedAt": "2026-01-06T16:00:00Z"
  }
}
```

**Response Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="reviewflow-data-2026-01-06.json"
```

**Example cURL:**
```bash
curl -X GET https://api.reviewflow.com/v1/user/export \
  -H "Authorization: Bearer eyJhbGc..." \
  -o reviewflow-export.json
```

---

## Error Handling

### Standard Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": string,      // Machine-readable error code
    "message": string,   // Human-readable message
    "details"?: object   // Additional context (optional)
  },
  "meta": {
    "timestamp": string,
    "requestId": string
  }
}
```

### Error Code Categories

**Authentication Errors (401):**
- `INVALID_TOKEN` - JWT token invalid or expired
- `INVALID_CREDENTIALS` - Email or password incorrect
- `EMAIL_NOT_VERIFIED` - Account not verified

**Authorization Errors (403):**
- `INSUFFICIENT_CREDITS` - Not enough credits
- `INSUFFICIENT_PERMISSIONS` - Action not allowed for tier
- `REVIEW_HAS_RESPONSE` - Cannot edit review with response

**Validation Errors (400, 422):**
- `INVALID_INPUT` - General validation error
- `TEXT_TOO_LONG` - Input exceeds max length
- `INVALID_EMAIL` - Email format invalid
- `PASSWORD_TOO_SHORT` - Password too short
- `INVALID_RATING` - Rating not 1-5

**Resource Errors (404, 409):**
- `REVIEW_NOT_FOUND` - Review doesn't exist
- `EMAIL_EXISTS` - Email already registered
- `RESPONSE_EXISTS` - Response already generated
- `NO_RESPONSE_EXISTS` - No response to regenerate

**Rate Limiting (429):**
- `RATE_LIMIT_EXCEEDED` - Too many requests

**Server Errors (500, 503):**
- `GENERATION_FAILED` - AI generation error (credit refunded)
- `DATABASE_ERROR` - Database operation failed
- `SERVICE_UNAVAILABLE` - Temporary outage

---

## Rate Limiting

### Limits by Endpoint Category

| Category | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Standard CRUD | 100 requests | 1 minute |
| AI Generation | 10 requests | 1 minute |
| Data Export | 1 request | 1 minute |
| Analytics | 20 requests | 1 minute |

### Rate Limit Headers

**Every Response Includes:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704557040
```

**When Limit Exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 45 seconds.",
    "details": {
      "limit": 10,
      "window": 60,
      "retryAfter": 45
    }
  }
}
```

**Response Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704557040
Retry-After: 45
```

---

## Webhooks (Future)

**Note:** Webhooks are planned for Phase 2+

**Planned Events:**
- `review.created` - New review added
- `response.generated` - AI response generated
- `response.approved` - Response published
- `credits.low` - Credits below threshold (3 remaining)
- `credits.depleted` - No credits remaining
- `subscription.updated` - Tier changed

**Webhook Payload Example:**
```json
{
  "event": "response.generated",
  "timestamp": "2026-01-06T14:25:00Z",
  "data": {
    "reviewId": "rev_abc123",
    "responseId": "res_xyz789",
    "creditsUsed": 1
  }
}
```

---

## Testing

### Postman Collection

**Available at:** `/docs/postman/reviewflow-api-v1.json`

**Includes:**
- All endpoints with examples
- Pre-configured environment variables
- Authentication flow
- Error scenario tests

### Sandbox Environment

**Base URL:** `https://api-sandbox.reviewflow.com/v1`

**Features:**
- Separate database (test data)
- No credit costs (unlimited generation)
- No rate limiting
- Reset daily at 00:00 UTC

**Test Credentials:**
```
Email: test@reviewflow.com
Password: testpassword123
```

---

## Changelog

### Version 1.0 (January 6, 2026)
- Initial API specification
- Core endpoints: Auth, Reviews, Responses, Credits
- GDPR compliance endpoints
- Rate limiting defined
- Error codes standardized

---

**Document Status:** ✅ READY FOR DEVELOPMENT

**Usage:**
- Frontend developers: Use this as API contract reference
- Backend developers: Implement these exact endpoints
- QA team: Test against these specifications
- Documentation: Generate OpenAPI/Swagger from this

**Next Steps:**
1. Implement authentication endpoints
2. Set up rate limiting middleware
3. Create error handler middleware
4. Implement CRUD endpoints
5. Integrate Claude API for generation
6. Add comprehensive API tests

**Next Document:** 06_SECURITY_PRIVACY.md (Security implementation details)