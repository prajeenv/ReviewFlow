# ReviewFlow Technical Decisions

**Purpose:** Document all significant technical decisions, architectural choices, and deviations from original specifications.

**Last Updated:** January 7, 2026

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

**Template for documenting:**
```markdown
### [Decision Name]
- **Decision:** [What was decided]
- **Why:** [Reasoning]
- **Alternatives:** [What else was considered]
- **Trade-offs:** [Pros and cons]
- **Source:** [Spec reference or "Deviation"]
- **Date:** [Date]
- **Impact:** [How this affects project]
- **Risk Level:** [Low ✅ | Medium ⚠️ | High 🚨]
```

---

## Prompt 2: Database

*Decisions to be added after completing Prompt 2*

**Potential Decisions:**
- ID generation strategy (CUID vs UUID)
- Soft delete implementation details
- Index optimization choices
- Database pooling configuration

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

## Prompt 4: Dashboard & UI

*Decisions to be added after completing Prompt 4*

**Potential Decisions:**
- Color scheme and branding
- Component library usage patterns
- Responsive breakpoints
- Navigation structure
- Empty state designs

---

## Prompt 5: Review Management

*Decisions to be added after completing Prompt 5*

**Potential Decisions:**
- Language detection library (franc vs alternatives)
- Filter implementation approach
- Pagination strategy
- Search implementation (client vs server)

---

## Prompt 6: Brand Voice

*Decisions to be added after completing Prompt 6*

**Potential Decisions:**
- Tone preset definitions
- Formality scale interpretation
- Sample response storage format
- Brand voice prompt engineering approach

---

## Prompt 7: AI Response Generation

*Decisions to be added after completing Prompt 7*

**Potential Decisions:**
- Claude API model version (claude-sonnet-4-20250514 per spec)
- Token limits (200 max tokens per spec)
- Retry strategy for API failures
- Streaming vs single response
- Cache strategy for brand voice prompts

---

## Prompt 8: Sentiment Analysis

*Decisions to be added after completing Prompt 8*

**Potential Decisions:**
- DeepSeek model version
- Sentiment classification approach (3-class vs 5-class)
- Batch size for batch analysis
- Quota reset timing (1st of month per spec)

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

**January 7, 2026**
- Created DECISIONS.md template
- Documented Phase 0 decisions
- Set up structure for Phase 1 decisions

---

**Note:** This document should be updated after each prompt execution. When in doubt about whether something is a "decision," document it - better to over-document than under-document.

**Last Reviewed:** January 7, 2026
