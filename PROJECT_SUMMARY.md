# ReviewFlow Project Summary

**Last Updated:** January 13, 2026
**Repository:** https://github.com/prajeenv/ReviewFlow
**Current Status:** Prompt 6 Complete - Ready for Prompt 7

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

### Prompt 6: Brand Voice Configuration ✅
- Brand Voice API endpoints (GET, PUT, POST /test)
- Claude AI integration for test response generation
- Settings page with brand voice configuration form
- ToneSelector component (professional/friendly/casual/empathetic)
- FormalitySlider component (1-5 scale)
- KeyPhrasesInput component (tag-style, max 20)
- SampleResponsesInput component (max 5 samples)
- TestResponsePanel for testing brand voice with sample reviews
- Settings overview page with navigation

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
│   │   │       ├── reviews/        # Review management pages (Prompt 5)
│   │   │       │   ├── page.tsx    # Reviews list with filters
│   │   │       │   ├── new/page.tsx        # Add new review
│   │   │       │   └── [id]/
│   │   │       │       ├── page.tsx        # Review detail
│   │   │       │       └── edit/page.tsx   # Edit review
│   │   │       └── settings/       # Settings pages (Prompt 6)
│   │   │           ├── page.tsx    # Settings overview
│   │   │           └── brand-voice/page.tsx  # Brand voice config
│   │   └── api/
│   │       ├── auth/       # Auth endpoints
│   │       ├── dashboard/  # Dashboard API
│   │       ├── reviews/    # Review CRUD API (Prompt 5)
│   │       │   ├── route.ts        # POST (create), GET (list)
│   │       │   └── [id]/route.ts   # GET, PUT, DELETE
│   │       └── brand-voice/  # Brand Voice API (Prompt 6)
│   │           ├── route.ts        # GET, PUT
│   │           └── test/route.ts   # POST (test with sample)
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (19 components)
│   │   ├── auth/           # LoginForm, SignupForm
│   │   ├── dashboard/      # Dashboard components (Prompt 4)
│   │   ├── reviews/        # Review components (Prompt 5)
│   │   │   ├── ReviewForm.tsx      # Add/edit review form
│   │   │   ├── ReviewCard.tsx      # Review card display
│   │   │   ├── ReviewList.tsx      # Paginated list with filters
│   │   │   └── index.ts
│   │   ├── settings/       # Settings components (Prompt 6)
│   │   │   ├── BrandVoiceForm.tsx  # Main brand voice form
│   │   │   ├── ToneSelector.tsx    # Tone picker
│   │   │   ├── FormalitySlider.tsx # Formality slider
│   │   │   ├── KeyPhrasesInput.tsx # Key phrases tags
│   │   │   ├── SampleResponsesInput.tsx  # Sample responses
│   │   │   ├── TestResponsePanel.tsx     # Test panel
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
│   │   ├── constants.ts    # App constants (tier limits, languages, brand voice, etc.)
│   │   ├── language-detection.ts   # Language detection (franc-min)
│   │   └── ai/
│   │       ├── deepseek.ts # Sentiment analysis service
│   │       └── claude.ts   # Claude AI response generation (Prompt 6)
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
DATABASE_URL="postgresql://postgres.PROJECT:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
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
ANTHROPIC_API_KEY="sk-ant-..."      # REQUIRED for response generation
DEEPSEEK_API_KEY="sk-..."           # For sentiment analysis (optional - has fallback)
```

---

## Key Technical Decisions & Fixes

| Issue | Solution |
|-------|----------|
| Prisma 7.x breaking changes | Downgraded to Prisma 5.22.0 |
| Supabase pooler URL "Tenant not found" | Used direct database URL for migrations, pooler for runtime |
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
| ESLint unused vars in type declarations | Prefixed callback params with underscore in interface definitions |
| use(params) runtime error | Replaced with useParams() hook for Next.js 14 compatibility |

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

### Brand Voice (Prompt 6)
- `GET /api/brand-voice` - Get user's brand voice (creates default if none exists)
- `PUT /api/brand-voice` - Update brand voice settings
- `POST /api/brand-voice/test` - Test with sample review (free, no credit deduction)

---

## UI Components (shadcn/ui)

**Installed components:**
- button, input, label, card, textarea, badge, select, dialog
- avatar, separator, dropdown-menu, sheet, skeleton, tooltip, scroll-area
- slider (added in Prompt 6)

---

## Remaining Prompts (7-10)

| Prompt | Description |
|--------|-------------|
| **7** | AI Response Generation - Generate responses for reviews using Claude + brand voice |
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

**Commit:** `2a7a015`
**Message:** feat: Implement brand voice configuration system (Prompt 6)
**Branch:** main

---

## Brand Voice Configuration Features (Prompt 6 Complete)

### Brand Voice API
- **GET /api/brand-voice**: Fetches user's brand voice settings, creates default if none exists
- **PUT /api/brand-voice**: Updates brand voice settings with validation
- **POST /api/brand-voice/test**: Generates a test response using Claude AI (no credit deduction)

### Claude AI Integration
- Created `src/lib/ai/claude.ts` for response generation
- Uses `claude-sonnet-4-20250514` model
- Builds dynamic prompts based on brand voice configuration
- Supports multi-language response generation
- Test mode for previewing brand voice settings

### Brand Voice UI Components
- **ToneSelector**: Visual picker for 4 tone options with icons and descriptions
- **FormalitySlider**: 1-5 scale slider with labeled levels (Very Casual → Very Formal)
- **KeyPhrasesInput**: Tag-style input for key phrases (max 20)
- **SampleResponsesInput**: Textarea list for sample responses (max 5)
- **TestResponsePanel**: Test area with sample reviews and Claude AI integration
- **BrandVoiceForm**: Main form combining all components with save/reset functionality

### Settings Pages
- `/dashboard/settings` - Settings overview with navigation cards
- `/dashboard/settings/brand-voice` - Full brand voice configuration page

### Default Brand Voice
When user signs up or accesses brand voice for first time:
```typescript
{
  tone: "professional",
  formality: 3,
  keyPhrases: ["Thank you", "We appreciate your feedback"],
  styleNotes: "Be genuine and empathetic",
  sampleResponses: []
}
```

---

## Notes for Next Session

1. **Prompt 7** is next: AI Response Generation
2. **ANTHROPIC_API_KEY is REQUIRED** for response generation
3. All environment variables are configured in `.env.local`
4. Brand voice configuration is fully functional and tested
5. Reference `docs/phase-0/CORE_SPECS.md` for response generation API contracts
6. Prompt 7 will need:
   - POST `/api/reviews/[id]/generate` - Generate AI response for a review
   - POST `/api/reviews/[id]/regenerate` - Regenerate with different tone
   - Credit deduction logic (1.0 for generate, 0.5 for regenerate)
   - Integration with existing brand voice settings
   - Response storage in ReviewResponse table
   - Version history in ResponseVersion table
7. Current user in database: `prajeen.builder@gmail.com` (has both credentials and Google linked)
8. **Test the brand voice test feature** to verify Claude API is working
9. The Claude service is already built in `src/lib/ai/claude.ts` - just need to integrate with review routes
