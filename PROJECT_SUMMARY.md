# ReviewFlow Project Summary

**Last Updated:** January 12, 2026
**Repository:** https://github.com/prajeenv/ReviewFlow
**Current Status:** Prompt 3 Complete + Google OAuth Fix (Ready for Prompt 4)

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
- Google OAuth provider
- Email verification flow with Resend
- Password reset flow
- Rate limiting (Upstash Redis with in-memory fallback)
- Protected routes middleware
- Security headers
- Documented in `docs/phase-0/PROMPT_3_OUTCOME.md`

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
│   │   └── api/            # API routes
│   │       └── auth/       # Auth endpoints
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # LoginForm, SignupForm
│   │   └── providers/      # SessionProvider
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── db-utils.ts     # Database utilities
│   │   ├── email.ts        # Resend email service
│   │   ├── rate-limit.ts   # Rate limiting
│   │   ├── tokens.ts       # Token generation/validation
│   │   ├── validations.ts  # Zod schemas
│   │   └── constants.ts    # App constants
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

# AI Services (for later prompts)
ANTHROPIC_API_KEY="sk-ant-..."
DEEPSEEK_API_KEY="sk-..."
```

---

## Key Technical Decisions & Fixes

| Issue | Solution |
|-------|----------|
| Prisma 7.x breaking changes | Downgraded to Prisma 5.22.0 |
| Supabase pooler URL "Tenant not found" | Used direct database URL instead |
| Password special characters | URL-encoded in connection string |
| Zod v4 enum syntax | Changed `errorMap` to `message` |
| `@typescript-eslint/no-unused-vars` not found | Removed from ESLint, using standard `no-unused-vars` |
| Tailwind `darkMode: ["class"]` type error | Changed to `darkMode: "class"` |
| `useSearchParams` prerender error | Wrapped pages in Suspense boundaries |
| Type conflict `ReviewResponse` | Renamed API type to `ReviewApiResponse` |
| Google OAuth "email already linked" error | Added `allowDangerousEmailAccountLinking: true` + custom signIn callback |
| OAuth account linking for existing users | Custom signIn callback auto-links Google accounts to existing users |

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

---

## Remaining Prompts (4-10)

| Prompt | Description |
|--------|-------------|
| **4** | Dashboard Layout & Navigation |
| **5** | Review Management (CRUD) |
| **6** | AI Response Generation (Claude) |
| **7** | Brand Voice Configuration |
| **8** | Sentiment Analysis (DeepSeek) |
| **9** | Credit System & Usage Tracking |
| **10** | Settings & User Profile |

---

## Commands

```bash
# Development
npm run dev           # Start dev server

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

**Commit:** `b34ebf5`
**Message:** fix: Enable Google OAuth account linking for existing users
**Branch:** main

---

## Authentication Features (Complete)

### Email/Password Authentication
- Signup with email verification (Resend)
- Login with credentials
- Password reset flow
- Rate limiting on auth endpoints

### Google OAuth
- Sign in with Google
- **Account linking**: Users who signed up with email/password can also sign in with Google (same email)
- Profile picture and name sync from Google
- Email auto-verified for OAuth users

### Session Management
- JWT-based sessions (30 days)
- Protected routes via middleware
- Logout functionality

---

## Notes for Next Session

1. **Prompt 4** is next: Dashboard Layout & Navigation
2. All environment variables are configured in `.env.local`
3. Build passes successfully (`npm run build`)
4. **Authentication is fully tested and working:**
   - Email/password signup and login ✅
   - Email verification ✅
   - Google OAuth ✅
   - Account linking (email + Google same user) ✅
5. Reference `docs/phase-0/IMPLEMENTATION_GUIDE.md` for UI/UX requirements
6. Current user in database: `prajeen.builder@gmail.com` (has both credentials and Google linked)
