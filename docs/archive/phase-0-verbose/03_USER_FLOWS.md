# User Flows: ReviewFlow MVP Phase 1
## Visual Journey Maps & Flow Diagrams

**Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** Ready for Development  
**Purpose:** Visual guide for implementing user journeys

---

## Document Purpose

This document maps out every user journey in Phase 1. Use these flows to:
- **Understand the complete user experience** from signup to response generation
- **Identify decision points** where the app branches based on user state
- **Design UI screens** knowing what comes before and after
- **Handle edge cases** documented at each decision point
- **Write integration tests** following these exact paths

---

## Table of Contents

1. [Flow Notation Guide](#flow-notation-guide)
2. [Core User Flows](#core-user-flows)
3. [Authentication Flows](#authentication-flows)
4. [Review Management Flows](#review-management-flows)
5. [Response Generation Flows](#response-generation-flows)
6. [Settings & Configuration Flows](#settings--configuration-flows)
7. [Error & Edge Case Flows](#error--edge-case-flows)
8. [Testing Scenarios](#testing-scenarios)

---

## Flow Notation Guide

### Symbols Used

```
[Screen/Page]           → User interface screen
(Action)                → User action or system event
{Decision?}             → Decision point (if/else)
→                       → Flow direction
║                       → Parallel processes
✓                       → Success outcome
✗                       → Error outcome
⚠️                       → Warning state
💡                      → System automation
```

### Example Flow

```
[Login Screen]
    ↓
(User enters email + password)
    ↓
{Valid credentials?}
    ├─ YES → ✓ [Dashboard]
    └─ NO  → ✗ [Login Screen] + Error message
```

---

## Core User Flows

### Flow 1: Complete New User Journey (End-to-End)

**Goal:** Take user from signup to first AI-generated response

```
START: User visits ReviewFlow
    ↓
[Landing Page]
    ↓
(Clicks "Sign Up")
    ↓
[Signup Form]
    ↓
(Enters email, password, name)
    ↓
(Clicks "Create Account")
    ↓
💡 System creates user with defaults:
   - Tier: FREE
   - Credits: 15
   - SentimentQuota: 35
   - Default BrandVoice created
    ↓
💡 System sends verification email
    ↓
[Email Verification Notice]
    "Check your email to verify your account"
    ↓
(User opens email, clicks verification link)
    ↓
💡 System marks email as verified
    ↓
[Login Screen] (auto-redirected)
    ↓
(User logs in)
    ↓
[Dashboard - Empty State]
    "Welcome! No reviews yet"
    [Add Your First Review] button
    ↓
(Clicks "Add Your First Review")
    ↓
[Add Review Form]
    ↓
(Pastes review text)
    ↓
(Selects rating: 4 stars)
    ↓
(Selects platform: "Google Business")
    ↓
💡 System auto-detects language: "English"
    ↓
(Clicks "Save Review")
    ↓
💡 System saves review to database
    ↓
💡 System checks sentiment quota (35 available)
    ↓
💡 DeepSeek analyzes sentiment → "Positive"
    ↓
💡 System deducts sentiment: 34 remaining
    ↓
[Dashboard]
    Review card appears:
    - 4 ⭐ | Google Business
    - [🟢 Positive]
    - "Great service! The team was..."
    - [Generate Response] button
    ↓
(User clicks "Generate Response" on review card)
    ↓
💡 System checks credits (15 available)
    ↓
[Loading State]
    "Generating AI response..."
    ↓
💡 Claude generates response (~3 seconds)
    ↓
💡 System deducts 1 credit: 14 remaining
    ↓
[Response Editor]
    - Shows generated response
    - Credit balance: 14/15
    - [Edit] [Regenerate] [Approve] buttons
    ↓
(User reads response - looks good!)
    ↓
(Clicks "Approve")
    ↓
💡 System marks response as approved
    ↓
[Dashboard]
    - Shows 1 review with response
    - Credits: 14/15
    - Success message: "Response approved! ✓"
    ↓
END: First response complete ✓
```

**Key Metrics:**
- Time to first response: Target <5 minutes
- Steps: 13 user actions (includes Save Review step)
- API calls: 3 (signup, sentiment, response generation)

---

### Flow 2: Returning User - Quick Response Generation

**Goal:** Experienced user generates response quickly

```
START: User returns to app
    ↓
[Login Screen]
    ↓
(User logs in with saved credentials)
    ↓
[Dashboard]
    - Shows credit balance: 8/15
    - Shows recent reviews
    - Quick action button visible
    ↓
(Clicks "Add New Review" button)
    ↓
[Add Review Form - Minimal Mode]
    ↓
(Pastes review text)
    ↓
💡 Auto-detects: Spanish, 5 stars, Positive sentiment
    ↓
(Clicks "Save Review")
    ↓
💡 System saves review with sentiment
    ↓
[Dashboard]
    New review card appears with sentiment badge
    ↓
(User clicks "Generate Response" on review card)
    ↓
💡 System checks credits (8 available) ✓
    ↓
💡 Claude generates Spanish response
    ↓
💡 Deducts 1 credit: 7 remaining
    ↓
[Response Editor]
    ↓
(User approves immediately - good response)
    ↓
✓ Response saved
    ↓
[Dashboard] (auto-return)
    ↓
END: Response complete in <30 seconds ✓
```

**Optimization Notes:**
- Minimize clicks (6 total: paste → save → click generate → approve)
- Auto-detect everything possible (language, sentiment)
- Show credit balance prominently
- Quick access to recent reviews on dashboard
- One-click approve for speed

---

## Authentication Flows

### Flow 3: Email/Password Signup

```
[Signup Form]
    ↓
(User fills form)
    ├─ Email
    ├─ Password
    └─ Name (optional)
    ↓
{Valid input?}
    ├─ NO  → Show inline errors
    │         ├─ Email invalid → "Please enter valid email"
    │         ├─ Password <8 chars → "Password must be 8+ characters"
    │         └─ Return to [Signup Form]
    │
    └─ YES → Continue
              ↓
          {Email already exists?}
              ├─ YES → ✗ Error: "Email already registered"
              │         [Login instead?] link
              │
              └─ NO  → Continue
                      ↓
                  💡 Hash password (bcrypt, cost 12)
                      ↓
                  💡 Create user in database
                      ↓
                  💡 Create default BrandVoice
                      ↓
                  💡 Send verification email
                      ↓
                  [Email Verification Notice]
                      "Check your email"
                      [Resend Email] button
                      ↓
                  {User verifies email?}
                      ├─ YES → ✓ [Login Screen]
                      └─ NO  → User can resend email
                                (max 3 times per hour)
```

**Edge Cases:**
- Verification link expires (24 hours) → Show "Expired" message + Resend option
- User closes tab → Can return later, resend verification
- Email delivery fails → Show support contact

---

### Flow 4: Google OAuth Signup/Login

```
[Landing/Login Page]
    ↓
(Clicks "Continue with Google")
    ↓
💡 Redirect to Google OAuth
    ↓
[Google Authorization Page]
    ↓
(User grants permissions)
    ↓
{Permissions granted?}
    ├─ NO  → ✗ Return to [Login Page]
    │         "Authorization cancelled"
    │
    └─ YES → Continue
              ↓
          💡 Google redirects back with token
              ↓
          {User exists in database?}
              ├─ YES → ✓ [Dashboard]
              │         (Login successful)
              │
              └─ NO  → Create new user
                      ↓
                  💡 Create user with:
                     - Email: from Google
                     - Name: from Google
                     - Image: from Google
                     - EmailVerified: true (Google verified)
                     - Tier: FREE
                     - Credits: 15
                     - SentimentQuota: 35
                      ↓
                  💡 Create default BrandVoice
                      ↓
                  ✓ [Dashboard - Welcome Screen]
                      "Welcome! Get started with your first review"
```

**Benefits:**
- No password to remember
- No email verification needed (Google verified)
- Faster signup (2 clicks vs 5+ fields)
- Profile photo automatically imported

---

### Flow 5: Password Reset

```
[Login Screen]
    ↓
(Clicks "Forgot Password?")
    ↓
[Password Reset Request]
    ↓
(Enters email)
    ↓
{Email exists?}
    ├─ NO  → Still show "Email sent" (security)
    │         (Don't reveal if email exists)
    │
    └─ YES → Continue
              ↓
          💡 Generate reset token (expires 1 hour)
              ↓
          💡 Send reset email
              ↓
          [Check Email Screen]
              "Password reset link sent"
              ↓
          (User clicks link in email)
              ↓
          {Token valid?}
              ├─ NO  → [Token Expired]
              │         "Link expired. Request new one"
              │         [Request New Link] button
              │
              └─ YES → [Set New Password]
                        ↓
                    (User enters new password)
                        ↓
                    {Password valid?}
                        ├─ NO  → Show error, stay on page
                        └─ YES → 💡 Update password
                                  ↓
                              ✓ [Login Screen]
                                  "Password updated! Please login"
```

**Security Notes:**
- Token expires in 1 hour
- Token can only be used once
- Don't reveal if email exists (prevents enumeration)
- Rate limit: 3 reset emails per hour per email

---

## Review Management Flows

### Flow 6: Add Review Manually (Complete)

```
[Dashboard]
    ↓
(Clicks "Add New Review")
    ↓
[Add Review Form]
    ↓
(User interaction)
    ║
    ║─→ (Pastes/types review text)
    ║     ↓
    ║   💡 Character counter updates (0-2000)
    ║     ↓
    ║   💡 On blur: franc detects language
    ║     ↓
    ║   {Language detected?}
    ║     ├─ Success → Show "Detected: [Language]"
    ║     └─ Failed  → Show "Detected: English" (default)
    ║                  + Manual override dropdown
    ║
    ║─→ (Selects star rating - optional)
    ║     ↓
    ║   [⭐⭐⭐⭐☆] (4 stars selected)
    ║
    ║─→ (Selects platform)
    ║     ↓
    ║   Dropdown: Google Business, Amazon, Shopify, Other
    ║
    ║─→ (Enters reviewer name - optional)
    ║─→ (Enters review date - optional)
    ║
    ↓
(Clicks "Save Review")
    ↓
{Form valid?}
    ├─ NO  → Show validation errors
    │         ├─ Review text empty → "Review text required"
    │         ├─ Review text <10 chars → "Review too short"
    │         └─ Review text >2000 chars → "Review too long (max 2000)"
    │
    └─ YES → Continue
              ↓
          💡 Save review to database
              ↓
          {Sentiment quota available?}
              ├─ YES → 💡 Call DeepSeek API
              │         ↓
              │       💡 Analyze sentiment (2 seconds)
              │         ↓
              │       {Sentiment API success?}
              │         ├─ YES → Save sentiment: Positive/Neutral/Negative
              │         │         Deduct from quota
              │         └─ NO  → Set sentiment: null
              │                   Log error, continue anyway
              │
              └─ NO  → ⚠️ Skip sentiment analysis
                        Set sentiment: null
                        Continue to save
                        ↓
          ✓ [Dashboard] (auto-return)
              Success message: "Review saved! ✓"
              ↓
          [Review Card Created]
              Shows:
              - Review text
              - Rating (if provided)
              - Platform
              - Sentiment badge (if available)
              - Detected language
              - [Generate Response] button
              - [Edit] [Delete] buttons
              ↓
          END: Review saved, ready for response generation later
```

**Validation Rules:**
- Review text: 1-2,000 characters (required)
- Rating: 1-5 or null (optional)
- Platform: Must select from list
- Reviewer name: 0-100 characters (optional)
- Review date: Valid date or null (optional)

**Edge Cases:**
- Very short review (<10 words) → Language detection may fail, allow manual override
- Emojis in review → Fully supported, passed to Claude
- Mixed language review → Detect dominant language
- Sentiment quota exceeded → Still allow review + response, just no sentiment
- DeepSeek API down → Log error, set sentiment null, continue

---

### Flow 6B: Review Triage & Prioritization

**Goal:** User adds multiple reviews, then prioritizes which need responses

```
[Dashboard] after adding multiple reviews
    ↓
User sees review list with sentiment badges:
    
    ┌─────────────────────────────────────────┐
    │  [🔴 Negative] 1⭐ | Google Business     │
    │  "Terrible service, waited 2 hours..."  │
    │  [Generate Response] [Edit] [Delete]    │
    ├─────────────────────────────────────────┤
    │  [🔴 Negative] 2⭐ | Amazon              │
    │  "Product broke after one use..."       │
    │  [Generate Response] [Edit] [Delete]    │
    ├─────────────────────────────────────────┤
    │  [🟡 Neutral] 3⭐ | Shopify              │
    │  "It's okay, nothing special..."        │
    │  [Generate Response] [Edit] [Delete]    │
    ├─────────────────────────────────────────┤
    │  [🟢 Positive] 5⭐ | Google Business     │
    │  "Amazing experience! Will return..."   │
    │  [Generate Response] [Edit] [Delete]    │
    └─────────────────────────────────────────┘
    
    Credits: 15/15 available
    Sentiment: 31/35 remaining
    ↓
💡 User strategy:
    1. Respond to negative reviews first (damage control)
    2. Then neutral reviews (might convert to positive)
    3. Positive reviews last (maintain goodwill)
    ↓
(User clicks "Generate Response" on first negative review)
    ↓
→ Go to Flow 9 (Generate First Response)
    ↓
[Response generated and approved]
    ↓
[Dashboard] (auto-return)
    Credits now: 14/15
    ↓
    ┌─────────────────────────────────────────┐
    │  [🔴 Negative] 1⭐ | Google Business     │
    │  "Terrible service, waited 2 hours..."  │
    │  ✓ Response approved                    │
    │  [View Response] [Edit Response] [Delete]│
    ├─────────────────────────────────────────┤
    │  [🔴 Negative] 2⭐ | Amazon              │
    │  "Product broke after one use..."       │
    │  [Generate Response] [Edit] [Delete]    │ ← Next priority
    └─────────────────────────────────────────┘
    ↓
(User continues with next negative review)
    ↓
END: Batch workflow completed efficiently
```

**Key Benefits:**
- ✅ **Batch input:** Add all reviews at once
- ✅ **Smart prioritization:** Sentiment-driven triage
- ✅ **Credit awareness:** See total reviews vs available credits
- ✅ **CSV/Integration ready:** When 100s sync, user picks which matter
- ✅ **Better workflow:** Less pressure, more control

**Use Cases:**
1. **Daily triage:** User adds 10 reviews each morning, responds to 5 worst ones
2. **CSV import:** User uploads 100 Amazon reviews, responds only to negative ones
3. **Platform sync:** Google Business syncs 50 reviews, user responds to recent negatives
4. **Credit management:** User with 15 credits prioritizes 7 most critical reviews

---

### Flow 7: Edit Existing Review

```
[Dashboard] or [Review Detail Page]
    ↓
(Clicks "Edit" on review card)
    ↓
[Edit Review Form]
    - Pre-filled with existing data
    - All fields editable
    ↓
(User makes changes)
    ↓
(Clicks "Save Changes")
    ↓
💡 Update review in database
    ↓
{Review text changed significantly?}
    ├─ YES → ⚠️ Show warning:
    │         "Review text changed. Regenerate response?"
    │         [Keep Current Response] [Regenerate]
    │         ├─ Keep → Save and exit
    │         └─ Regenerate → Trigger response generation (costs credit)
    │
    └─ NO  → ✓ Save changes
              Return to [Dashboard]
```

**Significance Check:**
- >50% of text changed = Significant
- Language changed = Significant
- Rating changed by ≥2 stars = Significant

---

### Flow 8: Delete Review

```
[Dashboard] or [Review Detail Page]
    ↓
(Clicks "Delete" on review card)
    ↓
[Confirmation Modal]
    "Delete this review and its response?"
    ⚠️ "This cannot be undone"
    [Cancel] [Delete]
    ↓
{User confirms?}
    ├─ NO  → Close modal, no action
    │
    └─ YES → 💡 Delete review from database
              💡 Delete associated response (cascade)
              💡 Delete credit usage records (cascade)
              ↓
          ⚠️ Credits NOT refunded (anti-abuse)
              ↓
          ✓ [Dashboard]
              Success message: "Review deleted"
```

**Important:** No credit refunds on deletion to prevent abuse (generate many, delete to get credits back)

---

## Response Generation Flows

### Flow 9: Generate First Response

```
[Review Card] with no response
    ↓
(User clicks "Generate Response")
    ↓
{User has credits?}
    ├─ NO  → ✗ [Out of Credits Modal]
    │         "You've used all 15 credits"
    │         [Upgrade to Starter] [Maybe Later]
    │         └─ END (can't generate)
    │
    └─ YES → Continue
              ↓
          [Loading State]
              "Generating AI response..."
              Progress bar (fake, looks professional)
              ↓
          💡 Build prompt:
              - Review text
              - Rating
              - Detected language
              - Brand voice settings
              ↓
          💡 Call Claude API
              ↓
          {API call success?}
              ├─ NO  → ✗ Handle error (Flow 15)
              │
              └─ YES → Continue
                      ↓
                  💡 Atomic transaction:
                      1. Deduct 1 credit
                      2. Log credit usage
                      3. Save response to database
                      ↓
                  ✓ [Response Editor]
                      Shows:
                      - Generated response text
                      - Credits remaining: X/15
                      - [Edit] [Regenerate ▼] [Approve]
                      ↓
                  {User action?}
                      ├─ Approve → Flow 11
                      ├─ Edit → Flow 12
                      └─ Regenerate → Flow 10
```

**Performance Target:** <5 seconds from click to response displayed

---

### Flow 10: Regenerate with Tone Adjustment

```
[Response Editor] with existing response
    ↓
(Clicks "Regenerate" dropdown)
    ↓
[Tone Options Menu]
    ├─ More Friendly
    ├─ More Professional
    ├─ More Apologetic
    └─ More Enthusiastic
    ↓
(User selects "More Friendly")
    ↓
{User has credits?}
    ├─ NO  → ✗ [Out of Credits Modal]
    │         (Same as Flow 9)
    │
    └─ YES → Continue
              ↓
          [Loading State]
              "Regenerating with friendly tone..."
              ↓
          💡 Build regenerate prompt:
              - Original prompt
              - Previous response (for context)
              - Tone modifier: "More Friendly"
              ↓
          💡 Call Claude API
              ↓
          {API success?}
              ├─ NO  → ✗ Handle error (Flow 15)
              │         Refund credit
              │
              └─ YES → Continue
                      ↓
                  💡 Atomic transaction:
                      1. Deduct 1 credit
                      2. Log credit usage
                      3. Save as new version
                      4. Update main response
                      ↓
                  ✓ [Response Editor]
                      New response displayed
                      Previous version saved in history
                      [Undo to Previous] button available
                      Credits: X-1/15
```

**Version History:**
- Each regeneration creates a new ResponseVersion record
- Main response always shows latest
- Up to 10 versions kept (older deleted)
- [Undo] reverts to previous version (free, no API call)

---

### Flow 11: Approve Response

```
[Response Editor]
    ↓
(User reviews AI response - looks good!)
    ↓
(Clicks "Approve" button)
    ↓
💡 Update response status:
    isPublished: true
    publishedAt: now()
    ↓
✓ [Dashboard] (auto-return)
    Success message: "Response approved! ✓"
    ↓
[Review Card] now shows:
    - Original review
    - Approved response
    - ✓ "Approved" badge
    - Credits used: 2 (if regenerated once)
```

**Note:** "Approve" doesn't auto-post to platforms (that's Phase 3). It just marks as ready.

---

### Flow 12: Edit Response Manually

```
[Response Editor]
    ↓
(User clicks in text area to edit)
    ↓
💡 Enable editing mode
    [Save Changes] button appears
    ↓
(User types/deletes text)
    ↓
💡 Character counter shows 0-500 (live)
    ↓
{Character count valid?}
    ├─ >500 → ⚠️ "Response too long (max 500 chars)"
    │         Disable [Save Changes]
    │
    └─ ≤500 → Continue
              ↓
          (User clicks "Save Changes")
              ↓
          💡 Update response:
              responseText: newText
              isEdited: true
              editedAt: now()
              ↓
          ⚠️ NO credit charged (manual edits are free)
              ↓
          ✓ Response saved
              "Response updated" message
              [Approve] button still available
```

**Free Edits:**
- Manual editing costs 0 credits
- Encourages user refinement
- Builds trust in AI suggestions

---

### Flow 12B: Delete Response Only

> **DEPRECATED (January 18, 2026):** This flow was removed as redundant. Users can regenerate responses instead of deleting them. Kept for historical reference only.

**Goal:** Delete AI response without deleting the review

```
[Review Detail Page] with approved response
    ↓
(User clicks "Delete Response" button)
    ↓
[Confirmation Modal]
    ┌─────────────────────────────────────┐
    │  Delete Response?                   │
    │                                     │
    │  This will remove the AI response   │
    │  but keep the review. You'll need   │
    │  to regenerate a new response.      │
    │                                     │
    │  ⚠️ Credits will NOT be refunded    │
    │                                     │
    │  [Cancel] [Delete Response]         │
    └─────────────────────────────────────┘
    ↓
{User confirms?}
    ├─ NO  → Close modal, no action
    │
    └─ YES → Continue
              ↓
          💡 Delete ReviewResponse from database
              ↓
          💡 Cascade: ResponseVersion deleted
              ↓
          💡 CreditUsage.reviewResponseId → null (SET NULL)
              ↓
          💡 Credit usage snapshot PRESERVED in details field
              ↓
          ⚠️ Credits NOT refunded (anti-abuse policy)
              ↓
          ✓ [Review Detail Page]
              Review still exists
              Response section empty
              [Generate Response] button available
              ↓
          Success message: "Response deleted. Generate a new one?"
```

**Key Points:**
- Review remains intact (can be viewed, edited)
- All response versions deleted (cascade)
- Credit usage audit trail preserved (snapshot in details)
- No refund (prevents abuse: generate many, delete to get credits back)
- User can immediately regenerate new response

**Use Cases:**
1. **Wrong tone:** "This sounds too formal, let me try friendly"
2. **Content mistake:** "Oops, mentioned wrong product name"
3. **Change of mind:** "Actually, I don't want to respond to this anymore"
4. **Multiple attempts:** "Let me regenerate from scratch with different brand voice"

**Audit Trail Preserved:**
```typescript
// After deletion, CreditUsage still shows:
{
  reviewId: 'review_abc',
  reviewResponseId: null,  // ← Response deleted
  creditsUsed: 2,          // ✓ Still tracked
  action: 'GENERATE_RESPONSE',
  details: {
    responseSnapshot: {
      text: "Thank you for the wonderful...",
      tone: "friendly"
    }
  }
}
```

---

## Settings & Configuration Flows

### Flow 13: Set Up Brand Voice (First Time)

```
[Dashboard] for new user
    ↓
💡 System detects: No custom brand voice yet
    ↓
⚠️ Show suggestion banner:
    "Customize your brand voice for better responses"
    [Set Up Now] [Maybe Later]
    ↓
{User clicks "Set Up Now"?}
    ├─ NO  → Dismiss banner, use defaults
    │
    └─ YES → [Brand Voice Settings]
              ↓
          [Guided Setup - Step 1/4]
              "What tone best describes your brand?"
              ( ) Friendly & Warm
              (•) Professional & Polished
              ( ) Casual & Approachable
              ( ) Formal & Traditional
              [Next]
              ↓
          [Step 2/4]
              "Formality level"
              Casual [•────────] Formal (3/5)
              [Back] [Next]
              ↓
          [Step 3/4]
              "Key phrases (optional)"
              "Add phrases you want to use"
              [Thank you]  [We appreciate]  [+ Add]
              [Back] [Next]
              ↓
          [Step 4/4]
              "Writing style notes (optional)"
              ┌─────────────────────────────┐
              │ Be genuine and empathetic.  │
              │ Use first-person plural.    │
              └─────────────────────────────┘
              [Back] [Save & Generate Sample]
              ↓
          (User clicks "Save & Generate Sample")
              ↓
          💡 Save brand voice settings
              ↓
          💡 Generate sample response to show effect
              (Uses 0 credits - sample only)
              ↓
          [Sample Preview]
              "Here's how your responses will sound:"
              [Sample response displayed]
              [Looks Good!] [Adjust Settings]
              ↓
          ✓ [Dashboard]
              "Brand voice saved! ✓"
```

**First-Time UX:**
- Guided 4-step wizard (not overwhelming)
- Optional fields clearly marked
- Live sample preview (0 credits)
- Can skip and use defaults

---

### Flow 14: View Credit Usage History

```
[Dashboard]
    ↓
(Clicks credit balance widget)
    ↓
[Credit Usage Modal]
    Shows:
    - Current balance: 8/15
    - Total used this month: 7
    - [View Full History] link
    ↓
(Clicks "View Full History")
    ↓
[Credit Usage History Page]
    ↓
    Filters:
    - Date range picker
    - Action type dropdown
    - Status filter (All/Active/Deleted/Anonymized)
    ↓
    Enhanced table view (paginated, 20 per page):
    ┌──────────────────────────────────────────────────────────────┐
    │ Date       Action      Credits  Preview              Status  │
    ├──────────────────────────────────────────────────────────────┤
    │ Jan 5 2:34 Generated   -1       "Great service!"     ✓ Active│
    │                                  ⭐⭐⭐⭐⭐ Google              │
    │                                  Response: "Thank..."         │
    │                                  (Friendly tone)              │
    │                                  [View Full Response]         │
    ├──────────────────────────────────────────────────────────────┤
    │ Jan 5 2:35 Regenerated -1       "Great service!"     ✓ Active│
    │                                  [Same review]                │
    │                                  Response: "We're so..."      │
    │                                  (Enthusiastic tone)          │
    │                                  [View Full Response]         │
    ├──────────────────────────────────────────────────────────────┤
    │ Jan 4 3:12 Generated   -1       "Terrible service!"  ✗ Deleted│
    │                                  ⭐ Amazon                     │
    │                                  Response: "We apologize..."  │
    │                                  (Apologetic tone)            │
    │                                  [Audit Details Only]         │
    ├──────────────────────────────────────────────────────────────┤
    │ Jan 3 10:15 Generated  -1       "[NAME] was rude..."🔒 Anon  │
    │                                  ⭐ Google                     │
    │                                  Response: "[NAME] will..."   │
    │                                  (Professional tone)          │
    │                                  [Audit Details Only]         │
    ├──────────────────────────────────────────────────────────────┤
    │ Jan 4 3:15 Refund      +1       API Error                    │
    │                                  Credit automatically refunded│
    └──────────────────────────────────────────────────────────────┘
    ↓
(User clicks on a row)
    ↓
{Row status?}
    ├─ ACTIVE → [Response Detail Modal]
    │             - Full review text (from database)
    │             - Full response text (from database)
    │             - All metadata
    │             - [View Review Page] button
    │
    ├─ DELETED → [Audit Detail Modal]
    │             - Review snapshot (200 chars)
    │             - Response snapshot (200 chars)
    │             - Tone used
    │             - Timestamp
    │             - ℹ️ "Original content deleted by user"
    │             - Cannot view full (no longer exists)
    │
    └─ ANONYMIZED → [Audit Detail Modal]
                     - Anonymized review text "[NAME] was rude..."
                     - Anonymized response "[NAME] will..."
                     - Metadata preserved (rating, platform, tone)
                     - 🔒 "Data anonymized (GDPR compliance)"
                     - ℹ️ "Personal information redacted"
```

**Enhanced Features:**
- ✅ Shows preview from snapshot (even if deleted)
- ✅ Status badges: Active (green ✓), Deleted (red ✗), Anonymized (lock 🔒)
- ✅ Tone indicator for each generation
- ✅ Version number for regenerations
- ✅ Platform and rating visible
- ✅ Different actions based on status:
  - Active → View full response
  - Deleted → View snapshot only
  - Anonymized → View redacted version
- ✅ Export to CSV (includes all snapshots)
- ✅ Filter by status

**Display Logic:**
```typescript
// Parse details field for display
function getDisplayData(record) {
  const details = JSON.parse(record.details || '{}');
  
  if (details.anonymized) {
    return {
      reviewPreview: details.reviewSnapshot.text,  // Already anonymized
      responsePreview: details.responseSnapshot.text,
      status: 'anonymized',
      icon: '🔒',
      canViewFull: false,
      badge: 'GDPR Anonymized'
    };
  }
  
  if (!record.reviewResponseId) {
    return {
      reviewPreview: details.reviewSnapshot?.text || '[Deleted]',
      responsePreview: details.responseSnapshot?.text || '[Deleted]',
      status: 'deleted',
      icon: '✗',
      canViewFull: false,
      badge: 'Deleted'
    };
  }
  
  return {
    reviewPreview: details.reviewSnapshot?.text || 'N/A',
    responsePreview: details.responseSnapshot?.text || 'N/A',
    status: 'active',
    icon: '✓',
    canViewFull: true,
    badge: 'Active'
  };
}
```

**Features:**
- Export to CSV (for accounting)
- Filter by date range
- Filter by action type
- See which reviews used credits
- Track refunds

---

## Error & Edge Case Flows

### Flow 15: Claude API Error (Retry & Refund)

```
[Response Generation in progress]
    ↓
💡 Call Claude API
    ↓
{API response?}
    ├─ Timeout (>30s) → Go to Error Handler
    ├─ 429 Rate Limit → Go to Error Handler
    ├─ 500 Server Error → Go to Error Handler
    ├─ Network Error → Go to Error Handler
    └─ 200 Success → ✓ Continue normally
    ↓
ERROR HANDLER:
    ↓
💡 Automatic retry logic:
    Attempt 1 → Wait 1s → Retry
    Attempt 2 → Wait 2s → Retry
    Attempt 3 → Wait 4s → Retry
    ↓
{Any retry successful?}
    ├─ YES → ✓ Continue with response
    │
    └─ NO  → After 3 failed attempts:
              ↓
          💡 Refund credit (atomic transaction):
              1. Increment user.credits by 1
              2. Log refund in credit_usage
              3. Set reviewResponse status: FAILED
              ↓
          ✗ [Error Modal]
              "Failed to generate response"
              "We've refunded your credit."
              "This might be temporary. Try again?"
              [Try Again] [Cancel]
              ↓
          {User clicks "Try Again"?}
              ├─ YES → Restart generation (Flow 9)
              └─ NO  → Return to [Dashboard]
```

**Retry Strategy:**
- Exponential backoff: 1s, 2s, 4s
- Total 3 attempts (7 seconds max retry time)
- Automatic credit refund on final failure
- Clear error message to user
- Option to retry immediately

---

### Flow 16: Out of Credits (Paywall)

```
[Anywhere in app]
    ↓
(User tries to generate response)
    ↓
💡 Check credits: 0 remaining
    ↓
✗ [Out of Credits Modal]
    ┌─────────────────────────────────────┐
    │  💎 You're out of credits!          │
    │                                     │
    │  You've used all 15 free credits    │
    │  this month.                        │
    │                                     │
    │  Upgrade to Starter for more:       │
    │  → Get 60 credits/month             │
    │  → Only $29/month                   │
    │                                     │
    │  [Upgrade to Starter]               │
    │  [Maybe Later]                      │
    └─────────────────────────────────────┘
    ↓
{User choice?}
    ├─ "Maybe Later" → Close modal
    │                   Return to previous screen
    │                   Still can't generate (blocked)
    │
    └─ "Upgrade" → [Upgrade Flow - Phase 2]
                    (Payment processing not in Phase 1)
```

**Phase 1 Limitation:**
- Modal shows but payment NOT implemented
- Only shows upgrade option (no credit top-ups in MVP)
- Acts as motivator to finish Phase 2
- Helps beta testers see upgrade path

---

### Flow 17: Sentiment Quota Exceeded

```
[Review being added]
    ↓
💡 Check sentiment quota
    ↓
{Quota available?}
    ├─ YES → Run sentiment analysis normally
    │
    └─ NO  → SKIP SENTIMENT:
              ↓
          💡 Set sentiment: null
              ↓
          ⚠️ Show info banner (dismissible):
              "Sentiment quota exceeded (35/35 used)"
              "Responses still work! Quota resets [Date]"
              [Got It] [Upgrade for More]
              ↓
          ✓ Continue to response generation
              (Everything works except sentiment badge)
```

**User Communication:**
- Clear but non-alarming message
- Emphasize: "Responses still work!"
- Show when quota resets
- Subtle upgrade CTA
- Review + response generation unaffected

---

### Flow 18: Language Detection Failure

```
[Add Review Form]
    ↓
(User pastes review text)
    ↓
💡 franc attempts language detection
    ↓
{Detection result?}
    ├─ 'und' (undetermined) → Fallback
    ├─ Text too short (<30 chars) → Fallback
    └─ Success → Show detected language ✓
    ↓
FALLBACK HANDLER:
    ↓
💡 Default to "English"
    ↓
⚠️ Show manual override:
    "Detected: English (not sure)"
    [Select different language ▼]
    ↓
{User overrides?}
    ├─ YES → Use user-selected language
    └─ NO  → Proceed with English
```

**Manual Override Dropdown:**
- 40+ supported languages
- Search functionality for quick access
- Most common at top (English, Spanish, French, German)

---

## Testing Scenarios

### Happy Path Tests

1. **End-to-End New User:**
   - Signup → Verify Email → Login → Add Review → Generate Response → Approve
   - Target: <5 minutes total

2. **Returning User Quick Generate:**
   - Login → Add Review → Generate → Approve
   - Target: <30 seconds total

3. **Multi-Language:**
   - Add Spanish review → Verify Spanish response
   - Add French review → Verify French response

4. **Brand Voice Application:**
   - Set tone: Friendly → Generate response → Verify friendly tone

### Edge Case Tests

5. **Out of Credits:**
   - Use all 15 credits → Try generate → See upgrade modal

6. **Sentiment Quota Exceeded:**
   - Use 35 sentiment analyses → Add review → Verify: No sentiment, but response works

7. **API Failures:**
   - Mock Claude API error → Verify: Credit refunded + retry option

8. **Language Detection:**
   - Very short review → Verify: Manual override option

---

## Performance Targets

| Flow | Target Time |
|------|-------------|
| Signup → First Response | <5 minutes |
| Add Review → Response Ready | <10 seconds |
| Login | <2 seconds |
| Dashboard Load | <1 second |
| Response Generation | <5 seconds |

---

**Document Status:** ✅ READY FOR DEVELOPMENT

**Next Document:** 04_DATA_MODEL.md (Complete Database Schemas & Relationships)