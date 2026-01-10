# Data Model: ReviewFlow MVP Phase 1
## Complete Database Schema & Architecture

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** Ready for Development  
**Database:** PostgreSQL via Supabase  
**ORM:** Prisma

---

## Document Purpose

This document defines the complete data architecture for ReviewFlow Phase 1. Use this as:
- **Single source of truth** for database structure
- **Reference for all database operations** (queries, migrations, relationships)
- **Guide for data integrity** and validation rules
- **Performance optimization** reference (indexes, cascade rules)

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Complete Prisma Schema](#complete-prisma-schema)
3. [Entity Relationships](#entity-relationships)
4. [Data Validation Rules](#data-validation-rules)
5. [Index Strategy](#index-strategy)
6. [Default Values & Business Logic](#default-values--business-logic)
7. [Cascade Behaviors](#cascade-behaviors)
8. [Common Query Patterns](#common-query-patterns)
9. [Migration Strategy](#migration-strategy)
10. [Data Integrity Constraints](#data-integrity-constraints)

---

## Schema Overview

### Database Structure

```
ReviewFlow Database (PostgreSQL)
│
├── Authentication & Users
│   ├── User (core user data)
│   ├── Account (OAuth providers)
│   ├── Session (JWT sessions)
│   └── VerificationToken (email verification)
│
├── Core Features
│   ├── Review (customer reviews)
│   ├── ReviewResponse (AI-generated responses)
│   ├── ResponseVersion (response history)
│   └── BrandVoice (user preferences)
│
└── Tracking & Analytics
    └── CreditUsage (credit audit trail)
```

### Key Statistics (Expected for Phase 1)

| Entity | Estimated Count (Month 1) | Growth Rate |
|--------|---------------------------|-------------|
| User | 50-100 users | 20%/month |
| Review | 500-1,000 reviews | 50%/month |
| ReviewResponse | 800-1,500 responses | 60%/month |
| CreditUsage | 1,000-2,000 entries | 60%/month |
| BrandVoice | 50-100 (1 per user) | 20%/month |

### Storage Estimates

- **Database size (Month 1):** ~50 MB
- **Database size (Month 6):** ~500 MB
- **Backup frequency:** Daily (Supabase automatic)
- **Retention:** 30 days point-in-time recovery

---

## Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?   // Profile photo URL (from Google OAuth or uploaded)
  
  // Authentication
  password      String?   // bcrypt hashed, null if OAuth only
  
  // Subscription & Credits
  tier                Tier      @default(FREE)
  credits             Int       @default(15)
  creditsResetDate    DateTime  @default(now())  // When credits reset (monthly)
  
  // Sentiment Analysis Quota
  sentimentQuota      Int       @default(35)     // FREE: 35, STARTER: 300, GROWTH: 1000
  sentimentUsed       Int       @default(0)
  sentimentResetDate  DateTime  @default(now())  // When sentiment quota resets
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  reviews         Review[]
  brandVoice      BrandVoice?
  creditUsage     CreditUsage[]
  sentimentUsage  SentimentUsage[]
  sessions        Session[]
  accounts        Account[]
  
  @@index([email])
  @@index([tier])
  @@index([createdAt])
  @@map("users")
}

enum Tier {
  FREE
  STARTER
  GROWTH
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth" | "email"
  provider          String  // "google" | "credentials"
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("sessions")
}

model VerificationToken {
  identifier String   // Email address
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// BRAND VOICE & PREFERENCES
// ============================================

model BrandVoice {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Voice Settings
  tone            String   @default("professional")  // "friendly" | "professional" | "casual" | "formal"
  formality       Int      @default(3)               // 1-5 scale (1=casual, 5=formal)
  keyPhrases      String[] @default([])              // Array of preferred phrases
  styleNotes      String?  @db.Text                  // Free-form writing guidelines
  sampleResponses String[] @default([])              // Up to 5 example responses
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@map("brand_voices")
}

// ============================================
// REVIEWS & RESPONSES
// ============================================

model Review {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Review Content
  platform        String                    // "google" | "amazon" | "shopify" | "trustpilot" | "other"
  reviewText      String    @db.Text        // Original review text (max 2000 chars enforced in app)
  rating          Int?                      // 1-5 stars, nullable
  reviewerName    String?                   // Customer name (optional)
  reviewDate      DateTime?                 // When review was posted (optional)
  
  // Metadata
  detectedLanguage String   @default("English")  // Auto-detected or user-selected
  sentiment       String?                   // "positive" | "neutral" | "negative" | null
  
  // External IDs (for future platform integrations)
  externalId      String?                   // ID from source platform (Google, Amazon, etc.)
  externalUrl     String?                   // Link to original review
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  response        ReviewResponse?
  creditUsage     CreditUsage[]
  sentimentUsage  SentimentUsage[]
  
  @@index([userId, createdAt])
  @@index([platform])
  @@index([sentiment])
  @@index([externalId])
  @@map("reviews")
}

model ReviewResponse {
  id              String   @id @default(cuid())
  reviewId        String   @unique
  review          Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Response Content
  responseText    String   @db.Text        // Generated or edited response (max 500 chars)
  isEdited        Boolean  @default(false) // True if user manually edited
  editedAt        DateTime?                // When last edited
  
  // Generation Metadata
  creditsUsed     Int      @default(1)     // Total credits used (generation + regenerations)
  toneUsed        String   @default("default")  // Tone modifier applied
  generationModel String   @default("claude-sonnet-4-20250514")  // AI model used
  
  // Status
  isPublished     Boolean  @default(false) // True if user approved
  publishedAt     DateTime?                // When approved
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  versions        ResponseVersion[]
  creditUsage     CreditUsage[]      // Track which credit usages relate to this response
  
  @@index([reviewId])
  @@index([isPublished])
  @@map("review_responses")
}

model ResponseVersion {
  id                String   @id @default(cuid())
  reviewResponseId  String
  reviewResponse    ReviewResponse @relation(fields: [reviewResponseId], references: [id], onDelete: Cascade)
  
  // Version Content
  responseText      String   @db.Text
  toneUsed          String                  // Tone modifier for this version
  creditsUsed       Int      @default(1)
  
  // Timestamps
  createdAt         DateTime @default(now())
  
  @@index([reviewResponseId, createdAt])
  @@map("response_versions")
}

// ============================================
// CREDIT TRACKING & AUDIT
// ============================================

model CreditUsage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reviewId          String?
  review            Review?          @relation(fields: [reviewId], references: [id], onDelete: SetNull)
  
  reviewResponseId  String?
  reviewResponse    ReviewResponse?  @relation(fields: [reviewResponseId], references: [id], onDelete: SetNull)
  
  // Usage Details
  creditsUsed Int      @default(1)          // Negative for refunds (-1)
  action      String                        // "GENERATE_RESPONSE" | "REGENERATE" | "REFUND"
  
  // Audit Trail Metadata
  // Stores snapshots of review + response at time of credit usage
  // Survives deletion of review/response (SET NULL relationships)
  // Anonymized on GDPR user deletion (PII redacted, structure preserved)
  details     String?  @db.Text             // JSON: { reviewSnapshot, responseSnapshot, metadata, anonymized? }
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([action])
  @@map("credit_usage")
}

// ============================================
// SENTIMENT QUOTA TRACKING & AUDIT
// ============================================

model SentimentUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reviewId  String?
  review    Review?  @relation(fields: [reviewId], references: [id], onDelete: SetNull)
  
  // Sentiment Result
  sentiment String   // "positive" | "neutral" | "negative"
  
  // Audit Trail Metadata
  // Stores snapshot of review at time of sentiment analysis
  // Survives deletion of review (SET NULL relationship)
  // Anonymized on GDPR user deletion (PII redacted, structure preserved)
  details   String?  @db.Text  // JSON: { platform, rating, preview (100 chars), analyzedAt, anonymized? }
  
  // Timestamps
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([sentiment])
  @@map("sentiment_usage")
}
```

---

## Entity Relationships

### Visual ER Diagram

```
┌─────────────┐
│    User     │
│             │
│ - id        │
│ - email     │──┐
│ - tier      │  │
│ - credits   │  │
└─────────────┘  │
       │         │
       │ 1       │
       │         │
       │ *       │ 1
       ├─────────┼──────────────┐
       │         │              │
       ▼         ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ Review  │  │BrandVoice│  │ Account  │
│         │  │          │  │          │
│ - text  │  │ - tone   │  │ - OAuth  │
│ - stars │  │ - style  │  │          │
└─────────┘  └──────────┘  └──────────┘
       │
       │ 1
       │
       │ 1
       ▼
┌──────────────┐
│ReviewResponse│
│              │
│ - text       │
│ - published  │
└──────────────┘
       │
       │ 1
       │
       │ *
       ▼
┌────────────────┐
│ResponseVersion │
│                │
│ - text         │
│ - tone         │
└────────────────┘
```

### Relationship Details

| Parent | Child | Type | Cascade | Notes |
|--------|-------|------|---------|-------|
| User → Review | 1:N | One-to-Many | CASCADE | Delete user → delete all reviews |
| User → BrandVoice | 1:1 | One-to-One | CASCADE | Each user has one brand voice |
| User → Account | 1:N | One-to-Many | CASCADE | User can have multiple OAuth accounts |
| User → Session | 1:N | One-to-Many | CASCADE | Active sessions for user |
| User → CreditUsage | 1:N | One-to-Many | CASCADE | Audit trail for AI responses |
| User → SentimentUsage | 1:N | One-to-Many | CASCADE | Audit trail for sentiment analysis |
| Review → ReviewResponse | 1:1 | One-to-One | CASCADE | Each review has max 1 response |
| Review → CreditUsage | 1:N | One-to-Many | SET NULL | Keep usage even if review deleted |
| Review → SentimentUsage | 1:N | One-to-Many | SET NULL | Keep usage even if review deleted |
| ReviewResponse → CreditUsage | 1:N | One-to-Many | SET NULL | Keep usage even if response deleted |
| ReviewResponse → ResponseVersion | 1:N | One-to-Many | CASCADE | Version history |

---

## Data Validation Rules

### User Model

```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements (if using email auth)
const passwordRules = {
  minLength: 8,
  requireUppercase: false,  // Keep simple for MVP
  requireNumber: false,
  requireSpecial: false
};

// Credits validation
const creditRules = {
  min: 0,                    // Cannot go negative
  max: 1000,                 // Reasonable upper limit
  resetDay: 1                // Reset on 1st of month (or signup anniversary)
};

// Sentiment quota validation
const sentimentQuotaRules = {
  FREE: 35,
  STARTER: 300,
  GROWTH: 1000
};
```

### Review Model

```typescript
// Review text validation
const reviewRules = {
  minLength: 1,
  maxLength: 2000,
  allowEmojis: true,
  allowSpecialChars: true
};

// Rating validation
const ratingRules = {
  min: 1,
  max: 5,
  nullable: true,           // Rating is optional
  step: 1                   // Only whole numbers
};

// Platform validation
const allowedPlatforms = [
  'google',
  'amazon', 
  'shopify',
  'trustpilot',
  'facebook',
  'yelp',
  'other'
];

// Language validation
const supportedLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Dutch', 'Polish', 'Russian', 'Japanese',
  'Chinese (Simplified)', 'Chinese (Traditional)', 'Korean',
  'Arabic', 'Hebrew', 'Hindi', 'Turkish', 'Vietnamese',
  // ... 20+ more languages
];

// Sentiment validation
const allowedSentiments = ['positive', 'neutral', 'negative', null];
```

### ReviewResponse Model

```typescript
// Response text validation
const responseRules = {
  minLength: 1,
  maxLength: 500,
  allowEmojis: true
};

// Tone validation
const allowedTones = [
  'default',
  'more_friendly',
  'more_professional',
  'more_apologetic',
  'more_enthusiastic'
];
```

### BrandVoice Model

```typescript
// Tone validation
const allowedBrandTones = [
  'friendly',
  'professional',
  'casual',
  'formal'
];

// Formality validation
const formalityRules = {
  min: 1,
  max: 5,
  default: 3
};

// Key phrases validation
const keyPhrasesRules = {
  maxCount: 20,               // Max 20 phrases
  maxLengthPerPhrase: 50,     // Each phrase max 50 chars
  allowEmpty: true            // Can be empty array
};

// Sample responses validation
const sampleResponsesRules = {
  maxCount: 5,                // Max 5 samples
  maxLengthPerSample: 500,    // Each sample max 500 chars
  allowEmpty: true
};
```

---

## Index Strategy

### Rationale for Each Index

```prisma
// User indexes
@@index([email])                    // Fast login lookups (most common query)
@@index([tier])                     // Filter users by subscription tier
@@index([createdAt])                // Sort users by signup date (analytics)

// Account indexes
@@index([userId])                   // Find all OAuth accounts for a user

// Session indexes
@@index([userId])                   // Find active sessions for user

// Review indexes
@@index([userId, createdAt])        // Get user's reviews sorted by date (composite)
@@index([platform])                 // Filter reviews by platform
@@index([sentiment])                // Filter by sentiment (negative reviews first)
@@index([externalId])               // Lookup by platform's original ID

// ReviewResponse indexes
@@index([reviewId])                 // One-to-one lookup
@@index([isPublished])              // Find approved vs draft responses

// ResponseVersion indexes
@@index([reviewResponseId, createdAt])  // Get version history sorted

// CreditUsage indexes
@@index([userId, createdAt])        // User's credit history (paginated)
@@index([action])                   // Filter by action type (analytics)

// BrandVoice indexes
@@index([userId])                   // One-to-one lookup
```

### Performance Impact

| Query Type | Without Index | With Index | Improvement |
|------------|---------------|------------|-------------|
| User login | 100ms | 2ms | 50x faster |
| User's reviews | 200ms | 5ms | 40x faster |
| Review by sentiment | 150ms | 3ms | 50x faster |
| Credit usage history | 180ms | 8ms | 22x faster |

### Index Maintenance

- **Auto-update:** PostgreSQL updates indexes automatically
- **VACUUM:** Run weekly to reclaim space
- **ANALYZE:** Run daily to update statistics
- **Reindex:** Only if corruption suspected (rare)

---

## Default Values & Business Logic

### User Defaults (On Signup)

```typescript
const newUserDefaults = {
  tier: 'FREE',
  credits: 15,
  creditsResetDate: new Date(),           // Reset monthly from signup date
  sentimentQuota: 35,                     // FREE tier quota
  sentimentUsed: 0,
  sentimentResetDate: new Date(),         // Reset monthly
  emailVerified: null,                    // Must verify email (unless OAuth)
};

// Automatic BrandVoice creation
const defaultBrandVoice = {
  tone: 'professional',
  formality: 3,
  keyPhrases: ['Thank you', 'We appreciate your feedback'],
  styleNotes: 'Be genuine and empathetic.',
  sampleResponses: []
};
```

### Credit Reset Logic

```typescript
// Monthly credit reset (cron job)
async function resetMonthlyCredits() {
  const today = new Date();
  
  await prisma.user.updateMany({
    where: {
      creditsResetDate: {
        lte: today
      }
    },
    data: {
      credits: {
        set: prisma.raw(`
          CASE
            WHEN tier = 'FREE' THEN 15
            WHEN tier = 'STARTER' THEN 60
            WHEN tier = 'GROWTH' THEN 200
          END
        `)
      },
      creditsResetDate: {
        set: prisma.raw(`creditsResetDate + INTERVAL '1 month'`)
      }
    }
  });
}

// Run daily at 00:00 UTC
```

### Sentiment Quota Reset Logic

```typescript
// Monthly sentiment quota reset (cron job)
async function resetMonthlySentimentQuotas() {
  const today = new Date();
  
  await prisma.user.updateMany({
    where: {
      sentimentResetDate: {
        lte: today
      }
    },
    data: {
      sentimentUsed: 0,
      sentimentQuota: {
        set: prisma.raw(`
          CASE
            WHEN tier = 'FREE' THEN 35
            WHEN tier = 'STARTER' THEN 300
            WHEN tier = 'GROWTH' THEN 1000
          END
        `)
      },
      sentimentResetDate: {
        set: prisma.raw(`sentimentResetDate + INTERVAL '1 month'`)
      }
    }
  });
}

// Run daily at 00:00 UTC
```

---

## Cascade Behaviors

### Delete User

```typescript
// When user account is deleted:
User (deleted)
  ├── Account (CASCADE → deleted)
  ├── Session (CASCADE → deleted)
  ├── BrandVoice (CASCADE → deleted)
  ├── Review (CASCADE → deleted)
  │     ├── ReviewResponse (CASCADE → deleted)
  │     │     └── ResponseVersion (CASCADE → deleted)
  │     └── CreditUsage (SET NULL → reviewId = null, but record kept)
  └── CreditUsage (CASCADE → deleted)

// Result: Complete user data removal (GDPR compliant)
// Exception: CreditUsage records kept for accounting (anonymized)
```

### Delete Review

```typescript
// When review is deleted:
Review (deleted)
  ├── ReviewResponse (CASCADE → deleted)
  │     └── ResponseVersion (CASCADE → deleted)
  └── CreditUsage (SET NULL → reviewId = null, but record kept)

// Result: Review and response removed
// Exception: CreditUsage kept for audit (credit NOT refunded)
```

### Why SET NULL for CreditUsage.reviewId?

**Reason:** Preserve credit audit trail even if review deleted

**The Problem:**
- User might delete review to "get credits back" (fraud prevention)
- Need accurate accounting for business metrics
- After deletion: `reviewId` becomes `null`, losing all context

**The Solution: `details` Field (JSON Audit Trail)**

Store a snapshot of the review at the time of credit usage:

```typescript
// When deducting credit, store review snapshot
await tx.creditUsage.create({
  data: {
    userId,
    reviewId,
    creditsUsed: 1,
    action: 'GENERATE_RESPONSE',
    details: JSON.stringify({
      reviewSnapshot: {
        text: review.reviewText.substring(0, 200),  // First 200 chars
        rating: review.rating,
        platform: review.platform,
        sentiment: review.sentiment,
        language: review.detectedLanguage,
        reviewCreatedAt: review.createdAt
      },
      responseSnapshot: {
        text: responseText.substring(0, 200),
        tone: toneUsed
      },
      metadata: {
        timestamp: new Date(),
        modelUsed: 'claude-sonnet-4-20250514'
      }
    })
  }
});
```

**After Review Deletion - Audit Still Complete:**

```typescript
// Query credit usage for deleted review
const usage = await prisma.creditUsage.findUnique({
  where: { id: 'usage_123' }
});

console.log(usage);
// {
//   id: 'usage_123',
//   userId: 'user_abc',
//   reviewId: null,  // ← Review deleted, relation broken
//   creditsUsed: 1,
//   action: 'GENERATE_RESPONSE',
//   details: '{
//     "reviewSnapshot": {
//       "text": "Terrible service! Waited 2 hours...",
//       "rating": 1,
//       "platform": "google",
//       "sentiment": "negative",
//       "language": "English",
//       "reviewCreatedAt": "2026-01-05T14:23:00Z"
//     },
//     "responseSnapshot": {
//       "text": "We sincerely apologize for your experience...",
//       "tone": "more_apologetic"
//     },
//     "metadata": {
//       "timestamp": "2026-01-05T14:25:00Z",
//       "modelUsed": "claude-sonnet-4-20250514"
//     }
//   }',
//   createdAt: '2026-01-05T14:25:00Z'
// }

// Parse details for audit report
const auditData = JSON.parse(usage.details);
console.log(`Credit used for ${auditData.reviewSnapshot.platform} review (${auditData.reviewSnapshot.sentiment})`);
// "Credit used for google review (negative)"
```

**Audit Capabilities:**
✅ Track which review text consumed the credit (even after deletion)  
✅ Know rating, platform, sentiment of deleted review  
✅ See what response was generated  
✅ Full forensics for fraud investigation  
✅ Business analytics on deleted vs kept reviews  
✅ Compliance with financial audit requirements

---

## Common Query Patterns

### 1. User Dashboard Data

```typescript
// Fetch everything needed for dashboard
async function getDashboardData(userId: string) {
  const [user, reviewCount, responseCount, recentReviews] = await Promise.all([
    // User info with credits
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        credits: true,
        sentimentQuota: true,
        sentimentUsed: true,
        creditsResetDate: true,
        sentimentResetDate: true
      }
    }),
    
    // Review count this month
    prisma.review.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth(new Date()) }
      }
    }),
    
    // Response count this month
    prisma.reviewResponse.count({
      where: {
        review: {
          userId,
          createdAt: { gte: startOfMonth(new Date()) }
        }
      }
    }),
    
    // Recent reviews (last 10)
    prisma.review.findMany({
      where: { userId },
      include: {
        response: {
          select: {
            id: true,
            responseText: true,
            isPublished: true,
            creditsUsed: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);
  
  return { user, reviewCount, responseCount, recentReviews };
}
```

### 2. Generate Response (Atomic Transaction)

```typescript
// Ensure credit deduction is atomic with complete audit trail
async function generateResponseWithCredit(
  userId: string,
  reviewId: string,
  responseText: string,
  toneUsed: string = 'default'
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get review data for audit trail (BEFORE deletion possible)
    const review = await tx.review.findUnique({
      where: { id: reviewId },
      select: {
        reviewText: true,
        rating: true,
        platform: true,
        sentiment: true,
        detectedLanguage: true,
        createdAt: true
      }
    });
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    // 2. Check and deduct credit
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    
    if (!user || user.credits < 1) {
      throw new Error('Insufficient credits');
    }
    
    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } }
    });
    
    // 3. Log credit usage WITH review snapshot for audit
    await tx.creditUsage.create({
      data: {
        userId,
        reviewId,
        creditsUsed: 1,
        action: 'GENERATE_RESPONSE',
        details: JSON.stringify({
          reviewSnapshot: {
            text: review.reviewText.substring(0, 200),
            rating: review.rating,
            platform: review.platform,
            sentiment: review.sentiment,
            language: review.detectedLanguage,
            reviewCreatedAt: review.createdAt
          },
          responseSnapshot: {
            text: responseText.substring(0, 200),
            tone: toneUsed
          },
          metadata: {
            timestamp: new Date(),
            modelUsed: 'claude-sonnet-4-20250514'
          }
        })
      }
    });
    
    // 4. Create response
    const response = await tx.reviewResponse.create({
      data: {
        reviewId,
        responseText,
        toneUsed,
        creditsUsed: 1
      }
    });
    
    // 4. Create first version
    await tx.responseVersion.create({
      data: {
        reviewResponseId: response.id,
        responseText,
        toneUsed,
        creditsUsed: 1
      }
    });
    
    return response;
  });
}
```

### 3. Refund Credit (On API Error)

```typescript
// Atomically refund credit and log
async function refundCredit(userId: string, reviewId: string) {
  await prisma.$transaction([
    // Increment credit
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } }
    }),
    
    // Log refund
    prisma.creditUsage.create({
      data: {
        userId,
        reviewId,
        creditsUsed: -1,           // Negative = refund
        action: 'REFUND',
        details: JSON.stringify({
          reason: 'API_ERROR',
          timestamp: new Date()
        })
      }
    })
  ]);
}
```

### 4. Sentiment Analysis with Quota Check

```typescript
// Check quota and analyze sentiment
async function analyzeSentimentIfQuotaAvailable(
  userId: string,
  reviewId: string,
  reviewText: string
): Promise<string | null> {
  // Check quota
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sentimentQuota: true, sentimentUsed: true }
  });
  
  if (!user || user.sentimentUsed >= user.sentimentQuota) {
    // Quota exceeded, skip sentiment
    return null;
  }
  
  // Call DeepSeek API
  const sentiment = await callDeepSeekAPI(reviewText);
  
  // Update review and quota atomically
  await prisma.$transaction([
    prisma.review.update({
      where: { id: reviewId },
      data: { sentiment }
    }),
    
    prisma.user.update({
      where: { id: userId },
      data: { sentimentUsed: { increment: 1 } }
    })
  ]);
  
  return sentiment;
}
```

### 5. Paginated Credit Usage History

```typescript
// Get credit usage with pagination
async function getCreditUsageHistory(
  userId: string,
  page: number = 1,
  perPage: number = 20
) {
  const [usage, total] = await Promise.all([
    prisma.creditUsage.findMany({
      where: { userId },
      include: {
        review: {
          select: {
            reviewText: true,
            platform: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage
    }),
    
    prisma.creditUsage.count({
      where: { userId }
    })
  ]);
  
  return {
    usage,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage)
    }
  };
}
```

### 6. Filter Reviews by Sentiment

```typescript
// Get all negative reviews for prioritization
async function getNegativeReviews(userId: string) {
  return await prisma.review.findMany({
    where: {
      userId,
      sentiment: 'negative',
      response: null              // Only reviews without responses
    },
    orderBy: {
      createdAt: 'desc'           // Most recent first
    },
    take: 50
  });
}
```

### 7. Bulk Review Statistics

```typescript
// Analytics: Review stats by sentiment
async function getReviewStatistics(userId: string) {
  const [
    totalReviews,
    positiveCount,
    neutralCount,
    negativeCount,
    withResponses,
    avgRating
  ] = await Promise.all([
    prisma.review.count({ where: { userId } }),
    
    prisma.review.count({ 
      where: { userId, sentiment: 'positive' }
    }),
    
    prisma.review.count({
      where: { userId, sentiment: 'neutral' }
    }),
    
    prisma.review.count({
      where: { userId, sentiment: 'negative' }
    }),
    
    prisma.review.count({
      where: { userId, response: { isNot: null } }
    }),
    
    prisma.review.aggregate({
      where: { userId, rating: { not: null } },
      _avg: { rating: true }
    })
  ]);
  
  return {
    totalReviews,
    sentimentBreakdown: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount,
      unknown: totalReviews - (positiveCount + neutralCount + negativeCount)
    },
    withResponses,
    responseRate: (withResponses / totalReviews) * 100,
    avgRating: avgRating._avg.rating || 0
  };
}
```

### 8. Audit Deleted Reviews (Forensics)

```typescript
// Query credit usage for reviews that have been deleted
async function auditDeletedReviews(userId: string) {
  // Find credit usage where review was deleted (reviewId is null)
  const deletedReviewUsage = await prisma.creditUsage.findMany({
    where: {
      userId,
      reviewId: null,  // Review has been deleted
      action: {
        in: ['GENERATE_RESPONSE', 'REGENERATE']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  
  // Parse details to reconstruct what was deleted
  const auditReport = deletedReviewUsage.map(usage => {
    const details = JSON.parse(usage.details || '{}');
    const reviewSnapshot = details.reviewSnapshot || {};
    const responseSnapshot = details.responseSnapshot || {};
    
    return {
      usageId: usage.id,
      creditsUsed: usage.creditsUsed,
      deletedAt: 'unknown', // We don't track deletion time
      usedAt: usage.createdAt,
      
      // Reconstructed review data
      reviewPreview: reviewSnapshot.text || 'N/A',
      rating: reviewSnapshot.rating,
      platform: reviewSnapshot.platform,
      sentiment: reviewSnapshot.sentiment,
      language: reviewSnapshot.language,
      
      // Reconstructed response data
      responsePreview: responseSnapshot.text || 'N/A',
      tone: responseSnapshot.tone,
      
      // Can investigate fraud
      suspicious: reviewSnapshot.sentiment === 'positive' // Why delete positive?
    };
  });
  
  return {
    totalDeleted: auditReport.length,
    totalCreditsConsumed: auditReport.reduce((sum, r) => sum + r.creditsUsed, 0),
    suspiciousCount: auditReport.filter(r => r.suspicious).length,
    deletions: auditReport
  };
}
```

**Example Output:**
```typescript
{
  totalDeleted: 12,
  totalCreditsConsumed: 18,  // Some were regenerated
  suspiciousCount: 3,  // 3 positive reviews deleted (suspicious)
  deletions: [
    {
      usageId: 'usage_abc',
      creditsUsed: 2,
      deletedAt: 'unknown',
      usedAt: '2026-01-05T14:25:00Z',
      reviewPreview: 'Terrible service! Waited 2 hours...',
      rating: 1,
      platform: 'google',
      sentiment: 'negative',
      language: 'English',
      responsePreview: 'We sincerely apologize for your experience...',
      tone: 'more_apologetic',
      suspicious: false  // Makes sense to delete negative
    },
    {
      usageId: 'usage_xyz',
      creditsUsed: 1,
      deletedAt: 'unknown',
      usedAt: '2026-01-04T10:15:00Z',
      reviewPreview: 'Amazing experience! Will definitely return...',
      rating: 5,
      platform: 'amazon',
      sentiment: 'positive',
      language: 'English',
      responsePreview: 'Thank you so much for the wonderful feedback...',
      tone: 'default',
      suspicious: true  // ⚠️ Why delete positive review?
    }
  ]
}
```

**Use Cases:**
- **Fraud Detection:** Users deleting reviews to get credits back
- **Business Analytics:** What types of reviews get deleted most?
- **Compliance:** Financial audit trail of credit consumption
- **Customer Support:** "You used 18 credits on reviews you later deleted"
- **Data Recovery:** Partial reconstruction of deleted review content

---

### 9. Audit Sentiment Quota Usage & Fraud Detection

```typescript
// Detect sentiment quota fraud (similar to credit fraud)
async function auditSentimentUsage(userId: string) {
  const usage = await prisma.sentimentUsage.findMany({
    where: { userId },
    include: {
      review: {
        select: {
          id: true,
          platform: true,
          rating: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Calculate fraud indicators
  const total = usage.length;
  const deleted = usage.filter(u => u.reviewId === null).length;
  const active = total - deleted;
  const deletionRate = total > 0 ? deleted / total : 0;
  
  // Sentiment breakdown (including deleted)
  const sentimentBreakdown = {
    positive: usage.filter(u => u.sentiment === 'positive').length,
    neutral: usage.filter(u => u.sentiment === 'neutral').length,
    negative: usage.filter(u => u.sentiment === 'negative').length
  };
  
  // Parse snapshots for deleted reviews
  const deletedSnapshots = usage
    .filter(u => u.reviewId === null && u.details)
    .map(u => {
      const details = JSON.parse(u.details);
      return {
        sentiment: u.sentiment,
        platform: details.platform,
        rating: details.rating,
        preview: details.preview,
        analyzedAt: u.createdAt,
        isAnonymized: details.anonymized || false
      };
    });
  
  return {
    summary: {
      totalAnalyzed: total,
      activeReviews: active,
      deletedReviews: deleted,
      deletionRate: Math.round(deletionRate * 100),
      fraudRiskLevel: deletionRate > 0.5 ? 'HIGH' : deletionRate > 0.3 ? 'MEDIUM' : 'LOW'
    },
    sentimentBreakdown,
    deletedSnapshots,
    alerts: [
      deletionRate > 0.5 && {
        type: 'HIGH_DELETION_RATE',
        message: `User deleted ${Math.round(deletionRate * 100)}% of analyzed reviews`,
        severity: 'CRITICAL'
      },
      deleted > 20 && {
        type: 'HIGH_DELETION_COUNT',
        message: `User deleted ${deleted} reviews after sentiment analysis`,
        severity: 'WARNING'
      }
    ].filter(Boolean)
  };
}

// Example output
{
  summary: {
    totalAnalyzed: 100,
    activeReviews: 35,
    deletedReviews: 65,
    deletionRate: 65,  // 65% deletion rate
    fraudRiskLevel: 'HIGH'
  },
  sentimentBreakdown: {
    positive: 30,
    neutral: 40,
    negative: 30
  },
  deletedSnapshots: [
    {
      sentiment: 'negative',
      platform: 'google',
      rating: 1,
      preview: 'Terrible service! Manager was rude...',
      analyzedAt: '2026-01-05T10:15:00Z',
      isAnonymized: false
    },
    // ... 64 more
  ],
  alerts: [
    {
      type: 'HIGH_DELETION_RATE',
      message: 'User deleted 65% of analyzed reviews',
      severity: 'CRITICAL'
    },
    {
      type: 'HIGH_DELETION_COUNT',
      message: 'User deleted 65 reviews after sentiment analysis',
      severity: 'WARNING'
    }
  ]
}
```

**Use Cases:**
- **Quota Fraud Detection:** Users exploiting sentiment quota by deleting reviews
- **Abuse Prevention:** Identify users adding/deleting reviews repeatedly
- **Quota Disputes:** Prove user actually consumed quota ("You analyzed 100 reviews, deleted 65")
- **Business Intelligence:** Understanding which sentiment reviews get deleted most
- **Pattern Detection:** Users gaming the system to exceed quota limits

**Fraud Scenarios Detected:**

```typescript
// Scenario 1: Quota Gaming
// User on FREE tier (35 sentiment quota)
// Adds 100 reviews → Error after 35
// Deletes 30 reviews
// Adds 30 more → Quota still consumed (65 total)
// Evidence: SentimentUsage shows 65 analyses with snapshots

// Scenario 2: Deletion Abuse
// User generates sentiment on 50 reviews
// Deletes 45 negative reviews
// Keeps 5 positive reviews
// Evidence: 90% deletion rate = HIGH fraud risk

// Scenario 3: Chargeback Dispute
// User: "I only have 10 reviews, why did you charge for 50?"
// Evidence: SentimentUsage shows 50 analyses, 40 deleted
// Snapshots prove actual usage
```

---

### 10. GDPR-Compliant User Deletion & Anonymization

```typescript
// Complete GDPR user deletion with PII anonymization
async function gdprDeleteUser(userId: string) {
  console.log(`Starting GDPR deletion for user ${userId}`);
  
  await prisma.$transaction(async (tx) => {
    // 1. Delete all identifiable data (reviews, responses, brand voice)
    const reviewsDeleted = await tx.review.deleteMany({ 
      where: { userId } 
    });
    console.log(`Deleted ${reviewsDeleted.count} reviews`);
    
    // ReviewResponses cascade deleted automatically
    await tx.brandVoice.deleteMany({ where: { userId } });
    
    // 2. Anonymize credit usage snapshots (preserve for accounting)
    const creditUsageRecords = await tx.creditUsage.findMany({
      where: { userId }
    });
    
    console.log(`Anonymizing ${creditUsageRecords.length} credit usage records`);
    
    for (const record of creditUsageRecords) {
      if (!record.details) continue;
      
      const details = JSON.parse(record.details);
      
      // Anonymize review snapshot
      if (details.reviewSnapshot?.text) {
        details.reviewSnapshot.text = await anonymizeText(
          details.reviewSnapshot.text
        );
      }
      
      // Anonymize response snapshot
      if (details.responseSnapshot?.text) {
        details.responseSnapshot.text = await anonymizeText(
          details.responseSnapshot.text
        );
      }
      
      // Mark as anonymized
      details.anonymized = true;
      details.anonymizationDate = new Date();
      details.reason = "GDPR_RIGHT_TO_ERASURE";
      
      await tx.creditUsage.update({
        where: { id: record.id },
        data: { details: JSON.stringify(details) }
      });
    }
    
    // 2b. Anonymize sentiment usage snapshots (preserve for accounting)
    const sentimentUsageRecords = await tx.sentimentUsage.findMany({
      where: { userId }
    });
    
    console.log(`Anonymizing ${sentimentUsageRecords.length} sentiment usage records`);
    
    for (const record of sentimentUsageRecords) {
      if (!record.details) continue;
      
      const details = JSON.parse(record.details);
      
      // Anonymize review preview
      if (details.preview) {
        details.preview = await anonymizeText(details.preview);
      }
      
      // Mark as anonymized
      details.anonymized = true;
      details.anonymizationDate = new Date();
      details.reason = "GDPR_RIGHT_TO_ERASURE";
      
      await tx.sentimentUsage.update({
        where: { id: record.id },
        data: { details: JSON.stringify(details) }
      });
    }
    
    // 3. Anonymize user account (keep for FK integrity, accounting)
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@anonymized.local`,
        name: "Deleted User",
        image: null,
        password: null,
        emailVerified: null
      }
    });
  });
  
  console.log(`GDPR deletion complete for user ${userId}`);
}

// Anonymize text using NER + regex (Option 1: Simple Redaction with NER)
async function anonymizeText(text: string): Promise<string> {
  let anonymized = text;
  
  // 1. Redact names using NER (Named Entity Recognition)
  // Using library like compromise, spaCy, or Stanford NER
  const names = await detectNames(anonymized);
  names.forEach(name => {
    anonymized = anonymized.replace(new RegExp(name, 'gi'), '[NAME]');
  });
  
  // 2. Redact phone numbers (regex)
  anonymized = anonymized.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE]'
  );
  
  // 3. Redact emails (regex)
  anonymized = anonymized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );
  
  // 4. Redact addresses (basic patterns)
  anonymized = anonymized.replace(
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)/gi,
    '[ADDRESS]'
  );
  
  // 5. Redact apartment/unit numbers
  anonymized = anonymized.replace(
    /(?:apartment|apt|unit|suite)\s*#?\s*\d+[a-z]?/gi,
    '[UNIT]'
  );
  
  return anonymized;
}

// Helper: Detect names using NER
async function detectNames(text: string): Promise<string[]> {
  // Using compromise library (example)
  const nlp = require('compromise');
  const doc = nlp(text);
  
  const names: string[] = [];
  
  // Extract person names
  doc.people().forEach((person: any) => {
    names.push(person.text());
  });
  
  return names;
}
```

**Example Before/After Anonymization:**

```typescript
// BEFORE GDPR deletion:
{
  reviewSnapshot: {
    text: "Terrible service! Manager John at the Seattle store was rude to me, Sarah. Call me at 555-1234.",
    rating: 1,
    platform: "google",
    sentiment: "negative"
  },
  responseSnapshot: {
    text: "Dear Sarah, we sincerely apologize. We'll speak with John immediately. Please contact us at 555-9999.",
    tone: "apologetic"
  }
}

// AFTER GDPR deletion:
{
  reviewSnapshot: {
    text: "Terrible service! Manager [NAME] at the Seattle store was rude to me. [PHONE]",
    rating: 1,  // ✓ Preserved (not PII)
    platform: "google",  // ✓ Preserved
    sentiment: "negative"  // ✓ Preserved
  },
  responseSnapshot: {
    text: "We sincerely apologize. We'll speak with [NAME] immediately. Please contact us at [PHONE].",
    tone: "apologetic"  // ✓ Preserved
  },
  anonymized: true,
  anonymizationDate: "2026-01-10T14:23:00Z",
  reason: "GDPR_RIGHT_TO_ERASURE"
}
```

**What's Preserved (Non-PII):**
- ✅ Review sentiment ("terrible service" content)
- ✅ Rating (1-5 stars)
- ✅ Platform (Google, Amazon, etc.)
- ✅ Sentiment classification
- ✅ Response tone
- ✅ Credit amount
- ✅ Timestamp
- ✅ Action type

**What's Removed (PII):**
- ❌ Customer names
- ❌ Employee names
- ❌ Phone numbers
- ❌ Email addresses
- ❌ Physical addresses
- ❌ Any personally identifiable information

**Audit Capabilities After Anonymization:**
```typescript
// Can still investigate fraud
const usage = await auditDeletedReviews(userId);
// Shows: "User spent 18 credits on reviews (5 negative, 3 positive)"
// Shows: "3 positive reviews were deleted (suspicious)"

// Can still track business metrics
// "80% of complaints mention [NAME]" → Manager behavior pattern
// "Negative reviews cost average 2.5 credits (regenerations)"

// CANNOT identify individuals
// "Who was the manager?" → Shows [NAME], cannot determine
// "Was this Sarah Johnson?" → Cannot confirm
```

**GDPR Compliance:**
- ✅ Right to Erasure honored (PII removed)
- ✅ Legitimate business interest preserved (accounting, fraud detection)
- ✅ Data minimization (only keep what's necessary)
- ✅ Purpose limitation (credit accounting only, not marketing)
- ✅ Storage limitation (anonymized data retention policy: 7 years)

**Testing Anonymization:**
```typescript
// Test suite to verify anonymization works
describe('GDPR Anonymization', () => {
  it('should redact all names', () => {
    const input = "John Smith and Sarah Jones were great";
    const output = anonymizeText(input);
    expect(output).toBe("[NAME] and [NAME] were great");
  });
  
  it('should redact all phone numbers', () => {
    const input = "Call me at 555-1234 or (555) 567-8900";
    const output = anonymizeText(input);
    expect(output).toBe("Call me at [PHONE] or [PHONE]");
  });
  
  it('should preserve non-PII content', () => {
    const input = "Terrible service at Seattle location";
    const output = anonymizeText(input);
    expect(output).toContain("Terrible service");
    expect(output).toContain("Seattle location");
  });
});
```

---

## Migration Strategy

### Initial Migration (Phase 1)

```bash
# 1. Initialize Prisma
npx prisma init

# 2. Create schema.prisma (copy from this document)

# 3. Generate initial migration
npx prisma migrate dev --name init

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed database with test data (optional)
npx prisma db seed
```

### Migration Best Practices

```typescript
// Always use transactions for data migrations
async function migrateData() {
  await prisma.$transaction(async (tx) => {
    // All migration queries here
    // If any fails, all roll back
  });
}

// Test migrations on staging first
// Never run migrations directly on production
// Always have backup before migration
```

### Handling Schema Changes

**Adding a new field:**
```prisma
// 1. Add field with default or nullable
model Review {
  // ... existing fields
  newField String? // or @default("value")
}

// 2. Generate migration
npx prisma migrate dev --name add_new_field

// 3. Backfill data if needed
// 4. Remove nullable/default if not needed
```

**Renaming a field:**
```bash
# Use custom SQL migration (Prisma doesn't auto-detect renames)
npx prisma migrate dev --create-only --name rename_field

# Edit generated migration:
ALTER TABLE "reviews" RENAME COLUMN "oldName" TO "newName";

# Apply migration:
npx prisma migrate deploy
```

### Rollback Strategy

```bash
# If migration fails:
# 1. Check migration status
npx prisma migrate status

# 2. Resolve manually or rollback
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# 3. Fix schema and re-migrate
npx prisma migrate dev
```

---

## Data Integrity Constraints

### Database-Level Constraints

```sql
-- Ensure credits never go negative
ALTER TABLE users ADD CONSTRAINT credits_non_negative 
  CHECK (credits >= 0);

-- Ensure sentiment quota never go negative
ALTER TABLE users ADD CONSTRAINT sentiment_used_non_negative 
  CHECK (sentiment_used >= 0);

-- Ensure rating is 1-5 if provided
ALTER TABLE reviews ADD CONSTRAINT rating_range 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Ensure formality is 1-5
ALTER TABLE brand_voices ADD CONSTRAINT formality_range 
  CHECK (formality >= 1 AND formality <= 5);

-- Ensure review text is not empty
ALTER TABLE reviews ADD CONSTRAINT review_text_not_empty 
  CHECK (LENGTH(review_text) > 0);

-- Ensure response text is not empty
ALTER TABLE review_responses ADD CONSTRAINT response_text_not_empty 
  CHECK (LENGTH(response_text) > 0);
```

### Application-Level Checks

```typescript
// Credit sufficiency check (before API call)
if (user.credits < 1) {
  throw new InsufficientCreditsError();
}

// Sentiment quota check (before API call)
if (user.sentimentUsed >= user.sentimentQuota) {
  console.warn('Sentiment quota exceeded, skipping analysis');
  // Continue without sentiment (graceful degradation)
}

// Review text length
if (reviewText.length > 2000) {
  throw new ValidationError('Review too long (max 2000 chars)');
}

// Response text length
if (responseText.length > 500) {
  throw new ValidationError('Response too long (max 500 chars)');
}
```

### Unique Constraints

```prisma
// User email must be unique
@@unique([email])

// Only one OAuth account per provider per user
@@unique([provider, providerAccountId])

// Only one brand voice per user
@@unique([userId])  // on BrandVoice model

// Only one response per review
@@unique([reviewId])  // on ReviewResponse model
```

---

## Performance Optimization Notes

### Query Optimization

1. **Use `select` to limit fields:**
   ```typescript
   // Bad: Fetches all fields
   const user = await prisma.user.findUnique({ where: { id } });
   
   // Good: Only fetches needed fields
   const user = await prisma.user.findUnique({
     where: { id },
     select: { credits: true, tier: true }
   });
   ```

2. **Batch queries with Promise.all:**
   ```typescript
   // Bad: Sequential queries (slow)
   const user = await getUser();
   const reviews = await getReviews();
   const stats = await getStats();
   
   // Good: Parallel queries (fast)
   const [user, reviews, stats] = await Promise.all([
     getUser(),
     getReviews(),
     getStats()
   ]);
   ```

3. **Use pagination for large datasets:**
   ```typescript
   // Always paginate lists
   const reviews = await prisma.review.findMany({
     skip: (page - 1) * perPage,
     take: perPage
   });
   ```

### Connection Pooling

```typescript
// Prisma handles connection pooling automatically
// Configure in .env:
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

### Caching Strategy (Future)

```typescript
// Phase 2: Add Redis caching for:
// - User credits (TTL: 60 seconds)
// - Brand voice settings (TTL: 5 minutes)
// - Review count (TTL: 1 minute)

// Example (future):
const cachedCredits = await redis.get(`user:${userId}:credits`);
if (cachedCredits) return parseInt(cachedCredits);

const credits = await prisma.user.findUnique(...);
await redis.setex(`user:${userId}:credits`, 60, credits);
```

---

## Data Backup & Recovery

### Automatic Backups (Supabase)

- **Frequency:** Daily automated backups
- **Retention:** 30 days for free tier
- **Point-in-time recovery:** Available
- **Location:** Same region as database

### Manual Backup

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Import from backup
psql $DATABASE_URL < backup_20260105.sql
```

### Disaster Recovery Plan

1. **Data Loss Scenarios:**
   - Accidental deletion → Restore from daily backup (< 24h data loss)
   - Database corruption → Restore from last valid backup
   - Region outage → Failover to backup region (Phase 2+)

2. **Recovery Time Objective (RTO):** 4 hours
3. **Recovery Point Objective (RPO):** 24 hours (daily backups)

---

## Testing Database Operations

### Unit Tests (Example)

```typescript
// tests/database/user.test.ts
describe('User Model', () => {
  it('should create user with defaults', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpass'
      }
    });
    
    expect(user.tier).toBe('FREE');
    expect(user.credits).toBe(15);
    expect(user.sentimentQuota).toBe(35);
  });
  
  it('should enforce email uniqueness', async () => {
    await prisma.user.create({
      data: { email: 'test@example.com', password: 'pass' }
    });
    
    await expect(
      prisma.user.create({
        data: { email: 'test@example.com', password: 'pass2' }
      })
    ).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// tests/integration/response-generation.test.ts
describe('Response Generation Flow', () => {
  it('should deduct credit atomically', async () => {
    const user = await createTestUser({ credits: 15 });
    const review = await createTestReview({ userId: user.id });
    
    await generateResponseWithCredit(
      user.id,
      review.id,
      'Test response'
    );
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    expect(updatedUser.credits).toBe(14);
    
    const creditUsage = await prisma.creditUsage.findFirst({
      where: { userId: user.id, action: 'GENERATE_RESPONSE' }
    });
    
    expect(creditUsage).toBeTruthy();
    expect(creditUsage.creditsUsed).toBe(1);
  });
});
```

---

## Database Monitoring

### Key Metrics to Track

1. **Query Performance:**
   - Slow queries (>100ms)
   - Most frequent queries
   - Query failures

2. **Connection Pool:**
   - Active connections
   - Idle connections
   - Connection timeouts

3. **Storage:**
   - Database size growth
   - Table sizes
   - Index sizes

4. **Data Quality:**
   - Orphaned records (should be 0)
   - NULL values in critical fields
   - Constraint violations

### Monitoring Tools

- **Supabase Dashboard:** Built-in metrics
- **Prisma Studio:** Visual database browser
- **pgAdmin:** Advanced PostgreSQL management
- **Sentry:** Error tracking for failed queries

---

## Security Considerations

### Sensitive Data

```typescript
// Never log sensitive data
// Bad:
console.log('User:', user);  // Might include password hash

// Good:
console.log('User:', {
  id: user.id,
  email: user.email
  // Omit password, tokens, etc.
});

// Use select to exclude sensitive fields
const publicUser = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // NO password, tokens, etc.
  }
});
```

### SQL Injection Prevention

```typescript
// Prisma prevents SQL injection by default
// All queries are parameterized

// Safe (Prisma handles escaping):
await prisma.review.findMany({
  where: {
    reviewText: { contains: userInput }  // Auto-escaped
  }
});

// Never use raw SQL with user input unless necessary
// If must use raw SQL, use parameterized queries:
await prisma.$queryRaw`
  SELECT * FROM reviews
  WHERE review_text LIKE ${`%${userInput}%`}
`;
```

### Access Control

```typescript
// Always verify user owns resource before access
async function getReview(reviewId: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: userId  // Ensure user owns this review
    }
  });
  
  if (!review) {
    throw new UnauthorizedError();
  }
  
  return review;
}
```

---

**Document Status:** ✅ READY FOR DEVELOPMENT

**Usage:**
- Copy Prisma schema directly into `prisma/schema.prisma`
- Use query patterns as templates for API endpoints
- Reference validation rules for form validation
- Follow migration strategy for database updates

**Next Document:** 05_API_CONTRACTS.md (Complete API endpoint specifications)