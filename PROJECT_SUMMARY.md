# ReviewFlow Project Summary

**Last Updated:** January 12, 2026
**Repository:** https://github.com/prajeenv/ReviewFlow
**Current Status:** Prompt 5 Complete + Bug Fixes - Ready for Prompt 6

---

## Project Overview

**ReviewFlow** is an AI-powered review response management platform for SMBs. It helps businesses respond to customer reviews across multiple platforms (Google, Amazon, Yelp, etc.) using AI-generated, brand-aligned responses in 40+ languages.

### Core Loop
Reviews added → AI generates response in same language → User edits (optional) → User approves → User publishes

---

## Completed Prompts

### Prompt 0: Planning & Architecture Review ✅
- Validated tech stack and folder structure
- Created implementation plan
- Documented in `docs/phase-0/PROMPT_0_OUTCOME.md`

### Prompt 1: Project Setup & Configuration ✅
- Initialized Next.js 14 with App Router and TypeScript
- Installed core dependencies (NextAuth, Prisma, Anthropic SDK, Resend, shadcn/ui)
- Created folder structure and configuration files
- Documented in `docs/phase-0/PROMPT_1_OUTCOME.md`

### Prompt 2: Database Schema & Prisma Setup ✅
- Implemented complete Prisma schema with 10 models
- Connected to Supabase PostgreSQL
- Created atomic transaction utilities
- **Key Fix:** Downgraded to Prisma 5.22.0 (v7 had breaking changes)
- **Key Fix:** Used direct database URL instead of pooler URL
- Documented in `docs/phase-0/PROMPT_2_OUTCOME.md`

### Prompt 3: Authentication System ✅
- NextAuth.js v5 (beta) with JWT sessions (30 days)
- Email/password authentication with bcrypt (12 rounds)
- Google OAuth provider with account linking
- Email verification flow with Resend
- Password reset flow
- Rate limiting (Upstash Redis with in-memory fallback)
- Protected routes middleware
- Security headers
- Documented in `docs/phase-0/PROMPT_3_OUTCOME.md`

### Prompt 4: Dashboard Layout & Navigation ✅
- Responsive sidebar navigation (Dashboard, Reviews, Settings)
- Dashboard header with user menu dropdown and credit balance badge
- StatsCard and QuotaCard components for metrics display
- EmptyState component for no-data scenarios
- LoadingSpinner and ErrorBoundary shared components
- Dashboard page with real user data, stats, and recent reviews
- `/api/dashboard/stats` endpoint for dashboard data
- Mobile-responsive design with hamburger menu (Sheet component)
- Toast notifications via Sonner

### Prompt 5: Review Management CRUD ✅
- Complete Review API with CRUD operations
- Language detection using `franc-min` library (40+ languages)
- Sentiment analysis using DeepSeek API with fallback
- Review listing with pagination and filters
- Add/Edit/Delete review functionality
- Review detail page with response display
- RTL language support (Arabic, Hebrew, Persian, Urdu)

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | 5.x (strict mode) |
| Database | PostgreSQL (Supabase) | - |
| ORM | Prisma | 5.22.0 |
| Auth | NextAuth.js | 5.0.0-beta.30 |
| UI | shadcn/ui + Radix UI | - |
| Styling | Tailwind CSS | 3.4 |
| AI | Anthropic Claude SDK | 0.71.2 |
| Sentiment | DeepSeek API | - |
| Language Detection | franc-min | 6.2.0 |
| Email | Resend | 6.7.0 |
| Validation | Zod | 4.3.5 |
| Rate Limiting | Upstash Ratelimit | 2.0.7 |

---

## Project Structure

```
reviewflow/
├── docs/phase-0/           # Specification & outcome docs
│   ├── CORE_SPECS.md       # Product overview, database schema, API contracts
│   ├── SECURITY_AUTH.md    # NextAuth config, security requirements
│   ├── IMPLEMENTATION_GUIDE.md  # User flows, multi-language, edge cases
│   └── PROMPT_*_OUTCOME.md # Completed prompt documentation
├── prisma/
│   └── schema.prisma       # 10 models (User, Review, Response, etc.)
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth pages (signin, signup, verify-email, etc.)
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   ├── layout.tsx  # Dashboard layout with sidebar & header
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # Main dashboard page
│   │   │       └── reviews/        # Review management pages (Prompt 5)
│   │   │           ├── page.tsx    # Reviews list with filters
│   │   │           ├── new/page.tsx        # Add new review
│   │   │           └── [id]/
│   │   │               ├── page.tsx        # Review detail
│   │   │               └── edit/page.tsx   # Edit review
│   │   └── api/
│   │       ├── auth/       # Auth endpoints
│   │       ├── dashboard/  # Dashboard API
│   │       └── reviews/    # Review CRUD API (Prompt 5)
│   │           ├── route.ts        # POST (create), GET (list)
│   │           └── [id]/route.ts   # GET, PUT, DELETE
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (18 components)
│   │   ├── auth/           # LoginForm, SignupForm
│   │   ├── dashboard/      # Dashboard components (Prompt 4)
│   │   ├── reviews/        # Review components (Prompt 5)
│   │   │   ├── ReviewForm.tsx      # Add/edit review form
│   │   │   ├── ReviewCard.tsx      # Review card display
│   │   │   ├── ReviewList.tsx      # Paginated list with filters
│   │   │   └── index.ts
│   │   ├── shared/         # Shared components
│   │   └── providers/      # SessionProvider
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── db-utils.ts     # Database utilities
│   │   ├── email.ts        # Resend email service
│   │   ├── rate-limit.ts   # Rate limiting
│   │   ├── tokens.ts       # Token generation/validation
│   │   ├── validations.ts  # Zod schemas
│   │   ├── constants.ts    # App constants (tier limits, languages, etc.)
│   │   ├── language-detection.ts   # Language detection (franc-min)
│   │   └── ai/
│   │       └── deepseek.ts # Sentiment analysis service
│   ├── types/
│   │   ├── api.ts          # API types
│   │   ├── database.ts     # Prisma type re-exports
│   │   └── next-auth.d.ts  # NextAuth type extensions
│   └── middleware.ts       # Route protection
├── .env.example            # Environment variables template
└── package.json
```

---

## Database Schema (10 Models)

1. **User** - Authentication, credits, subscription tier
2. **Account** - OAuth accounts (NextAuth)
3. **Session** - User sessions (NextAuth)
4. **VerificationToken** - Email verification & password reset tokens
5. **BrandVoice** - User's brand voice settings
6. **Review** - Customer reviews
7. **ReviewResponse** - AI-generated responses
8. **ResponseVersion** - Version history for responses
9. **CreditUsage** - Audit trail for credit usage
10. **SentimentUsage** - Audit trail for sentiment analysis

---

## Environment Variables Required

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32>"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Rate Limiting (optional - has in-memory fallback)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# AI Services
ANTHROPIC_API_KEY="sk-ant-..."      # For response generation (Prompt 6)
DEEPSEEK_API_KEY="sk-..."           # For sentiment analysis (optional - has fallback)
```

---

## Key Technical Decisions & Fixes

| Issue | Solution |
|-------|----------|
| Prisma 7.x breaking changes | Downgraded to Prisma 5.22.0 |
| Supabase pooler URL "Tenant not found" | Used direct database URL instead |
| Password special characters | URL-encoded in connection string |
| Zod v4 enum syntax | Changed `errorMap` to `message` |
| Zod v4 `.errors` → `.issues` | Updated error handling in API routes |
| `@typescript-eslint/no-unused-vars` not found | Removed from ESLint, using standard `no-unused-vars` |
| Tailwind `darkMode: ["class"]` type error | Changed to `darkMode: "class"` |
| `useSearchParams` prerender error | Wrapped pages in Suspense boundaries |
| Type conflict `ReviewResponse` | Renamed API type to `ReviewApiResponse` |
| Google OAuth "email already linked" error | Added `allowDangerousEmailAccountLinking: true` + custom signIn callback |
| OAuth account linking for existing users | Custom signIn callback auto-links Google accounts to existing users |
| Dashboard layout auth state | Changed from server component to client component with `useSession` |
| Tier limits mismatch | Updated constants to match CORE_SPECS.md (FREE: 15 credits, 35 sentiment) |
| Middleware Edge runtime | Changed from `auth()` to `getToken()` for Edge runtime compatibility |
| DeepSeek API unavailable | Added fallback keyword-based sentiment analysis |
| Geist font not loading | Added `transpilePackages: ["geist"]` to next.config.mjs |
| Font CSS variables not applied | Moved font variable classes to `<html>` element in layout.tsx |
| Container not centered | Added container config to tailwind.config.ts |
| reviewDate validation too strict | Changed from `datetime()` to regex that accepts YYYY-MM-DD format |
| ESLint unused vars in type declarations | Added `eslint-disable no-unused-vars` for module augmentation |

---

## Pricing Tiers

| Tier | Price | Credits/Month | Sentiment Quota |
|------|-------|---------------|-----------------|
| FREE | $0 | 15 | 35 |
| STARTER | $29 | 60 | 150 |
| GROWTH | $79 | 200 | 500 |

**Credit Costs:**
- Response generation: 1.0 credits
- Response regeneration: 0.5 credits
- Sentiment analysis: 0.3 (against sentiment quota)

---

## API Endpoints Implemented

### Authentication (Prompt 3)
- `POST /api/auth/signup` - Create account
- `GET /api/auth/verify-email` - Verify email token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Reset password with token
- `GET /api/auth/password-reset/confirm` - Validate token
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Dashboard (Prompt 4)
- `GET /api/dashboard/stats` - Get user stats, credits, sentiment quota, recent reviews

### Reviews (Prompt 5)
- `POST /api/reviews` - Create review (with language detection & sentiment analysis)
- `GET /api/reviews` - List reviews (paginated, filterable by platform/sentiment)
- `GET /api/reviews/[id]` - Get single review with response and versions
- `PUT /api/reviews/[id]` - Update review (re-detects language if text changed)
- `DELETE /api/reviews/[id]` - Delete review (cascades to response/versions)

---

## UI Components (shadcn/ui)

**Installed components:**
- button, input, label, card, textarea, badge, select, dialog
- avatar, separator, dropdown-menu, sheet, skeleton, tooltip, scroll-area

---

## Remaining Prompts (6-10)

| Prompt | Description |
|--------|-------------|
| **6** | AI Response Generation (Claude) - Generate responses with brand voice |
| **7** | Brand Voice Configuration - Settings for tone, formality, key phrases |
| **8** | Response Editing & Publishing - Edit responses, mark as published |
| **9** | Credit System & Usage Tracking - Credit deduction, usage history |
| **10** | Settings & User Profile - Account settings, profile management |

---

## Commands

```bash
# Development
npm run dev           # Start dev server (http://localhost:3000)

# Build
npm run build         # Production build

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:studio     # Open Prisma Studio

# Testing database connection
npx tsx scripts/test-db.ts
```

---

## Latest Commit

**Commit:** `c49a9e5`
**Message:** fix: Resolve styling and validation issues (Bug fix Prompt 5)
**Branch:** main

---

## Review Management Features (Prompt 5 Complete)

### Review API
- **Create Review**: Auto-detects language, runs sentiment analysis, checks quotas
- **List Reviews**: Paginated with platform and sentiment filters
- **Get Review**: Full details with response and version history
- **Update Review**: Re-runs language detection if text changed
- **Delete Review**: Cascades to response/versions, keeps audit trails

### Language Detection
- Uses `franc-min` library for 40+ language support
- Shows confidence level (high/low based on text length)
- Manual override option in UI
- RTL support for Arabic, Hebrew, Persian, Urdu

### Sentiment Analysis
- Uses DeepSeek API for sentiment classification (positive/neutral/negative)
- Fallback to keyword-based analysis if API unavailable
- Respects user's monthly sentiment quota
- Logs usage to SentimentUsage table for audit trail

### Review UI Components
- **ReviewForm**: Platform selector, text input with character counter, rating (1-5 stars), language detection display, manual override
- **ReviewCard**: Platform badge, sentiment badge, rating display, response preview, edit/delete actions
- **ReviewList**: Paginated list, platform filter, sentiment filter, clear filters button

### Review Pages
- `/dashboard/reviews` - List all reviews with filters and pagination
- `/dashboard/reviews/new` - Add new review form
- `/dashboard/reviews/[id]` - View review details, response, version history
- `/dashboard/reviews/[id]/edit` - Edit existing review

---

## Bug Fixes Applied (Prompt 5 Bug Fix Session)

### Issues Fixed:
1. **Styling not rendering** - Page was loading without CSS/fonts applied
   - Added `transpilePackages: ["geist"]` to next.config.mjs
   - Moved font variable classes from `<body>` to `<html>` element
   - Added container config to tailwind.config.ts for centering

2. **ESLint warnings** - Unused variable warnings in type declarations
   - Fixed `ReviewCard.tsx` - prefixed callback param with underscore
   - Fixed `next-auth.d.ts` - added eslint-disable comment for module augmentation

3. **Date validation too strict** - reviewDate field rejected HTML date input
   - Changed from `z.string().datetime()` to custom regex validator
   - Now accepts both `YYYY-MM-DD` and full ISO datetime formats

---

## Notes for Next Session

1. **Prompt 6** is next: Brand Voice Configuration
2. All environment variables are configured in `.env.local`
3. **Styling is now working correctly** after bug fixes
4. **Review management is fully implemented and working**
5. Reference `docs/phase-0/IMPLEMENTATION_GUIDE.md` for Brand Voice settings
6. Prompt 6 will need:
   - Brand voice API endpoints (CRUD)
   - Settings page UI
   - Tone/formality controls
   - Key phrases management
   - Sample responses system
7. Current user in database: `prajeen.builder@gmail.com` (has both credentials and Google linked)
8. **DeepSeek API key** is optional - fallback sentiment analysis works without it
9. **ANTHROPIC_API_KEY** will be needed for Prompt 7 (AI Response Generation)
