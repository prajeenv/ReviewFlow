# ReviewFlow Technical Decisions

**Purpose:** Document all significant technical decisions, architectural choices, and deviations from original specifications.

**Last Updated:** January 19, 2026

---

## Decision Framework

When documenting decisions, include:
- **What:** The decision made
- **Why:** Reasoning behind the decision
- **Alternatives:** What other options were considered
- **Trade-offs:** Pros and cons
- **Impact:** How this affects the project
- **Source:** Where this was specified (or if it's a deviation)
- **Date:** When the decision was made
- **Risk Level:** Low ✅ | Medium ⚠️ | High 🚨

---

## Table of Contents

1. [Phase 0: Documentation Decisions](#phase-0-documentation-decisions)
2. [Prompt 0: Planning & Architecture](#prompt-0-planning--architecture)
3. [Prompt 1: Project Setup](#prompt-1-project-setup)
4. [Prompt 2: Database](#prompt-2-database)
5. [Prompt 3: Authentication](#prompt-3-authentication)
6. [Prompt 4: Dashboard & UI](#prompt-4-dashboard--ui)
7. [Prompt 5: Review Management](#prompt-5-review-management)
8. [Prompt 6: Brand Voice](#prompt-6-brand-voice)
9. [Prompt 7: AI Response Generation](#prompt-7-ai-response-generation)
10. [Prompt 8: Sentiment Analysis](#prompt-8-sentiment-analysis)
11. [Prompt 9: Credit System](#prompt-9-credit-system)
12. [Prompt 10: Testing & Deployment](#prompt-10-testing--deployment)
13. [Deviations from Specifications](#deviations-from-specifications)

---

## Phase 0: Documentation Decisions

### Credit-Based Pricing Model
- **Decision:** Use credit-based pricing instead of review-based pricing
- **Why:** Aligns costs with actual AI usage, prevents abuse, clearer value metric
- **Alternatives:** Per-review pricing, unlimited usage tiers
- **Source:** 01_PRODUCT_ONE_PAGER.md
- **Date:** January 5, 2026
- **Impact:** Requires credit tracking system, fraud prevention
- **Risk Level:** Low ✅

### Separate Sentiment Quota
- **Decision:** DeepSeek API for sentiment with separate quota from response credits
- **Why:** DeepSeek is 10x cheaper than Claude, enables more sentiment analyses
- **Alternatives:** Use Claude for sentiment (expensive), skip sentiment analysis
- **Source:** 01_PRODUCT_ONE_PAGER.md
- **Date:** January 5, 2026
- **Impact:** Need separate quota tracking, two API integrations
- **Risk Level:** Low ✅

### Three-Tier Pricing (No Enterprise)
- **Decision:** FREE, STARTER, GROWTH tiers only - no Enterprise tier for MVP
- **Why:** Enterprise needs features we don't have yet (SSO, white-label, SLA)
- **Alternatives:** Launch with placeholder Enterprise tier
- **Source:** 01_PRODUCT_ONE_PAGER.md
- **Date:** January 5, 2026
- **Impact:** May miss some enterprise leads initially
- **Risk Level:** Low ✅

### Manual Input Before Integrations
- **Decision:** Start with manual review input, add CSV then API integrations
- **Why:** Faster MVP validation, CSV covers most use cases
- **Alternatives:** Build Google integration first
- **Source:** 02_PRD_MVP_PHASE1.md
- **Date:** January 5, 2026
- **Impact:** Slower initial growth but faster to market
- **Risk Level:** Low ✅

---

## Prompt 0: Planning & Architecture

*Decisions to be added after completing Prompt 0*

**Expected Decisions:**
- Final tech stack validation
- Folder structure confirmation
- Integration strategy refinements
- Timeline adjustments based on complexity


**Result**
1. Significant Technical Decisions
Decision	Reason
NextAuth.js v5 (beta)	Better App Router support; newer patterns; will be stable soon
Prisma over raw SQL	Type safety; migrations; developer experience
DeepSeek for sentiment	10x cheaper than Claude; good enough accuracy for classification
shadcn/ui over custom components	Production-ready; accessible; highly customizable
JWT sessions over database sessions	Faster reads; less DB load; good for MVP scale
Separate sentiment quota	Cost optimization; allows generous free tier
franc-min for language detection	Lightweight; supports 40+ languages; runs client & server
Resend over SendGrid/SES	Modern API; great DX; generous free tier
2. Deviations from Phase 0 Specifications
None for Prompt 0 - This is the planning phase, no implementation yet.

Note: The Phase 0 specs are well-designed. Potential future deviations will be documented as they occur in subsequent prompts.

---

## Prompt 1: Project Setup

*Decisions to be added after completing Prompt 1*

**Potential Decisions:**
- Node.js version (18.x vs 20.x)
- Package manager (npm vs yarn vs pnpm)
- UI component library versions
- Development tooling choices

1. Significant Technical Decisions
Decision	Reason
Next.js 14.2.35 (not 15)	Stable version; NextAuth v5 beta has better compatibility with 14.x
Manual project setup	Existing docs folder required careful integration vs. create-next-app
Tailwind 3.4 (not 4.x)	Better shadcn/ui compatibility; Tailwind v4 is still in beta
ESLint 8.x	Next.js 14 uses ESLint 8; v9 has breaking changes
React 18.x	Stable version; React 19 not needed for this project
Geist font	Modern, professional font from Vercel; good for SaaS
Sonner for toasts	Better DX than react-hot-toast; shadcn compatible
Manual shadcn components	CLI can be unreliable; manual gives more control
Custom badge variants	Added positive/neutral/negative for sentiment display
Removed postinstall script	Prisma generate fails without full schema; will add back in Prompt 2
2. Deviations from Phase 0 Specifications
Spec Said	Implemented	Why	Risk
next.config.ts	next.config.mjs	Next.js 14 doesn't support .ts config files	None
npx shadcn-ui@latest add CLI	Manual component creation	CLI can be unreliable; manual approach is more predictable	Low
postinstall: "prisma generate"	Removed	Prisma fails without full schema; will restore in Prompt 2	None
Full Prisma schema	Placeholder schema	Full schema is Prompt 2 scope	None - intentional


---

## Prompt 2: Database

*Decisions to be added after completing Prompt 2*

**Potential Decisions:**
- ID generation strategy (CUID vs UUID)
- Soft delete implementation details
- Index optimization choices
- Database pooling configuration

1. Significant Technical Decisions
Decision	Reason
Prisma 5.22.0 (not 7.x)	Prisma 7 has breaking changes requiring config files for url; v5 is stable
Direct database URL	Supabase pooler URL had "Tenant not found" errors; direct URL works reliably
db push instead of migrate	Better for initial development; migrations should be used for production
Atomic transactions for credits	Prevents race conditions when deducting credits; ensures data integrity
Separate audit tables	GDPR compliance - audit trails survive data deletion
Cascading deletes on User	When user is deleted, all related data is deleted (GDPR right to deletion)
SetNull for audit references	Audit trails preserved when reviews/responses are deleted
Re-export Prisma types	Single source of truth for database types
2. Deviations from Phase 0 Specifications
Spec Said	Implemented	Why	Risk
Prisma 5.x	Prisma 5.22.0	Spec said 5.x, used latest stable 5.x	None
migrate dev --name init	db push	Faster for initial setup; migrate for production	Low
Supabase pooler URL format	Direct database URL	Pooler had authentication errors with project-ref username format	Low
URL-encoded password in pooler	Direct URL with simple username	Pooler format postgres.projectref:pass didn't work	Low

---


## Prompt 3: Authentication

*Decisions to be added after completing Prompt 3*

**Potential Decisions:**
- Session strategy (JWT vs database sessions)
- Session duration (30 days per spec)
- Password hashing cost factor (12 per spec)
- OAuth providers order of implementation
- Rate limiting thresholds

**From Specification:**
These are NOT decisions (they're specified), but document here for reference:
- JWT session strategy (per 07_AUTHENTICATION_SYSTEM.md line 147)
- bcrypt cost factor 12 (per 06_SECURITY_PRIVACY.md line 89)
- 30-day session duration (per 07_AUTHENTICATION_SYSTEM.md line 149)
- Rate limit: 5 attempts/15 minutes (per spec)

---
1. Significant Technical Decisions
Decision	Reason
NextAuth v5 (beta) over v4	Better App Router integration, improved TypeScript support, new auth() function for middleware
JWT session strategy	Stateless authentication, 30-day sessions, reduced database load
In-memory rate limiting fallback	Allows development without Upstash Redis while still providing rate limiting
bcryptjs (pure JS)	Works in all environments including Edge, no native compilation
Suspense boundaries	Required by Next.js 14 for pages using useSearchParams during static generation
Split auth config	Moved config to src/lib/auth.ts for better organization and testability
2. Deviations from Phase 0 Specifications
Spec Said	Implemented	Why	Risk
withAuth middleware	Custom middleware using auth()	NextAuth v5 deprecates withAuth	Low
Upstash Redis required	In-memory fallback when Redis not configured	Better DX for local development	Low
No password strength UI	Added visual indicator with checklist	Better UX	None
Fewer auth pages	Added /forgot-password, /reset-password, /verify-email, /error	Complete auth flow	None


## Prompt 4: Dashboard & UI

*Decisions to be added after completing Prompt 4*

**Potential Decisions:**
- Color scheme and branding
- Component library usage patterns
- Responsive breakpoints
- Navigation structure
- Empty state designs

---
1. Significant Technical Decisions
Decision	Reason
Client-side layout with useSession	Changed from server component to client component for the dashboard layout to enable real-time updates of credit balance and mobile menu state management
Separate API endpoint for dashboard stats	Created /api/dashboard/stats instead of embedding data in the layout to enable data refresh without full page reload and keep layout lightweight
QuotaCard vs StatsCard separation	Split into two components - QuotaCard shows progress bars with reset dates (for credits/sentiment), StatsCard shows simple metrics with trends
Mobile sidebar using Sheet component	Used shadcn/ui Sheet for mobile navigation instead of custom drawer for consistency and accessibility
Toast notifications via Sonner	Sonner was already set up in Prompt 1; leveraged it for error notifications on dashboard load failures
Tier limits aligned to CORE_SPECS.md	Updated constants to match spec (FREE: 15 credits, 35 sentiment instead of earlier values of 5/10)
2. Deviations from Phase 0 Specifications
Spec Said	What I Implemented	Why	Risk
"Navbar.tsx" as separate component	Integrated into DashboardHeader	The header IS the top navigation bar; creating separate file would be redundant	Low - same functionality
No specification for loading states	Added skeleton loading states	Better UX while data fetches	None - enhancement
Review detail page link	Links to /dashboard/reviews/[id] (not yet implemented)	Following spec's planned route structure	Low - page will be built in Prompt 5


## Prompt 5: Review Management

*Decisions to be added after completing Prompt 5*

**Potential Decisions:**
- Language detection library (franc vs alternatives)
- Filter implementation approach
- Pagination strategy
- Search implementation (client vs server)

---
1. Significant Technical Decisions and Reasons
Decision	Reason
Fallback sentiment analysis	DeepSeek API may not always be available or configured. Added keyword-based fallback that works without API key, ensuring sentiment is always analyzed.
Zod v4 .issues instead of .errors	Zod v4 changed the error structure. Updated API routes to use .issues for accessing validation errors.
Debounced language detection (500ms)	Avoids excessive language detection calls while user is typing. Only detects after user pauses for 500ms.
Language detection confidence threshold	Text < 10 chars defaults to English with "low" confidence. Text >= 50 chars gets "high" confidence. This helps users know when to verify/override.
Duplicate review prevention (5-minute window)	Prevents accidental double-submission by checking for same userId + reviewText within 5 minutes.
Sentiment quota check before analysis	Respects user's monthly quota; if exceeded, review is still created but sentiment is null with a warning message.
Cascade delete with audit trail preservation	Review deletion cascades to response/versions (Cascade), but CreditUsage and SentimentUsage keep their records (SetNull) for audit purposes.
RTL language support in UI	Arabic, Hebrew, Persian, Urdu display right-to-left using dir attribute on text containers.
Platform filter uses exact match	Filters use the exact platform string from constants rather than case-insensitive matching for consistency.
![alt text](image.png)

2. Deviations from Phase 0 Specifications
Spec Said	Implemented	Why Deviated	Impact/Risk
API base URL /api/v1	Used /api (no version prefix)	Next.js App Router convention; versioning can be added later if needed	Low - easy to add /v1 prefix later
DeepSeek required for sentiment	Made DeepSeek optional with fallback	Allows testing without API key; ensures feature works even if API is down	Low - fallback has lower accuracy but is functional
Sentiment cost 0.3 credits	Sentiment counts against separate sentimentQuota, not credits	This matches the schema design where sentiment has its own quota (35/150/500 per tier)	None - follows schema design
externalId and externalUrl in create	Available in schema but not in create form UI	These are for future platform integrations (CSV import), not manual entry	Low - can add to form when needed

![alt text](image-1.png)

## Prompt 6: Brand Voice

*Decisions to be added after completing Prompt 6*

**Potential Decisions:**
- Tone preset definitions
- Formality scale interpretation
- Sample response storage format
- Brand voice prompt engineering approach

### 1. Technical Decisions Made

| Decision | Reason |
|----------|--------|
| Used claude-sonnet-4-20250514 model | Latest Claude Sonnet model for response generation as specified in CORE_SPECS |
| Created separate /api/brand-voice/test endpoint | Allows users to test brand voice without credit deduction |
| Prefixed callback params with underscore in interfaces | Silences ESLint warnings for unused parameters in type definitions |
| Used upsert for brand voice updates | Handles both create and update in single operation |
| Added default brand voice creation in GET endpoint | Ensures users always have brand voice settings available |
| Built modular UI components | ToneSelector, FormalitySlider, etc. can be reused in future features |
| Added retry logic with exponential backoff | Handles transient Claude API errors (429 rate limit, 529 overloaded) with up to 3 retries |
| Strengthened key phrase instruction in prompt | Changed from "include when appropriate" to "REQUIRED... MUST incorporate 1-2" for better adherence |
| Added formality descriptions to UI | Shows user-friendly descriptions like "Balanced mix of professional and approachable" below slider |
| **Implemented auto-save with debounce** | **Better UX - changes save automatically after 1.5s of inactivity, no manual save button needed** |
| Replaced textarea with structured list for Style Guidelines | Better UX - each guideline as separate input field, numbered list, add/remove buttons |
| JSON serialization for style guidelines | Safer than newline-separated; handles special characters; backward compatible with legacy format |
| Style Guidelines limits: 5 max, 200 chars each | Reasonable limits to keep prompts focused; can be increased if needed |
| **CollapsibleTextItem reusable component** | **Unified UX for Style Guidelines and Sample Responses: read-only by default, edit on click, collapsible (max 3 lines), expand on click** |

### 2. Deviations from Phase 0 Specifications

| Spec | Implementation | Why | Risk |
|------|----------------|-----|------|
| Spec had 4 tones: friendly/professional/casual/formal | Implemented: professional/friendly/casual/empathetic | "empathetic" is more useful for review responses than "formal" (covered by formality slider). CORE_SPECS also mentions "empathetic" in tone options | Low ✅ |
| Spec mentioned avoidPhrases and signatureClosing in validation schema | Not implemented in UI | These were in a previous validation schema but not in the Prisma BrandVoice model. Can be added later if needed | Low ✅ |
| Manual "Save Changes" button | Auto-save with status indicator | Improves UX - users don't need to remember to click save, changes persist automatically | Low ✅ |

### 3. Key Implementation Details

**Auto-Save Feature:**
- 1.5 second debounce delay prevents excessive API calls
- Visual status indicator: "Saved" (green cloud), "Unsaved" (yellow cloud-off), "Saving..." (spinner)
- Prevents data loss from users forgetting to save
- `isInitialized` flag prevents auto-save on initial page load

**Retry Logic for Claude API:**
- Exponential backoff: 1s → 2s → 4s between retries
- Only retries on transient errors (429 rate limit, 529 overloaded)
- Logs retry attempts for debugging

**Formality Descriptions (UI):**

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Very Casual | Very casual and conversational, like talking to a friend |
| 2 | Casual | Casual but still polite and friendly |
| 3 | Balanced | Balanced mix of professional and approachable |
| 4 | Formal | Formal and professional with proper business language |
| 5 | Very Formal | Very formal, polished, and highly professional |

**Style Guidelines (Structured List Input):**
- Replaced free-form textarea with numbered list of individual input fields
- Each guideline can be added, edited in-place, or removed
- Max 5 guidelines, 200 characters each
- Stored as JSON array in database string field (backward compatible)
- New `StyleGuidelinesInput` component created for reusability

**CollapsibleTextItem Component (Unified UX for Style Guidelines & Sample Responses):**
- Created reusable `CollapsibleTextItem` component for consistent behavior
- Features:
  - **Read-only by default**: Items display as text, not editable fields
  - **Edit on click**: Pencil icon or card click enters edit mode
  - **Collapsible view**: Shows max 3 lines when collapsed (configurable)
  - **Expand on click**: Chevron button to expand/collapse long content
  - **Multiline support**: Both Style Guidelines and Sample Responses now support multiline text
  - **Keyboard shortcuts**: Ctrl+Enter to save, Escape to cancel
- Applied to both `StyleGuidelinesInput` and `SampleResponsesInput` components
- `maxCollapsedLines` prop allows customization per use case

---

## Prompt 7: AI Response Generation

### 1. Technical Decisions Made

| Decision | Reason |
|----------|--------|
| Used existing Claude service from Prompt 6 | Reused the generateReviewResponse function, adding toneModifier parameter for regeneration |
| Tone modifier as optional parameter | Default behavior uses brand voice tone; modifier overrides for regeneration |
| Non-streaming API calls | Simpler implementation; responses are short (<500 chars); streaming adds complexity without significant UX benefit |
| Response truncation with sentence boundary | If AI generates >500 chars, truncates at last period after char 400 to avoid mid-sentence cuts |
| Atomic credit deduction in transaction | Uses existing deductCreditsAtomic from db-utils; prevents race conditions |
| Version history preserves pre-edit state | Before each edit, current text is saved to history; allows restoration of any previous version |
| 0 credits for manual edits | Edits don't consume credits since they don't use AI |
| ResponsePanel component approach | Single component manages all response actions (view, edit, regenerate, copy, delete) |
| In-place editing | Edit mode replaces response display with textarea rather than modal |
| ToneModifier as dialog | Prevents accidental regeneration; shows credit cost; allows tone selection |
| Collapsible version history | Reduces visual clutter; expands on demand |
| Restore version without creating duplicates | Restoring a version updates current response without creating new version entry (version already exists in history) |
| Generate button in review card header | Primary action prominently placed; tooltip shows credit cost |
| ResponsePanel hidden when no response | Avoids duplicate "Generate" buttons; panel only appears after response exists |

### 2. Deviations from Phase 0 Specifications

| Spec | Implementation | Why | Risk |
|------|----------------|-----|------|
| Spec said 200 max tokens | Using 500 max tokens | 500 chars for response text limit requires more tokens; 200 tokens ~150 words would be too limiting | Low - costs slightly more but better output |
| Spec mentioned separate generate page | Generate page exists AND ResponsePanel inline | Both options available - page for initial generation, panel for subsequent actions | None - more flexible |
| Spec mentioned version restore | Added restore version functionality | Useful feature for users who want to undo regeneration | None - enhancement |
| Publishing marks "approved" not "published externally" | isPublished = true marks as approved/ready to copy | True external publishing requires platform integrations (Phase 3) | Low - terminology clarified in UI |

### 3. Key Implementation Details

**API Endpoints Created:**
- `POST /api/reviews/[id]/generate` - Generate initial response (1.0 credit, NO version entry)
- `POST /api/reviews/[id]/regenerate` - Regenerate with tone modifier (1.0 credit, saves old text to history first)
- `PUT /api/reviews/[id]/response` - Manual edit or restore version (0 credits)
- `POST /api/reviews/[id]/publish` - Mark as approved

**Credit Costs:**
- Initial generation: 1.0 credits
- Regeneration: 1.0 credits
- Manual edit: 0 credits
- Restore version: 0 credits

**Version History Behavior:**
Version history only stores PREVIOUS versions (what the response used to be), not the current response.
- **Generate**: Creates response only. NO version entry. Sets `ReviewResponse.creditsUsed = 1`
- **Regenerate**: Saves OLD text to history (preserving its creditsUsed), then updates response. Sets `ReviewResponse.creditsUsed = 1`
- **Manual Edit**: Saves OLD text to history (preserving its creditsUsed), then updates response. Sets `ReviewResponse.creditsUsed = 0`
- **Restore**: Updates response to restored text/tone WITHOUT creating new version (version already exists in history)

**Version History Credit Display:**
The `creditsUsed` field tracks whether a version was AI-generated (1) or manually edited (0):
- When saving to history, we preserve `review.response.creditsUsed` (what the current response cost)
- After a manual edit, we set `ReviewResponse.creditsUsed = 0` so future history entries show 0 credits
- After generate/regenerate, `ReviewResponse.creditsUsed = 1` so future history entries show 1 credit

**Generated Badge Display:**
The `isEdited` field tracks whether a response/version was AI-generated (false) or manually edited (true):
- When saving to history, we preserve `review.response.isEdited` (whether the current response was edited)
- After a manual edit, we set `ReviewResponse.isEdited = true`
- After generate/regenerate, `ReviewResponse.isEdited = false`
- UI shows "Generated" badge (blue, with Sparkles icon) when `isEdited = false`
- UI shows "Edited" badge (outline) when `isEdited = true`

Example flow:
1. Generate (1 credit) → v1, `creditsUsed=1`, `isEdited=false` → shows "Generated" badge
2. Edit → saves v1 to history with `creditsUsed=1`, `isEdited=false`, response becomes `creditsUsed=0`, `isEdited=true`. History: {v1(1 credit, Generated)}
3. Edit → saves v2 to history with `creditsUsed=0`, `isEdited=true`, response stays `creditsUsed=0`, `isEdited=true`. History: {v2(Edited), v1(1 credit, Generated)}
4. Regenerate (1 credit) → saves v3 to history with `creditsUsed=0`, `isEdited=true`, response becomes `creditsUsed=1`, `isEdited=false`. History: {v3(Edited), v2(Edited), v1(1 credit, Generated)}
5. Edit → saves v4 to history with `creditsUsed=1`, `isEdited=false`, response becomes `creditsUsed=0`, `isEdited=true`. History: {v4(1 credit, Generated), v3(Edited), v2(Edited), v1(1 credit, Generated)}

**Total Credits Used Per Review (Added January 18, 2026):**
The `totalCreditsUsed` field is calculated by summing:
- Current response's `creditsUsed` (credits for the current/latest generation)
- All version history `creditsUsed` (credits for each previous generation/regeneration)

Formula: `totalCreditsUsed = response.creditsUsed + sum(versions.creditsUsed)`

Example:
- Initial generation: 1 credit → total = 1
- After 1 regeneration: 1 credit (current) + 1 credit (version 1) → total = 2
- After 2 regenerations: 1 credit (current) + 1 credit (version 1) + 1 credit (version 2) → total = 3

Edits don't consume credits (creditsUsed = 0), so they don't increase the total.

This is displayed in:
- Review list page: next to "AI Response:" label
- Review details page: in the AI Response card header

**Tone Modifiers:**
- `professional` - Business-like, courteous, maintaining formal tone
- `friendly` - Warm, personable, like helping a friend
- `empathetic` - Understanding, compassionate, showing genuine care

**UI Components Created:**
- `ResponsePanel` - Main response display with all actions
- `ResponseEditor` - Inline text editor with char counter
- `ToneModifier` - Dialog for selecting regeneration tone
- `ResponseVersionHistory` - Collapsible version list

---

## Prompt 8: Sentiment Analysis

### 1. Technical Decisions Made

| Decision | Reason |
|----------|--------|
| DeepSeek Chat model (deepseek-chat) | Cost-effective sentiment classification; 10x cheaper than Claude for this task |
| 3-class sentiment (positive/neutral/negative) | Simpler classification is sufficient for review analysis; avoids false precision |
| Keyword-based fallback | When DeepSeek API unavailable, uses comprehensive keyword matching for sentiment |
| Low temperature (0.1) | Ensures consistent classification; reduces randomness in sentiment results |
| Separate quota from credits | Sentiment uses its own quota (35/150/500 per tier) independent of response credits |
| Non-blocking sentiment analysis | Review creation succeeds even if sentiment API fails; sentiment is "nice to have" |
| Stacked bar chart for distribution | Visual, intuitive display of sentiment breakdown; familiar pattern |
| Sentiment badges with colors | Green for positive, gray for neutral, red for negative; universal color coding |

### 2. Deviations from Phase 0 Specifications

| Spec | Implementation | Why | Risk |
|------|----------------|-----|------|
| Spec mentioned batch analysis | Not implemented | Manual review input doesn't need batch; will add for CSV import in Phase 2 | Low - deferred to appropriate phase |
| Spec mentioned cron job for quota reset | Not yet implemented | Quota tracking works; reset logic can be triggered manually or via Vercel cron in Prompt 10 | Low - already tracking dates |
| Sentiment emoji badges | Text-only badges | Cleaner UI; emojis can be distracting in professional context | None - preference |

### 3. Key Implementation Details

**DeepSeek API Integration:**
- Uses `https://api.deepseek.com/v1/chat/completions` endpoint
- Model: `deepseek-chat` (fast, cheap)
- Temperature: 0.1 for consistent results
- Max tokens: 10 (only need one word: positive/neutral/negative)
- 10 second timeout to avoid blocking

**Fallback Sentiment Analysis:**
- Activated when DEEPSEEK_API_KEY not set or API errors
- Uses 40+ positive keywords (great, excellent, amazing, etc.)
- Uses 40+ negative keywords (terrible, awful, worst, etc.)
- Compares keyword counts to determine sentiment
- Returns 0.6 confidence (vs 0.9 for API)

**API Endpoints Created:**
- `GET /api/sentiment/usage` - Sentiment usage history with distribution stats

**Dashboard Integration:**
- `SentimentDistributionCard` component shows stacked bar chart
- Distribution percentages calculated: positive%, neutral%, negative%
- Shows total analyzed reviews count

**Quota Tracking:**
- `user.sentimentUsed` tracks monthly usage
- `user.sentimentQuota` stores tier limit
- `user.sentimentResetDate` stores next reset date
- `SentimentUsage` table logs each analysis for audit trail

---

## Prompt 9: Credit System

*Decisions to be added after completing Prompt 9*

**Potential Decisions:**
- Credit reset timing (1st of month per spec)
- Usage logging granularity
- Fraud detection thresholds
- Credit exhaustion handling

---

## Prompt 10: Testing & Deployment

*Decisions to be added after completing Prompt 10*

**Potential Decisions:**
- Deployment platform (Vercel per spec)
- Monitoring tools (Sentry recommended)
- Testing strategy priorities
- Beta user selection criteria

---

## Deviations from Specifications

**Purpose:** Track any implementation that differs from Phase 0 documentation.

**Format:**
```markdown
### [Feature/Component Name]
- **Spec Location:** [Document name and line/section]
- **Spec Said:** [What the original spec specified]
- **Actually Implemented:** [What was built instead]
- **Reason for Deviation:** [Why we deviated]
- **Approved By:** [Your name/team]
- **Date:** [Date]
- **Impact:** [What changed due to this]
- **Risk Level:** [Low ✅ | Medium ⚠️ | High 🚨]
```

### Example Deviation (Placeholder)

*No deviations yet - will document here if/when they occur*

**When to document a deviation:**
- Implementation differs from Phase 0 specs
- Better approach discovered during development
- Technical constraint forced a change
- Spec was ambiguous and choice was made

**When NOT to document:**
- Minor code refactoring
- UI polish and styling tweaks
- Bug fixes
- Implementation details not specified in docs

---

## Architectural Patterns

### Patterns We're Following

#### Transaction Pattern for Credits
- **Pattern:** Always use Prisma transactions for credit deduction
- **Why:** Ensures atomicity, prevents race conditions
- **Example:** Check credits → Deduct → Log usage (all in transaction)
- **Source:** 02_PRD_MVP_PHASE1.md, fraud prevention section
- **Risk if not followed:** Incorrect credit tracking, security vulnerability

#### Audit Trail Pattern
- **Pattern:** Never delete CreditUsage or SentimentUsage records
- **Why:** Fraud prevention, GDPR compliance, accountability
- **Example:** Review deletion doesn't delete audit logs
- **Source:** 04_DATA_MODEL.md, 08_GDPR_COMPLIANCE.md
- **Risk if not followed:** Lost audit trail, GDPR violations

#### Soft Delete Pattern
- **Pattern:** Use deletedAt timestamp instead of hard deletes
- **Why:** Data recovery, audit trail, GDPR compliance
- **Example:** Review deletion sets deletedAt, doesn't remove row
- **Source:** 04_DATA_MODEL.md
- **Risk if not followed:** Irreversible data loss, GDPR issues

---

## Technology Choices

### Core Stack (From Specifications)
- **Frontend Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **AI (Responses):** Claude API (Anthropic)
- **AI (Sentiment):** DeepSeek API
- **Email:** Resend
- **Hosting:** Vercel

**All choices above are per specifications, not decisions.**

### Dependencies to Add During Development
*To be documented as they're installed*

---

## Performance Targets

### Response Times (From Specifications)
- **AI Response Generation:** <5 seconds (p95)
- **Page Load:** <2 seconds (p95)
- **API Latency:** <500ms (p95, non-AI endpoints)
- **Database Queries:** <100ms (p95)

**Source:** 02_PRD_MVP_PHASE1.md, Non-Functional Requirements

---

## Security Decisions

### Security Measures (From Specifications)
- **Password Hashing:** bcrypt cost factor 12
- **Sessions:** JWT, httpOnly cookies, 30-day expiry
- **Rate Limiting:** 5 login attempts per 15 min, 10 API calls/min for generation
- **CSRF Protection:** NextAuth.js handles automatically
- **SQL Injection:** Prisma ORM prevents automatically
- **XSS:** React escaping prevents automatically

**Source:** 06_SECURITY_PRIVACY.md

**Decisions during implementation:**
*To be added as security-related choices are made*

---

## Learning & Insights

### Key Learnings
*To be added as development progresses*

**Example format:**
```markdown
### [Topic/Area]
- **Learning:** [What was learned]
- **Context:** [When/where this came up]
- **Impact:** [How this changed our approach]
- **Date:** [Date]
```

---

## Decision Log

### Quick Reference Table

| # | Decision | Prompt | Date | Risk | Status |
|---|----------|--------|------|------|--------|
| 1 | Credit-based pricing | Phase 0 | Jan 5 | Low ✅ | ✅ Spec |
| 2 | DeepSeek for sentiment | Phase 0 | Jan 5 | Low ✅ | ✅ Spec |
| 3 | Three tiers (no Enterprise) | Phase 0 | Jan 5 | Low ✅ | ✅ Spec |
| 4 | Manual input first | Phase 0 | Jan 5 | Low ✅ | ✅ Spec |

*Table will grow as decisions are made*

---

## Change Log

**January 19, 2026**
- Standardized date formatting across all pages (dashboard, review list, review details, responses, version history)
  - Relative time for dates within 2 days: "just now", "5m ago", "3h ago", "1d ago"
  - Absolute date for dates beyond 2 days: "Jan 16, 2026" format
  - Review date (when customer wrote review) takes priority over created date (when added to system)
  - Labels: "Reviewed X ago" for review date, "Added X ago" for created date fallback
  - Added reviewer name display in review list (right side, next to timestamp)

**January 18, 2026**
- Removed "Delete Response" feature (redundant - users can regenerate instead)
  - Removed DELETE /api/reviews/[id]/response endpoint
  - Removed Delete button and confirmation dialog from ResponsePanel
  - Note: Deleting a Review still cascades to delete its response (unchanged)

**January 7, 2026**
- Created DECISIONS.md template
- Documented Phase 0 decisions
- Set up structure for Phase 1 decisions

---

**Note:** This document should be updated after each prompt execution. When in doubt about whether something is a "decision," document it - better to over-document than under-document.

**Last Reviewed:** January 19, 2026
