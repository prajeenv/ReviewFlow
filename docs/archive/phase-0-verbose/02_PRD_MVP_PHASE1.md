# Product Requirements Document: MVP Phase 1
## ReviewFlow - Week 1-2 Core Features

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** Ready for Development  
**Timeline:** Week 1-2 (14 days)  
**Goal:** Functional MVP with 5 beta users by end of Week 2

---

## Document Purpose

This PRD defines EXACTLY what needs to be built in Phase 1 (Week 1-2) to have a functional MVP. Every feature has:
- User stories (why we're building it)
- Acceptance criteria (how we know it's done)
- Technical specifications (what to build)
- Edge cases (what could go wrong)

**Use this document for:**
- Vibe coding prompts ("Build the feature in Section X")
- Feature completeness checks (did we meet all acceptance criteria?)
- Scope control (anything not in this doc is NOT Phase 1)

---

## Table of Contents

1. [Phase 1 Overview](#phase-1-overview)
2. [User Stories & Features](#user-stories--features)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Credit System Logic](#credit-system-logic)
6. [UI/UX Requirements](#uiux-requirements)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Testing Checklist](#testing-checklist)

---

## Phase 1 Overview

### What We're Building (Week 1-2)

**Core Capabilities:**
1. ✅ User can sign up and authenticate
2. ✅ User can manually input a review
3. ✅ AI generates a response in the same language
4. ✅ User can edit and regenerate responses
5. ✅ User can customize brand voice
6. ✅ Credits are tracked and deducted correctly
7. ✅ Sentiment analysis runs automatically (DeepSeek)
8. ✅ User sees their credit balance and usage

**Success Criteria (End of Week 2):**
- [ ] 5 beta users successfully onboarded
- [ ] 50+ reviews processed with AI responses
- [ ] <5 second response generation time
- [ ] Zero credit tracking errors
- [ ] All acceptance criteria met

**What's NOT in Phase 1:**
- ❌ CSV import (Phase 2)
- ❌ Google Business integration (Phase 3)
- ❌ Shopify integration (Phase 4)
- ❌ Payment processing (Month 2)
- ❌ Team collaboration (Month 2)
- ❌ Advanced analytics dashboard
- ❌ Email notifications

---

## User Stories & Features

### Epic 1: Authentication & Onboarding

#### Story 1.1: User Sign-Up
**As a** new user  
**I want to** create an account with my email  
**So that** I can start using ReviewFlow

**Acceptance Criteria:**
- [ ] User can sign up with email + password (min 8 characters)
- [ ] User receives email verification link
- [ ] User must verify email before accessing app
- [ ] User is automatically on Free tier (15 credits, 35 sentiment)
- [ ] User sees onboarding welcome message
- [ ] Default brand voice is created ("Professional & Friendly")

**Technical Requirements:**
```typescript
// NextAuth.js configuration
- Email/password provider
- Email verification via Resend
- Session management (JWT)
- Protected routes middleware

// Database
- User record created with default values
- Credits initialized: 15
- SentimentQuota initialized: 35
- BrandVoice record created with defaults
```

**Edge Cases:**
- Email already exists → Show error, suggest login
- Invalid email format → Client-side validation
- Email verification link expired → Resend option
- User closes tab before verification → Can resend via login page

---

#### Story 1.2: User Login
**As a** returning user  
**I want to** log in with my email/password  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] User can log in with email + password
- [ ] Invalid credentials show clear error message
- [ ] Successful login redirects to dashboard
- [ ] "Remember me" keeps user logged in for 30 days
- [ ] "Forgot password" flow sends reset link

**Technical Requirements:**
```typescript
// NextAuth.js
- Credentials provider
- Session persistence
- Password reset via email (Resend)

// Security
- Rate limiting: 5 failed attempts = 15 min lockout
- Passwords hashed with bcrypt (cost factor: 12)
```

**Edge Cases:**
- Account locked after 5 failed attempts → Show lockout message with timer
- Password reset link expired → Generate new one
- User already logged in → Redirect to dashboard

---

#### Story 1.3: Google OAuth (Optional)
**As a** user  
**I want to** sign up/login with Google  
**So that** I don't have to remember another password

**Acceptance Criteria:**
- [ ] User can click "Continue with Google"
- [ ] OAuth flow redirects to Google, back to app
- [ ] Account created if first time, login if exists
- [ ] Google profile photo imported
- [ ] Email pre-verified (no verification step needed)

**Technical Requirements:**
```typescript
// NextAuth.js
- Google OAuth provider
- Scope: email, profile
- Store Google ID for account linking

// Auto-setup
- Same defaults as email signup
- Skip email verification
```

---

### Epic 2: Manual Review Input

#### Story 2.1: Add Review Manually
**As a** user  
**I want to** paste and save a review from any platform  
**So that** I can see its sentiment and decide later if I want to generate a response

**Acceptance Criteria:**
- [ ] User can paste review text (max 2,000 characters)
- [ ] User can select star rating (1-5) or leave blank
- [ ] User can specify platform (Google, Amazon, Shopify, etc.) or "Other"
- [ ] System auto-detects language (40+ languages supported)
- [ ] System auto-runs sentiment analysis (DeepSeek) if quota available
- [ ] Review is saved to database when user clicks "Save Review"
- [ ] User returns to dashboard after save
- [ ] Review card shows sentiment badge and "Generate Response" button
- [ ] Character counter shows remaining characters
- [ ] Form validates before submission

**Technical Requirements:**
```typescript
// Form fields
interface ReviewInput {
  reviewText: string;           // Required, 1-2000 chars
  rating?: number;              // Optional, 1-5
  platform: string;             // Dropdown or "Other"
  reviewerName?: string;        // Optional
  reviewDate?: Date;            // Optional
}

// Auto-detection
- Language detection: franc library (client-side)
- Sentiment analysis: DeepSeek API call
  - Response: "positive" | "neutral" | "negative"
  - Deduct from sentiment quota if available
  - Store in Review.sentiment field
  - If quota exceeded, set sentiment: null (still save review)

// Validations
- reviewText: 1-2000 characters
- rating: 1-5 or null
- platform: from predefined list

// Save flow with sentiment tracking
async function saveReview(reviewInput: ReviewInput, userId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Save review to database
    const review = await tx.review.create({
      data: {
        userId,
        reviewText: reviewInput.reviewText,
        rating: reviewInput.rating,
        platform: reviewInput.platform,
        detectedLanguage: detectLanguage(reviewInput.reviewText),
        sentiment: null // Will be updated by sentiment analysis
      }
    });
    
    // 2. Check sentiment quota
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { sentimentUsed: true, sentimentQuota: true }
    });
    
    if (user.sentimentUsed < user.sentimentQuota) {
      // 3. Analyze sentiment
      const sentiment = await analyzeSentiment(review.reviewText);
      
      // 4. Update review with sentiment
      await tx.review.update({
        where: { id: review.id },
        data: { sentiment }
      });
      
      // 5. Increment quota counter
      await tx.user.update({
        where: { id: userId },
        data: { sentimentUsed: { increment: 1 } }
      });
      
      // 6. LOG SENTIMENT USAGE (fraud prevention)
      await tx.sentimentUsage.create({
        data: {
          userId,
          reviewId: review.id,
          sentiment,
          details: JSON.stringify({
            platform: review.platform,
            rating: review.rating,
            preview: review.reviewText.substring(0, 100), // First 100 chars
            analyzedAt: new Date()
          })
        }
      });
    }
    // If quota exceeded, sentiment remains null (review still saved)
  });
}
```

**UI Components:**
```
┌─────────────────────────────────────────┐
│  Add Review                             │
├─────────────────────────────────────────┤
│  Platform: [Dropdown ▼] Google Business│
│  Rating:   [⭐⭐⭐⭐⭐]                    │
│                                         │
│  Review Text: *                         │
│  ┌─────────────────────────────────┐   │
│  │ [User pastes review here...]    │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  1,245 / 2,000 characters               │
│                                         │
│  🌍 Detected: English                  │
│  [Not right? Select manually ▼]        │
│                                         │
│  Reviewer Name (optional):              │
│  [                          ]           │
│                                         │
│  Review Date (optional):                │
│  [MM/DD/YYYY]                           │
│                                         │
│  [Cancel]  [Save Review]                │
└─────────────────────────────────────────┘
```

**After Save - Dashboard View:**
```
┌─────────────────────────────────────────┐
│  Your Reviews                           │
├─────────────────────────────────────────┤
│  [🟢 Positive] ⭐⭐⭐⭐⭐                  │
│  "Great service! The team was..."       │
│  Google Business | English              │
│  Added: Jan 5, 2026 2:34 PM             │
│                                         │
│  [Generate Response] [Edit] [Delete]    │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- Empty review text → Show error, disable submit
- Review > 2,000 chars → Truncate or show error
- Invalid rating (0 or 6+) → Validate on client side
- Sentiment quota exceeded → Skip sentiment analysis, still save review
- DeepSeek API error → Log error, set sentiment: null, still save review
- Language detection fails → Default to English, still generate response

---

#### Story 2.2: View Review Details
**As a** user  
**I want to** see the review I just added  
**So that** I can confirm it's correct before generating a response

**Acceptance Criteria:**
- [ ] After adding review, user sees review card
- [ ] Card shows: platform, rating, review text, sentiment, language
- [ ] Card has "Generate Response" button
- [ ] Card has "Edit Review" button
- [ ] Card has "Delete Review" button
- [ ] Sentiment badge color-coded (green/yellow/red)

**Technical Requirements:**
```typescript
// Review Card Component
interface ReviewCardProps {
  review: {
    id: string;
    platform: string;
    rating?: number;
    reviewText: string;
    sentiment: "positive" | "neutral" | "negative";
    detectedLanguage: string;
    createdAt: Date;
  };
}

// Color coding
- Positive: green badge
- Neutral: yellow badge
- Negative: red badge
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  🌟🌟🌟🌟⭐ (4 stars) | Google Business│
│  [🟢 Positive]  [🌍 English]            │
├─────────────────────────────────────────┤
│  "Great service! The team was very      │
│   helpful and the product exceeded my   │
│   expectations. Will definitely buy     │
│   again."                               │
├─────────────────────────────────────────┤
│  Added: Jan 5, 2026 2:34 PM             │
│                                         │
│  [✏️ Edit] [🗑️ Delete]                  │
│  [✨ Generate Response]                  │
└─────────────────────────────────────────┘
```

---

### Epic 3: AI Response Generation

#### Story 3.1: Generate First Response
**As a** user  
**I want to** click "Generate Response" on a review  
**So that** AI creates a draft response for me

**Acceptance Criteria:**
- [ ] User clicks "Generate Response" button
- [ ] System checks if user has sufficient credits (≥1)
- [ ] If insufficient credits, show upgrade message
- [ ] If sufficient, show loading state (spinner)
- [ ] AI generates response in <5 seconds
- [ ] Response is in same language as review
- [ ] Response matches brand voice settings
- [ ] 1 credit is deducted from user balance
- [ ] Response is saved to database
- [ ] User sees generated response in editor

**Technical Requirements:**
```typescript
// Credit check
async function canGenerateResponse(userId: string): Promise<boolean> {
  const user = await getUserWithCredits(userId);
  return user.credits >= 1;
}

// API call to Claude
async function generateResponse(
  reviewText: string,
  rating: number,
  language: string,
  brandVoice: BrandVoice
): Promise<string> {
  const prompt = buildPrompt(reviewText, rating, language, brandVoice);
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.7,
    messages: [{
      role: "user",
      content: prompt
    }]
  });
  
  return response.content[0].text;
}

// Credit deduction (atomic transaction with audit trail)
await prisma.$transaction(async (tx) => {
  // Get review data for audit trail
  const review = await tx.review.findUnique({
    where: { id: reviewId },
    select: {
      reviewText: true,
      rating: true,
      platform: true,
      sentiment: true,
      detectedLanguage: true
    }
  });
  
  // Deduct credit
  await tx.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } }
  });
  
  // Log usage with review snapshot (for audit if review deleted)
  await tx.creditUsage.create({
    data: {
      userId,
      reviewId,
      creditsUsed: 1,
      action: "GENERATE_RESPONSE",
      details: JSON.stringify({
        reviewSnapshot: {
          text: review.reviewText.substring(0, 200),
          rating: review.rating,
          platform: review.platform,
          sentiment: review.sentiment,
          language: review.detectedLanguage
        }
      })
    }
  });
});
```

**Prompt Engineering:**
```typescript
function buildPrompt(
  reviewText: string,
  rating: number,
  language: string,
  brandVoice: BrandVoice
): string {
  return `You are responding to a customer review on behalf of a business.

Review Rating: ${rating} stars
Review Text: "${reviewText}"
Detected Language: ${language}

Brand Voice Guidelines:
- Tone: ${brandVoice.tone}
- Formality: ${brandVoice.formality}
- Key Phrases: ${brandVoice.keyPhrases}
- Writing Style: ${brandVoice.styleNotes}

Instructions:
1. Respond in ${language} (match the review's language exactly)
2. Keep response 50-150 words (concise but personal)
3. Match the brand voice specified above
4. Be genuine and empathetic
5. For positive reviews: thank them, reinforce positive elements
6. For negative reviews: apologize, address concerns, offer solution
7. For neutral reviews: thank them, encourage future business

Generate ONLY the response text. Do not include labels, greetings to me, or explanations.`;
}
```

**Edge Cases:**
- User has 0 credits → Show modal: "Out of credits. Upgrade to continue generating responses"
- Claude API error → Show error, don't deduct credit, suggest retry
- Response generation timeout (>30s) → Show error, refund credit
- Claude returns empty response → Show error, refund credit, log for debugging
- Language detection wrong → Response might be in wrong language (user can regenerate)

---

#### Story 3.2: Regenerate Response (Different Tone)
**As a** user  
**I want to** regenerate a response with a different tone  
**So that** I can get a better version without starting over

**Acceptance Criteria:**
- [ ] User sees "Regenerate" button with tone dropdown
- [ ] Tone options: "More Friendly", "More Professional", "More Apologetic", "More Enthusiastic"
- [ ] System checks credits (≥1)
- [ ] AI generates new response with adjusted tone
- [ ] 1 additional credit deducted
- [ ] New response replaces old in editor
- [ ] Previous response is saved in history
- [ ] User can undo to previous version

**Technical Requirements:**
```typescript
// Tone modifiers
type ToneModifier = 
  | "more_friendly"
  | "more_professional"
  | "more_apologetic"
  | "more_enthusiastic";

// Add to prompt
function buildRegeneratePrompt(
  originalPrompt: string,
  toneModifier: ToneModifier,
  previousResponse: string
): string {
  const modifierInstructions = {
    more_friendly: "Make the response warmer, more casual, and personable",
    more_professional: "Make the response more formal and business-like",
    more_apologetic: "Emphasize empathy and sincere apology",
    more_enthusiastic: "Add more energy and excitement"
  };
  
  return `${originalPrompt}

Previous response (for context, generate a NEW response):
"${previousResponse}"

IMPORTANT: ${modifierInstructions[toneModifier]}

Generate a completely new response incorporating this tone adjustment.`;
}

// Version history
interface ResponseVersion {
  id: string;
  responseText: string;
  toneUsed: string;
  createdAt: Date;
}

// Store all versions
await prisma.responseVersion.create({
  data: {
    reviewResponseId,
    responseText: newResponse,
    toneUsed: toneModifier,
    creditsUsed: 1
  }
});
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  AI Generated Response                  │
├─────────────────────────────────────────┤
│  "Thank you so much for the wonderful   │
│   feedback! We're thrilled that our     │
│   team exceeded your expectations..."   │
├─────────────────────────────────────────┤
│  Tone: [▼ Adjust Tone]                  │
│        ├ More Friendly                  │
│        ├ More Professional              │
│        ├ More Apologetic                │
│        └ More Enthusiastic              │
│                                         │
│  [↩️ Undo] [🔄 Regenerate] [✅ Approve]  │
│                                         │
│  Credits used: 2/15  (13 remaining)     │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- Out of credits during regeneration → Show modal, don't regenerate
- Too many regenerations (>5 for one review) → Warn user about credit usage
- Undo with no previous version → Disable undo button
- API fails mid-regeneration → Show error, refund credit

---

#### Story 3.3: Edit Response Manually
**As a** user  
**I want to** edit the AI-generated response  
**So that** I can personalize it before publishing

**Acceptance Criteria:**
- [ ] Response appears in editable text area
- [ ] User can type/edit freely
- [ ] Character counter shows 0-500 characters
- [ ] "Save Changes" button appears when edited
- [ ] Saving doesn't cost additional credits
- [ ] Edited response is saved to database
- [ ] Timestamp shows "Edited at [time]"

**Technical Requirements:**
```typescript
// Editable textarea
<Textarea
  value={responseText}
  onChange={(e) => setResponseText(e.target.value)}
  maxLength={500}
  placeholder="Edit your response here..."
/>

// Save without credit cost
async function saveEditedResponse(
  responseId: string,
  editedText: string
): Promise<void> {
  await prisma.reviewResponse.update({
    where: { id: responseId },
    data: {
      responseText: editedText,
      isEdited: true,
      editedAt: new Date()
    }
  });
  // NO credit deduction for manual edits
}
```

**Edge Cases:**
- User edits then closes without saving → Prompt "Unsaved changes. Save?"
- Response > 500 characters → Show error, truncate or prevent typing
- Empty response after editing → Allow (user might want to start over)

---

#### Story 3.4: Delete Response Only
**As a** user  
**I want to** delete just the AI response without deleting the review  
**So that** I can regenerate a different response

**Acceptance Criteria:**
- [ ] "Delete Response" button visible on response card
- [ ] Confirmation modal: "Delete this response? The review will remain."
- [ ] Warning: "Credits will NOT be refunded"
- [ ] Deleting response removes it from database
- [ ] Review remains intact and visible
- [ ] "Generate Response" button reappears after deletion
- [ ] All ResponseVersion history is deleted (cascade)
- [ ] Credit usage audit trail preserved (snapshot in details field)

**Technical Requirements:**
```typescript
// Delete response only (not review)
async function deleteResponseOnly(reviewResponseId: string, userId: string) {
  // Verify user owns this response
  const response = await prisma.reviewResponse.findFirst({
    where: {
      id: reviewResponseId,
      review: { userId }
    },
    include: { review: true }
  });
  
  if (!response) {
    throw new UnauthorizedError();
  }
  
  // Delete response (cascades to ResponseVersion)
  await prisma.reviewResponse.delete({
    where: { id: reviewResponseId }
  });
  
  // CreditUsage.reviewResponseId becomes null (onDelete: SetNull)
  // But snapshot preserved in CreditUsage.details field
  
  // No credit refund (anti-abuse)
}
```

**Cascade Behavior:**
```
ReviewResponse deleted
  → ResponseVersion (CASCADE deleted)
  → CreditUsage.reviewResponseId (SET NULL, but details preserved)
  → Review (NOT deleted, remains intact)
```

**UI Components:**
```
┌─────────────────────────────────────────┐
│  [🟢 Positive] ⭐⭐⭐⭐⭐                  │
│  "Great service! Very happy..."         │
│  Google Business                        │
│                                         │
│  Response:                              │
│  "Thank you for the wonderful..."       │
│  ✓ Approved | Credits used: 2          │
│                                         │
│  [Edit Response] [Delete Response]      │
└─────────────────────────────────────────┘

[Delete Confirmation Modal]
┌─────────────────────────────────────────┐
│  Delete Response?                       │
│                                         │
│  This will remove the AI response but   │
│  keep the review. You'll need to        │
│  regenerate a new response.             │
│                                         │
│  ⚠️ Credits will NOT be refunded        │
│                                         │
│  [Cancel] [Delete Response]             │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- Response already deleted → Show 404 error
- User tries to delete response for review they don't own → Unauthorized error
- Response has been regenerated 5 times → All versions deleted, all 5+ credits non-refundable
- Deleting response doesn't affect sentiment analysis (already completed)

**Audit Trail Preserved:**
```typescript
// After deletion, CreditUsage records remain:
const usage = await prisma.creditUsage.findMany({
  where: { reviewResponseId: null, action: 'GENERATE_RESPONSE' }
});

// Can still audit what was deleted via details field:
const details = JSON.parse(usage[0].details);
console.log(details.responseSnapshot.text); // "Thank you for the wonderful..."
console.log(details.responseSnapshot.tone); // "friendly"
```

---

### Epic 4: Brand Voice Customization

#### Story 4.1: Set Up Brand Voice
**As a** user  
**I want to** define my brand's voice  
**So that** AI responses match my style

**Acceptance Criteria:**
- [ ] User can access "Brand Voice Settings" from menu
- [ ] User can set tone: Friendly, Professional, Casual, Formal
- [ ] User can set formality level: Casual (1) to Formal (5)
- [ ] User can add key phrases (comma-separated)
- [ ] User can add writing style notes (free text)
- [ ] User can upload sample responses (optional, up to 5)
- [ ] Settings are saved and applied to all future generations
- [ ] User can preview how settings affect responses

**Technical Requirements:**
```typescript
// BrandVoice schema
model BrandVoice {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  tone            String   @default("professional") // friendly, professional, casual, formal
  formality       Int      @default(3)              // 1-5 scale
  keyPhrases      String[] @default([])             // ["Thank you", "We appreciate"]
  styleNotes      String?  @db.Text                 // Free text
  sampleResponses String[] @default([])             // Up to 5 examples
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Default values on signup
const defaultBrandVoice = {
  tone: "professional",
  formality: 3,
  keyPhrases: ["Thank you", "We appreciate your feedback"],
  styleNotes: "Be genuine and empathetic"
};
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  Brand Voice Settings                   │
├─────────────────────────────────────────┤
│  Tone:                                  │
│  ( ) Friendly  (•) Professional         │
│  ( ) Casual    ( ) Formal               │
│                                         │
│  Formality Level:                       │
│  Casual [•────────] Formal (3/5)       │
│                                         │
│  Key Phrases (comma-separated):         │
│  ┌─────────────────────────────────┐   │
│  │ Thank you, We appreciate your   │   │
│  │ feedback, Looking forward       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Writing Style Notes:                   │
│  ┌─────────────────────────────────┐   │
│  │ Be genuine and empathetic.      │   │
│  │ Use first-person plural (we).   │   │
│  │ Keep it concise (2-3 sentences) │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sample Responses (optional):           │
│  [+ Add Sample Response]                │
│                                         │
│  [Save Changes]                         │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- No brand voice set → Use default values
- User deletes all key phrases → Use default
- Sample responses > 5 → Show error, limit to 5
- Formality slider not moved → Default to 3 (middle)

---

### Epic 5: Multi-Language Support

#### Story 5.1: Auto-Detect Review Language
**As a** user  
**I want to** the system to automatically detect the review's language  
**So that** I don't have to manually specify it

**Acceptance Criteria:**
- [ ] When user pastes review, language is detected automatically
- [ ] Detection happens on blur (after user finishes typing)
- [ ] Detected language is shown in UI ("Detected: Spanish")
- [ ] User can override if detection is wrong
- [ ] Supports 40+ languages (all Claude-supported languages)
- [ ] Detection is fast (<1 second)

**Technical Requirements:**
```typescript
// Use franc library (lightweight, client-side)
import { franc } from 'franc';

function detectLanguage(text: string): string {
  // Minimum 10 characters for reliable detection
  const langCode = franc(text, { minLength: 10 });
  
  // Check if detection failed
  if (langCode === 'und' || text.length < 30) {
    // Detection uncertain - default to English
    // User can manually override via dropdown
    return 'English';
  }
  
  return languageCodeToName(langCode); // ISO 639-3 to readable name
}

// Fallback: Manual language selection dropdown
// NO DeepSeek backup for now (can add in Phase 2+ if needed)
// NO Claude API (too expensive for language detection)

// Supported languages (40+)
const SUPPORTED_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian",
  "Portuguese", "Dutch", "Polish", "Russian", "Japanese",
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean",
  "Arabic", "Hebrew", "Hindi", "Turkish", "Vietnamese",
  // ... 20+ more
];
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  Review Text: *                         │
│  ┌─────────────────────────────────┐   │
│  │ Excelente servicio! El equipo   │   │
│  │ fue muy atento y profesional.   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🌍 Detected: Spanish                  │
│  [Not right? Select manually ▼]        │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- Very short review (<10 words) → Detection may be inaccurate, allow manual override
- Mixed language review → Detect dominant language
- Uncommon language → Default to English, allow manual selection
- Detection fails → Default to English, show warning

---

#### Story 5.2: Generate Response in Same Language
**As a** user  
**I want to** AI to respond in the same language as the review  
**So that** I can reply to international customers properly

**Acceptance Criteria:**
- [ ] AI generates response in detected language automatically
- [ ] No translation step needed
- [ ] Response quality is native-level (not machine translated)
- [ ] User can change target language if needed
- [ ] Multi-language responses work for all 40+ supported languages

**Technical Requirements:**
```typescript
// Pass language to Claude prompt
function buildPrompt(
  reviewText: string,
  language: string,
  brandVoice: BrandVoice
): string {
  return `...

CRITICAL: Respond in ${language}. Do NOT translate. Write natively in ${language} as if you are a native speaker of that language.

...`;
}

// Quality check
// Claude 3.5 Sonnet supports native-level generation in 40+ languages
// No need for separate translation API
```

**Edge Cases:**
- Language detection wrong → Response in wrong language (user can regenerate with correct language)
- Rare language → Claude may fall back to English (document supported languages)
- User wants response in different language → Add manual language override

---

### Epic 6: Credit Tracking System

#### Story 6.1: Display Credit Balance
**As a** user  
**I want to** see my current credit balance  
**So that** I know how many responses I can generate

**Acceptance Criteria:**
- [ ] Credit balance shown in top navigation bar
- [ ] Balance updates in real-time after each generation
- [ ] Shows: "13/15 credits remaining" (current/total)
- [ ] Color-coded: Green (>50%), Yellow (20-50%), Red (<20%)
- [ ] Clicking balance opens usage details modal

**Technical Requirements:**
```typescript
// Real-time balance component
function CreditBalance() {
  const { data: user } = useQuery({
    queryKey: ['user', 'credits'],
    queryFn: fetchUserCredits,
    refetchInterval: 10000 // Refresh every 10s
  });
  
  const percentage = (user.credits / user.totalCredits) * 100;
  const color = percentage > 50 ? 'green' : percentage > 20 ? 'yellow' : 'red';
  
  return (
    <div className={`credit-badge ${color}`}>
      {user.credits}/{user.totalCredits} credits
    </div>
  );
}

// Database query
async function fetchUserCredits(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      tier: true
    }
  });
  
  // Calculate totalCredits based on tier
  const totalCredits = {
    FREE: 15,
    STARTER: 60,
    GROWTH: 200
  }[user.tier];
  
  return { credits: user.credits, totalCredits };
}
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  ReviewFlow                             │
│                                         │
│  [🏠 Dashboard] [⚙️ Settings]            │
│                                         │
│  💎 13/15 credits   [↗️ Upgrade]        │
│     ████████████░░░                     │
└─────────────────────────────────────────┘
```

**Edge Cases:**
- 0 credits remaining → Show "Out of credits" message, disable generation
- Negative credits (due to refund bug) → Set to 0, log error
- Credits updated by admin → Refresh on next page load

---

#### Story 6.2: Track Credit Usage History
**As a** user  
**I want to** see my credit usage history  
**So that** I understand where my credits went

**Acceptance Criteria:**
- [ ] User can view usage history in settings
- [ ] Shows: date, action, credits used, review text (truncated)
- [ ] Paginated (20 per page)
- [ ] Can filter by date range
- [ ] Can export as CSV
- [ ] Shows total credits used this month

**Technical Requirements:**
```typescript
// CreditUsage schema
model CreditUsage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  reviewId          String?
  review            Review?          @relation(fields: [reviewId], references: [id])
  
  reviewResponseId  String?
  reviewResponse    ReviewResponse?  @relation(fields: [reviewResponseId], references: [id], onDelete: SetNull)
  
  creditsUsed Int      @default(1)
  action      String   // "GENERATE_RESPONSE", "REGENERATE", "REFUND"
  
  // Audit trail: Store review & response snapshots (survives deletion)
  // Snapshots anonymized on GDPR user deletion (names/emails/phones redacted)
  details     String?  @db.Text  // JSON: reviewSnapshot, responseSnapshot, metadata
  
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
}

// Fetch usage with enhanced display from snapshots
async function getCreditUsage(
  userId: string,
  page: number = 1,
  perPage: number = 20
) {
  const usage = await prisma.creditUsage.findMany({
    where: { userId },
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
    skip: (page - 1) * perPage,
    take: perPage
  });
  
  // Parse details field and enrich display
  return usage.map(record => {
    const details = record.details ? JSON.parse(record.details) : {};
    const reviewSnapshot = details.reviewSnapshot || {};
    const responseSnapshot = details.responseSnapshot || {};
    
    return {
      id: record.id,
      creditsUsed: record.creditsUsed,
      action: record.action,
      createdAt: record.createdAt,
      
      // Review info (from DB if exists, fallback to snapshot)
      review: record.review ? {
        id: record.review.id,
        preview: record.review.reviewText.substring(0, 100),
        platform: record.review.platform,
        rating: record.review.rating,
        status: 'active'
      } : {
        id: null,
        preview: reviewSnapshot.text || '[Review deleted]',
        platform: reviewSnapshot.platform || 'unknown',
        rating: reviewSnapshot.rating || null,
        status: 'deleted'
      },
      
      // Response info (from snapshot - always use for consistency)
      response: {
        preview: responseSnapshot.text || 'N/A',
        tone: responseSnapshot.tone || 'default',
        versionNumber: responseSnapshot.versionNumber || 1,
        status: record.reviewResponseId ? 'active' : 'deleted'
      },
      
      // Check if anonymized
      isAnonymized: details.anonymized || false
    };
  });
}
```

**UI Example:**
```
┌──────────────────────────────────────────────────────────┐
│  Credit Usage History                                    │
├──────────────────────────────────────────────────────────┤
│  Jan 5, 2026 2:34 PM                                     │
│  Generated response | -1 credit                          │
│  "Great service! The team..."  [⭐⭐⭐⭐⭐ Google]        │
│  Response: "Thank you for the wonderful..." (Friendly)   │
│  ✓ Active | [View Full Response]                        │
├──────────────────────────────────────────────────────────┤
│  Jan 5, 2026 2:35 PM                                     │
│  Regenerated | -1 credit                                 │
│  [Same review]                                           │
│  Response: "We're so grateful for your..." (Enthusiastic)│
│  ✓ Active | [View Full Response]                        │
├──────────────────────────────────────────────────────────┤
│  Jan 4, 2026 3:12 PM                                     │
│  Generated response | -1 credit                          │
│  "Terrible service! Manager..." [⭐ Amazon]              │
│  Response: "We apologize for..." (Apologetic)            │
│  ✗ Deleted | [Audit Details Only]                       │
├──────────────────────────────────────────────────────────┤
│  Jan 4, 2026 3:15 PM                                     │
│  Refund | +1 credit                                      │
│  API Error - credit refunded automatically               │
├──────────────────────────────────────────────────────────┤
│  Jan 5, 2026 2:35 PM                    │
│  Regenerated (more friendly) | -1 credit│
│  "Great service! The team..."           │
├─────────────────────────────────────────┤
│  [< Previous] Page 1 of 3 [Next >]      │
│                                         │
│  Total this month: 12 credits           │
└─────────────────────────────────────────┘
```

---

#### Story 6.3: GDPR-Compliant Data Deletion
**As a** user  
**I want to** delete my account and all personal data  
**So that** I comply with my right to erasure under GDPR

**Acceptance Criteria:**
- [ ] User can request account deletion from settings
- [ ] All reviews and responses are deleted immediately
- [ ] Credit usage records preserved for accounting (legal requirement)
- [ ] Personal data in credit usage snapshots is anonymized (not deleted)
- [ ] Names, emails, phone numbers redacted from snapshots
- [ ] Non-PII data preserved (rating, platform, sentiment, credit amount)
- [ ] User account marked as deleted (email anonymized)
- [ ] Process completes within 30 days (GDPR requirement)

**Technical Requirements:**
```typescript
// GDPR-compliant user deletion
async function gdprDeleteUser(userId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Delete all identifiable data
    await tx.review.deleteMany({ where: { userId } });
    await tx.reviewResponse.deleteMany({ 
      where: { review: { userId } } 
    });
    await tx.brandVoice.delete({ where: { userId } });
    
    // 2. Anonymize credit usage snapshots (preserve for accounting)
    const usage = await tx.creditUsage.findMany({
      where: { userId }
    });
    
    for (const record of usage) {
      if (record.details) {
        const details = JSON.parse(record.details);
        
        // Redact PII using NER
        if (details.reviewSnapshot?.text) {
          details.reviewSnapshot.text = await anonymizeText(
            details.reviewSnapshot.text
          );
        }
        
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
    }
    
    // 3. Anonymize user account (keep for FK integrity)
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
}

// Anonymize text using NER + regex
async function anonymizeText(text: string): Promise<string> {
  let anonymized = text;
  
  // 1. Redact names (using NER library)
  const names = detectNames(anonymized);
  names.forEach(name => {
    anonymized = anonymized.replace(new RegExp(name, 'gi'), '[NAME]');
  });
  
  // 2. Redact phone numbers
  anonymized = anonymized.replace(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE]'
  );
  
  // 3. Redact emails
  anonymized = anonymized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );
  
  // 4. Redact addresses
  anonymized = anonymized.replace(
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd)/gi,
    '[ADDRESS]'
  );
  
  return anonymized;
}
```

**After Anonymization - Credit History:**
```
┌──────────────────────────────────────────────────────────┐
│  Jan 5, 2026 2:34 PM                                     │
│  Generated response | -1 credit                          │
│  "Terrible service! Manager [NAME] was..." [⭐ Google]   │
│  Response: "We apologize. We'll speak..." (Apologetic)   │
│  🔒 Anonymized (GDPR) | [Audit Details]                 │
└──────────────────────────────────────────────────────────┘
```

**Edge Cases:**
- User has active subscription → Cancel subscription first, then delete
- User has pending refunds → Process refunds before deletion
- Anonymization fails → Retry with manual review
- User requests data export → Provide before deletion (GDPR right to portability)

**Compliance Notes:**
- Credit usage preserved for legal/accounting requirements (7 years)
- All PII removed from credit usage (names, contact info)
- Non-PII preserved (dates, amounts, platform, sentiment)
- User can audit anonymized data (shows [NAME], [EMAIL] redactions)

---

### Epic 7: Sentiment Analysis

#### Story 7.1: Auto-Analyze Review Sentiment
**As a** user  
**I want to** reviews to be automatically tagged with sentiment  
**So that** I can prioritize negative reviews

**Acceptance Criteria:**
- [ ] When review is added, sentiment analysis runs automatically
- [ ] Uses DeepSeek API (cost-effective)
- [ ] Returns: "positive", "neutral", or "negative"
- [ ] Deducts from sentiment quota (not credits)
- [ ] Shows sentiment badge on review card
- [ ] Analysis completes in <2 seconds
- [ ] If quota exceeded, skip analysis (still allow response generation)

**Technical Requirements:**
```typescript
// DeepSeek API call
async function analyzeSentiment(reviewText: string): Promise<Sentiment> {
  const prompt = `Analyze the sentiment of this customer review. Respond with ONLY ONE WORD: positive, neutral, or negative.

Review: "${reviewText}"

Sentiment:`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0
    })
  });
  
  const data = await response.json();
  const sentiment = data.choices[0].message.content.trim().toLowerCase();
  
  // Validate response
  if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
    return 'neutral'; // Default fallback
  }
  
  return sentiment as Sentiment;
}

// Quota check
async function canAnalyzeSentiment(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sentimentQuota: true, sentimentUsed: true }
  });
  
  return user.sentimentUsed < user.sentimentQuota;
}

// Deduct from quota
await prisma.user.update({
  where: { id: userId },
  data: { sentimentUsed: { increment: 1 } }
});
```

**Edge Cases:**
- Sentiment quota exceeded → Skip analysis, set sentiment to null, still allow response
- DeepSeek API error → Set sentiment to null, log error, don't block review
- Ambiguous review → DeepSeek might return "neutral" (acceptable)
- API returns invalid response → Default to "neutral"

---

#### Story 7.2: Display Sentiment Quota
**As a** user  
**I want to** see my sentiment analysis quota  
**So that** I know how many reviews I can analyze

**Acceptance Criteria:**
- [ ] Sentiment quota shown in dashboard
- [ ] Shows: "25/35 analyses used this month"
- [ ] Separate from credit balance
- [ ] Resets monthly (on subscription renewal date)
- [ ] Low quota warning (<10 remaining)

**Technical Requirements:**
```typescript
// User schema additions
model User {
  // ...existing fields
  
  sentimentQuota     Int @default(35)  // FREE: 35, STARTER: 300, GROWTH: 1000
  sentimentUsed      Int @default(0)
  sentimentResetDate DateTime          // Date to reset sentimentUsed to 0
}

// Monthly reset (cron job)
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
      sentimentResetDate: addMonths(today, 1)
    }
  });
}
```

**UI Example:**
```
┌─────────────────────────────────────────┐
│  📊 Sentiment Analysis                  │
│  25/35 analyses used this month         │
│  ████████████████░░░░                   │
│                                         │
│  Resets on: Feb 5, 2026                 │
└─────────────────────────────────────────┘
```

---

### Epic 8: Dashboard & UI

#### Story 8.1: Dashboard Overview
**As a** user  
**I want to** see an overview of my account  
**So that** I quickly understand my usage

**Acceptance Criteria:**
- [ ] Dashboard shows: credit balance, sentiment quota, recent reviews
- [ ] Shows total reviews added this month
- [ ] Shows total responses generated this month
- [ ] Quick action button: "Add New Review"
- [ ] Recent reviews list (last 10)
- [ ] Each review card links to response editor

**Technical Requirements:**
```typescript
// Dashboard data query
async function getDashboardData(userId: string) {
  const [user, reviewCount, responseCount, recentReviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        tier: true,
        sentimentQuota: true,
        sentimentUsed: true
      }
    }),
    
    prisma.review.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth(new Date()) }
      }
    }),
    
    prisma.reviewResponse.count({
      where: {
        review: { userId },
        createdAt: { gte: startOfMonth(new Date()) }
      }
    }),
    
    prisma.review.findMany({
      where: { userId },
      include: { response: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);
  
  return { user, reviewCount, responseCount, recentReviews };
}
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  Welcome back, [User Name]!             │
├─────────────────────────────────────────┤
│  💎 Credits: 13/15    📊 Sentiment: 25/35│
│                                         │
│  This Month:                            │
│  📝 12 reviews added                    │
│  ✅ 18 responses generated              │
│                                         │
│  [➕ Add New Review]                    │
├─────────────────────────────────────────┤
│  Recent Reviews:                        │
│                                         │
│  [Review Card 1]                        │
│  [Review Card 2]                        │
│  [Review Card 3]                        │
│  ...                                    │
│                                         │
│  [View All Reviews →]                   │
└─────────────────────────────────────────┘
```

---

## Database Schema

### Complete Prisma Schema (Phase 1)

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
// USERS & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  
  // Authentication
  password      String?   // Hashed, null if OAuth
  
  // Subscription
  tier          Tier      @default(FREE)
  credits       Int       @default(15)
  sentimentQuota Int      @default(35)
  sentimentUsed  Int      @default(0)
  sentimentResetDate DateTime @default(now())
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  reviews       Review[]
  brandVoice    BrandVoice?
  creditUsage   CreditUsage[]
  sessions      Session[]
  accounts      Account[]
  
  @@index([email])
}

enum Tier {
  FREE
  STARTER
  GROWTH
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
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
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

// ============================================
// BRAND VOICE
// ============================================

model BrandVoice {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tone            String   @default("professional") // friendly, professional, casual, formal
  formality       Int      @default(3)              // 1-5 scale
  keyPhrases      String[] @default([])
  styleNotes      String?  @db.Text
  sampleResponses String[] @default([])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
}

// ============================================
// REVIEWS & RESPONSES
// ============================================

model Review {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Review content
  platform        String    // "google", "amazon", "shopify", "other"
  reviewText      String    @db.Text
  rating          Int?      // 1-5, nullable
  reviewerName    String?
  reviewDate      DateTime?
  
  // Metadata
  detectedLanguage String   @default("English")
  sentiment       String?   // "positive", "neutral", "negative"
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  response        ReviewResponse?
  creditUsage     CreditUsage[]
  
  @@index([userId, createdAt])
  @@index([platform])
  @@index([sentiment])
}

model ReviewResponse {
  id              String   @id @default(cuid())
  reviewId        String   @unique
  review          Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  // Response content
  responseText    String   @db.Text
  isEdited        Boolean  @default(false)
  editedAt        DateTime?
  
  // Generation metadata
  creditsUsed     Int      @default(1)
  toneUsed        String   @default("default")
  
  // Status
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  versions        ResponseVersion[]
  
  @@index([reviewId])
}

model ResponseVersion {
  id                String   @id @default(cuid())
  reviewResponseId  String
  reviewResponse    ReviewResponse @relation(fields: [reviewResponseId], references: [id], onDelete: Cascade)
  
  responseText      String   @db.Text
  toneUsed          String
  creditsUsed       Int      @default(1)
  
  createdAt         DateTime @default(now())
  
  @@index([reviewResponseId, createdAt])
}

// ============================================
// CREDIT TRACKING
// ============================================

model CreditUsage {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reviewId          String?
  review            Review?          @relation(fields: [reviewId], references: [id], onDelete: SetNull)
  
  reviewResponseId  String?
  reviewResponse    ReviewResponse?  @relation(fields: [reviewResponseId], references: [id], onDelete: SetNull)
  
  creditsUsed Int      @default(1)
  action      String   // "GENERATE_RESPONSE", "REGENERATE", "REFUND"
  
  // Audit trail: Store review & response snapshots (survives deletion)
  // Snapshots anonymized on GDPR user deletion (names/emails/phones redacted)
  details     String?  @db.Text  // JSON: reviewSnapshot, responseSnapshot, metadata
  
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
}
```

### Database Indexes Explanation

**Why these indexes:**
- `User.email` → Fast login lookups
- `Review.userId + createdAt` → Dashboard recent reviews query
- `Review.platform` → Filter reviews by platform
- `Review.sentiment` → Filter negative reviews
- `CreditUsage.userId + createdAt` → Usage history pagination

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
**Purpose:** Create new user account

**Request:**
```typescript
{
  email: string;
  password: string; // min 8 chars
  name?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Verification email sent",
  userId: string;
}
```

**Errors:**
- 400: Email already exists
- 400: Invalid email format
- 400: Password too short
- 500: Database error

---

#### POST /api/auth/login
**Purpose:** User login

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true,
  token: string; // JWT
  user: {
    id: string;
    email: string;
    tier: "FREE" | "STARTER" | "GROWTH";
    credits: number;
  }
}
```

**Errors:**
- 401: Invalid credentials
- 429: Too many attempts (rate limited)

---

### Review Endpoints

#### POST /api/reviews
**Purpose:** Create new review

**Request:**
```typescript
{
  reviewText: string;    // 1-2000 chars
  rating?: number;       // 1-5
  platform: string;
  reviewerName?: string;
  reviewDate?: string;   // ISO format
}
```

**Response:**
```typescript
{
  success: true,
  review: {
    id: string;
    reviewText: string;
    detectedLanguage: string;
    sentiment: "positive" | "neutral" | "negative" | null;
    creditsRemaining: number;
    sentimentQuotaRemaining: number;
  }
}
```

**Errors:**
- 400: Review text too short/long
- 402: Sentiment quota exceeded (still creates review, just no sentiment)
- 401: Unauthorized

---

#### GET /api/reviews
**Purpose:** Get user's reviews

**Query Params:**
```typescript
{
  page?: number;         // Default: 1
  perPage?: number;      // Default: 20, max: 100
  platform?: string;     // Filter by platform
  sentiment?: string;    // Filter by sentiment
}
```

**Response:**
```typescript
{
  success: true,
  reviews: Review[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }
}
```

---

#### GET /api/reviews/:id
**Purpose:** Get single review with response

**Response:**
```typescript
{
  success: true,
  review: {
    id: string;
    reviewText: string;
    rating: number;
    platform: string;
    sentiment: string;
    detectedLanguage: string;
    response?: {
      id: string;
      responseText: string;
      creditsUsed: number;
      isEdited: boolean;
    }
  }
}
```

---

### Response Generation Endpoints

#### POST /api/responses/generate
**Purpose:** Generate AI response for a review (first time)

**Request:**
```typescript
{
  reviewId: string;      // The review to respond to
  toneModifier?: string; // Optional: "more_friendly" | "more_professional" | "more_apologetic" | "more_enthusiastic"
}
```

**Response:**
```typescript
{
  success: true,
  response: {
    id: string;              // New response ID
    responseText: string;
    creditsUsed: number;
    creditsRemaining: number;
  }
}
```

**What it does:**
- Creates a NEW ReviewResponse record in database
- Links to the Review via reviewId
- First response generation for this review

**Errors:**
- 402: Insufficient credits
- 404: Review not found
- 500: Claude API error (credit refunded)
- 504: Generation timeout (credit refunded)

---

#### POST /api/responses/regenerate
**Purpose:** Regenerate an existing response with different tone

**Request:**
```typescript
{
  responseId: string;    // The existing response to regenerate
  toneModifier: string;  // Required: "more_friendly" | "more_professional" | "more_apologetic" | "more_enthusiastic"
}
```

**Response:**
```typescript
{
  success: true,
  response: {
    id: string;              // Same response ID
    responseText: string;    // Updated text
    creditsUsed: number;
    creditsRemaining: number;
    version: number;         // Version history counter
  }
}
```

**What it does:**
- Updates EXISTING ReviewResponse record
- Creates ResponseVersion record (version history)
- Uses original review + previous response as context

---

#### PATCH /api/responses/:id
**Purpose:** Update response text (manual edit)

**Request:**
```typescript
{
  responseText: string; // 1-500 chars
}
```

**Response:**
```typescript
{
  success: true,
  response: {
    id: string;
    responseText: string;
    isEdited: true;
    editedAt: string;
  }
}
```

**Note:** No credit charge for manual edits

---

### User & Settings Endpoints

#### GET /api/user/me
**Purpose:** Get current user info

**Response:**
```typescript
{
  success: true,
  user: {
    id: string;
    email: string;
    name: string;
    tier: "FREE" | "STARTER" | "GROWTH";
    credits: number;
    sentimentQuota: number;
    sentimentUsed: number;
    createdAt: string;
  }
}
```

---

#### GET /api/user/credits/usage
**Purpose:** Get credit usage history

**Query Params:**
```typescript
{
  page?: number;
  perPage?: number;
  startDate?: string; // ISO format
  endDate?: string;
}
```

**Response:**
```typescript
{
  success: true,
  usage: Array<{
    id: string;
    action: string;
    creditsUsed: number;
    review?: {
      reviewText: string;
      platform: string;
    };
    createdAt: string;
  }>;
  totalThisMonth: number;
}
```

---

#### GET /api/brand-voice
**Purpose:** Get user's brand voice settings

**Response:**
```typescript
{
  success: true,
  brandVoice: {
    tone: string;
    formality: number;
    keyPhrases: string[];
    styleNotes: string;
    sampleResponses: string[];
  }
}
```

---

#### PUT /api/brand-voice
**Purpose:** Update brand voice settings

**Request:**
```typescript
{
  tone?: string;
  formality?: number;
  keyPhrases?: string[];
  styleNotes?: string;
  sampleResponses?: string[];
}
```

**Response:**
```typescript
{
  success: true,
  brandVoice: { /* updated settings */ }
}
```

---

## Credit System Logic

### Credit Deduction Rules

1. **Generate Response:** -1 credit
2. **Regenerate Response:** -1 credit per regeneration
3. **Manual Edit:** 0 credits (FREE)
4. **Failed Generation:** 0 credits (automatic refund)

### Atomic Transactions

```typescript
// CRITICAL: Credits must be deducted atomically
async function generateResponseWithCredit(userId: string, reviewId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check credits
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    
    if (user.credits < 1) {
      throw new Error("Insufficient credits");
    }
    
    // 2. Generate response (may throw error)
    const responseText = await generateAIResponse(reviewId);
    
    // 3. Deduct credit
    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } }
    });
    
    // 4. Log usage
    await tx.creditUsage.create({
      data: {
        userId,
        reviewId,
        creditsUsed: 1,
        action: "GENERATE_RESPONSE"
      }
    });
    
    // 5. Save response
    const response = await tx.reviewResponse.create({
      data: {
        reviewId,
        responseText,
        creditsUsed: 1
      }
    });
    
    return response;
  });
}
```

### Credit Refund Logic

```typescript
// If AI generation fails, refund the credit
async function refundCredit(userId: string, reviewId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } }
    }),
    prisma.creditUsage.create({
      data: {
        userId,
        reviewId,
        creditsUsed: -1,
        action: "REFUND"
      }
    })
  ]);
}
```

### Sentiment Quota Logic

```typescript
// Sentiment analysis doesn't cost credits
async function analyzeSentimentIfQuotaAvailable(userId: string, reviewText: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sentimentQuota: true, sentimentUsed: true }
  });
  
  if (user.sentimentUsed >= user.sentimentQuota) {
    // Quota exceeded, skip sentiment analysis
    return null;
  }
  
  // Run sentiment analysis
  const sentiment = await callDeepSeekAPI(reviewText);
  
  // Deduct from quota
  await prisma.user.update({
    where: { id: userId },
    data: { sentimentUsed: { increment: 1 } }
  });
  
  return sentiment;
}
```

---

## UI/UX Requirements

### Design System

**Colors:**
- Primary: #2563eb (Blue)
- Success: #16a34a (Green)
- Warning: #eab308 (Yellow)
- Danger: #dc2626 (Red)
- Neutral: #64748b (Slate)

**Typography:**
- Headings: Inter, semibold
- Body: Inter, regular
- Code: JetBrains Mono

**Components:**
- Use shadcn/ui components
- Tailwind CSS for styling
- Responsive: mobile-first design

---

### Loading States

**Response Generation:**
```
┌─────────────────────────────────────────┐
│  ⏳ Generating AI response...            │
│                                         │
│  [████████░░░░░░░░░░] 40%              │
│                                         │
│  This usually takes 3-5 seconds         │
└─────────────────────────────────────────┘
```

**Sentiment Analysis:**
```
Analyzing sentiment... 🔍
```

---

### Empty States

**No Reviews Yet:**
```
┌─────────────────────────────────────────┐
│              📝                         │
│                                         │
│  No reviews yet                         │
│  Add your first review to get started   │
│                                         │
│  [➕ Add Review]                        │
└─────────────────────────────────────────┘
```

**Out of Credits:**
```
┌─────────────────────────────────────────┐
│              💎                         │
│                                         │
│  You're out of credits!                 │
│  Upgrade to continue generating         │
│  AI responses                           │
│                                         │
│  [Upgrade to Starter - $29/mo]          │
│  [Maybe Later]                          │
└─────────────────────────────────────────┘
```

---

## Non-Functional Requirements

### Performance

- **Response Generation:** <5 seconds (p95)
- **Page Load:** <2 seconds (p95)
- **API Latency:** <500ms (p95)
- **Database Queries:** <100ms (p95)

### Security

- **Passwords:** bcrypt hashing, cost factor 12
- **Sessions:** JWT with 30-day expiry
- **Rate Limiting:**
  - Login: 5 attempts per 15 minutes
  - API: 100 requests per minute per user
  - Response generation: 10 per minute per user
- **SQL Injection:** Prisma protects automatically
- **XSS:** React escapes by default
- **CSRF:** NextAuth handles tokens

### Reliability

- **Uptime:** 99% target (Phase 1, MVP)
- **Error Handling:** All API errors logged to Sentry
- **Retry Logic:** 3 retries with exponential backoff for Claude API
- **Fallbacks:**
  - Claude API down → Show error, suggest manual response
  - DeepSeek API down → Skip sentiment, allow response generation

### Monitoring

- **Error Tracking:** Sentry
- **Performance:** Vercel Analytics
- **Logs:** Console logs for development, structured logs for production
- **Alerts:**
  - Credit tracking error → Slack notification
  - Claude API error rate >10% → Email alert
  - App downtime → PagerDuty (Month 2+)

---

## Testing Checklist

### Unit Tests (Optional for MVP, but recommended)

- [ ] Credit deduction logic
- [ ] Credit refund logic
- [ ] Sentiment quota logic
- [ ] Language detection
- [ ] Prompt building

### Integration Tests

- [ ] Signup → Email verification → Login flow
- [ ] Add review → Generate response → Edit → Save flow
- [ ] Regenerate with different tone
- [ ] Credit usage tracking
- [ ] Brand voice application in responses

### Manual Testing (REQUIRED before beta)

**Authentication:**
- [ ] Sign up with email
- [ ] Verify email
- [ ] Log in
- [ ] Log out
- [ ] Forgot password
- [ ] Google OAuth

**Review Management:**
- [ ] Add review manually
- [ ] View review details
- [ ] Edit review
- [ ] Delete review
- [ ] Language detection (test 5+ languages)
- [ ] Sentiment analysis (positive, neutral, negative)

**Response Generation:**
- [ ] Generate response (English)
- [ ] Generate response (Spanish, French, German)
- [ ] Regenerate with different tone
- [ ] Edit response manually
- [ ] Save edited response
- [ ] Credit deduction works correctly
- [ ] Out of credits message appears

**Brand Voice:**
- [ ] Set brand voice preferences
- [ ] Upload sample responses
- [ ] Verify AI matches brand voice
- [ ] Update brand voice settings

**Dashboard:**
- [ ] Credit balance displays correctly
- [ ] Sentiment quota displays correctly
- [ ] Recent reviews show
- [ ] Usage stats correct
- [ ] Credit usage history pagination

**Edge Cases:**
- [ ] 0 credits remaining
- [ ] Sentiment quota exceeded
- [ ] Very long review (2,000 chars)
- [ ] Very short review (10 chars)
- [ ] Special characters in review
- [ ] Emojis in review
- [ ] Claude API error handling
- [ ] DeepSeek API error handling

---

## Definition of Done (Phase 1)

### Feature Checklist

- [ ] ✅ All acceptance criteria met for all user stories
- [ ] ✅ Database schema deployed to Supabase
- [ ] ✅ All API endpoints working
- [ ] ✅ Credit system tested with 0 errors
- [ ] ✅ Sentiment analysis working with DeepSeek
- [ ] ✅ Multi-language tested (5+ languages)
- [ ] ✅ Brand voice customization functional
- [ ] ✅ UI responsive on mobile/desktop
- [ ] ✅ Error handling for all critical flows
- [ ] ✅ Manual testing checklist completed

### Beta User Onboarding

- [ ] 5 beta users recruited
- [ ] Onboarding instructions prepared
- [ ] Feedback collection process set up
- [ ] Bug reporting method established

### Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment instructions written

### Ready for Phase 2

- [ ] All Phase 1 features stable
- [ ] No critical bugs
- [ ] Beta feedback collected
- [ ] CSV import design started

---

**Document Status:** ✅ READY FOR DEVELOPMENT

**Next Steps:**
1. Set up Next.js project
2. Configure Supabase database
3. Implement authentication (Story 1.1-1.3)
4. Build manual review input (Story 2.1-2.2)
5. Integrate Claude API (Story 3.1-3.3)
6. Add brand voice (Story 4.1)
7. Implement multi-language (Story 5.1-5.2)
8. Build credit system (Story 6.1-6.2)
9. Integrate DeepSeek (Story 7.1-7.2)
10. Create dashboard (Story 8.1)

**Estimated Timeline:** 10-14 days for solo developer with AI assistance

---

**Next Document:** 03_USER_FLOWS.md