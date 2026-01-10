# ReviewFlow Phase 1: Claude Code Implementation Prompts
## Complete Development Sequence for MVP

**Version:** 1.0  
**Created:** January 7, 2026  
**Purpose:** Step-by-step prompts for Claude Code to implement ReviewFlow MVP Phase 1  
**Timeline:** Week 1-2 (14 days)  
**Tech Stack:** Next.js 14, TypeScript, Prisma, Supabase, NextAuth.js, Tailwind CSS, shadcn/ui

---

## How to Use This Document

1. **Sequential Execution:** Execute prompts in order (Prompt 0 → Prompt 10)
2. **Context Provision:** Before each prompt, provide Claude Code with:
   - All relevant Phase 0 documentation files
   - Previous implementation artifacts
   - Any error messages or blockers
3. **Verification:** Test each feature after implementation before proceeding
4. **Documentation:** Update this file with actual implementation notes and decisions

---

## Table of Contents

- [Prompt 0: Planning & Architecture Review](#prompt-0-planning--architecture-review)
- [Prompt 1: Project Setup & Configuration](#prompt-1-project-setup--configuration)
- [Prompt 2: Database Schema & Prisma Setup](#prompt-2-database-schema--prisma-setup)
- [Prompt 3: Authentication System](#prompt-3-authentication-system)
- [Prompt 4: Dashboard & Core UI](#prompt-4-dashboard--core-ui)
- [Prompt 5: Review Management](#prompt-5-review-management)
- [Prompt 6: Brand Voice Configuration](#prompt-6-brand-voice-configuration)
- [Prompt 7: AI Response Generation](#prompt-7-ai-response-generation)
- [Prompt 8: Sentiment Analysis](#prompt-8-sentiment-analysis)
- [Prompt 9: Credit System](#prompt-9-credit-system)
- [Prompt 10: Testing, Deployment & Finalization](#prompt-10-testing-deployment--finalization)

---

# Prompt 0: Planning & Architecture Review

## Context Files to Provide
```
- 01_PRODUCT_ONE_PAGER.md
- 02_PRD_MVP_PHASE1.md
- 03_USER_FLOWS.md
- 04_DATA_MODEL.md
- 05_API_CONTRACTS.md
- 06_SECURITY_PRIVACY.md
- 07_AUTHENTICATION_SYSTEM.md
- 08_GDPR_COMPLIANCE.md
- 09_MULTILANGUAGE_SUPPORT.md
- DOCUMENTATION_ROADMAP.md
```

## Prompt

```
I'm building ReviewFlow, an AI-powered review response management platform for SMBs. I've completed comprehensive Phase 0 documentation (9 documents) and now need to implement Phase 1 MVP.

Please review all the provided documentation files and create a detailed implementation plan that includes:

1. **Technology Stack Confirmation**
   - Validate the proposed tech stack (Next.js 14, TypeScript, Prisma, Supabase, etc.)
   - Identify any potential technical risks or incompatibilities
   - Suggest alternatives if needed with justification

2. **Project Architecture**
   - Folder structure for Next.js 14 App Router
   - Component organization strategy
   - API routes structure
   - Shared utilities and helpers location
   - Environment variables organization

3. **Development Phases Breakdown**
   - Break Phase 1 into logical implementation stages (following Prompts 1-10)
   - Identify dependencies between stages
   - Suggest optimal development sequence
   - Estimate time for each stage (in days)

4. **Critical Path Identification**
   - Which features must be built first (dependencies)
   - Which features can be built in parallel
   - Which features are risky and need extra attention

5. **Integration Points**
   - Claude API integration strategy
   - DeepSeek API integration strategy
   - Resend email service integration
   - Supabase database connection
   - NextAuth.js authentication flow

6. **Testing Strategy**
   - Unit tests vs integration tests priorities
   - Manual testing checklist organization
   - Beta user testing plan

7. **Potential Challenges & Solutions**
   - Identify 5-7 likely technical challenges
   - Propose mitigation strategies for each

8. **Success Criteria Checklist**
   - Translate all PRD acceptance criteria into testable items
   - Organize by feature area
   - Include performance benchmarks

Output Format:
- Detailed markdown document
- Actionable recommendations
- Clear decision points
- Time estimates
- Risk assessment

This plan will serve as the master guide for all subsequent implementation prompts.
```

**Expected Output:**
- Comprehensive implementation plan (5-10 pages)
- Architecture diagrams in text format
- Folder structure tree
- Timeline breakdown
- Risk matrix

---

# Prompt 1: Project Setup & Configuration

## Prerequisites
- Node.js 18+ installed
- Git initialized
- GitHub repository created
- Supabase project created
- Claude API key obtained
- DeepSeek API key obtained
- Resend API key obtained
- Google OAuth credentials obtained

## Context Files
- Architecture plan from Prompt 0
- 01_PRODUCT_ONE_PAGER.md
- 02_PRD_MVP_PHASE1.md

## Prompt

```
Set up the ReviewFlow project from scratch with all necessary configurations.

**Requirements:**

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest reviewflow \
     --typescript \
     --tailwind \
     --app \
     --src-dir \
     --import-alias "@/*"
   ```

2. **Install All Dependencies**
   Core packages:
   - next-auth@beta (authentication)
   - @prisma/client (database ORM)
   - prisma (dev dependency)
   - @anthropic-ai/sdk (Claude API)
   - resend (email service)
   - bcryptjs (password hashing)
   - zod (validation)
   - react-hook-form (forms)
   - @radix-ui/* (UI components via shadcn/ui)
   - lucide-react (icons)
   - date-fns (date utilities)
   - sonner (toast notifications)

3. **Set Up shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   ```
   Install components:
   - button
   - input
   - form
   - card
   - dialog
   - dropdown-menu
   - select
   - textarea
   - badge
   - table
   - tabs
   - toast
   - avatar
   - separator

4. **Configure Environment Variables**
   Create `.env.local` with:
   ```bash
   # Database
   DATABASE_URL="postgresql://..."
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="[generate-secure-secret]"
   
   # OAuth
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   
   # APIs
   ANTHROPIC_API_KEY="..."
   DEEPSEEK_API_KEY="..."
   RESEND_API_KEY="..."
   
   # App Config
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Create Folder Structure**
   ```
   reviewflow/
   ├── src/
   │   ├── app/
   │   │   ├── (auth)/
   │   │   │   ├── login/
   │   │   │   └── signup/
   │   │   ├── (dashboard)/
   │   │   │   ├── dashboard/
   │   │   │   ├── reviews/
   │   │   │   ├── responses/
   │   │   │   └── settings/
   │   │   ├── api/
   │   │   │   ├── auth/
   │   │   │   ├── reviews/
   │   │   │   ├── responses/
   │   │   │   ├── brand-voice/
   │   │   │   └── credits/
   │   │   ├── layout.tsx
   │   │   └── page.tsx
   │   ├── components/
   │   │   ├── ui/ (shadcn components)
   │   │   ├── auth/
   │   │   ├── dashboard/
   │   │   ├── reviews/
   │   │   └── shared/
   │   ├── lib/
   │   │   ├── prisma.ts
   │   │   ├── auth.ts
   │   │   ├── claude-api.ts
   │   │   ├── deepseek-api.ts
   │   │   ├── email.ts
   │   │   ├── validations.ts
   │   │   └── utils.ts
   │   ├── types/
   │   │   ├── index.ts
   │   │   ├── auth.ts
   │   │   ├── review.ts
   │   │   └── response.ts
   │   └── hooks/
   │       ├── use-credits.ts
   │       ├── use-reviews.ts
   │       └── use-brand-voice.ts
   ├── prisma/
   │   └── schema.prisma
   ├── public/
   ├── .env.local
   ├── next.config.js
   ├── tailwind.config.js
   ├── tsconfig.json
   └── package.json
   ```

6. **Configure TypeScript**
   Update `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "jsx": "preserve",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

7. **Configure Tailwind CSS**
   Update `tailwind.config.js`:
   - Add custom colors for ReviewFlow brand
   - Configure dark mode
   - Add custom utilities

8. **Set Up Git**
   Create `.gitignore`:
   ```
   node_modules/
   .next/
   .env.local
   .env*.local
   .vercel
   *.log
   .DS_Store
   ```

9. **Create Initial Utility Files**
   - `src/lib/utils.ts` - Common utilities
   - `src/lib/constants.ts` - App constants (tiers, limits, etc.)
   - `src/types/index.ts` - TypeScript type definitions

10. **Verify Setup**
    - Run `npm run dev` successfully
    - Check all imports resolve correctly
    - Verify environment variables load
    - Confirm TypeScript compilation works

Please implement all of this and provide:
1. Complete folder structure (as a tree)
2. All configuration files
3. Initial utility files with proper TypeScript types
4. Verification steps to confirm setup is working
5. Any issues encountered and how you resolved them
```

**Expected Deliverables:**
- Fully configured Next.js project
- All dependencies installed
- Folder structure created
- Environment variables template
- Basic utility files
- Working dev server

**Time Estimate:** 2-3 hours

---

# Prompt 2: Database Schema & Prisma Setup

## Context Files
- 04_DATA_MODEL.md (complete Prisma schema)
- 08_GDPR_COMPLIANCE.md (data retention rules)

## Prompt

```
Implement the complete database schema for ReviewFlow using Prisma and connect to Supabase.

**Requirements:**

1. **Create Prisma Schema**
   - Copy the COMPLETE Prisma schema from `04_DATA_MODEL.md`
   - File location: `prisma/schema.prisma`
   - Ensure all relationships are properly defined
   - Include all indexes as specified
   - Add comments for complex fields

2. **Configure Prisma Client**
   Create `src/lib/prisma.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   
   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined;
   };
   
   export const prisma = globalForPrisma.prisma ?? new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
   });
   
   if (process.env.NODE_ENV !== 'production') {
     globalForPrisma.prisma = prisma;
   }
   ```

3. **Create Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Create Seed Data (Optional)**
   Create `prisma/seed.ts` with:
   - 1 test user (Free tier)
   - Default brand voice for test user
   - 3 sample reviews (different languages, sentiments)
   
   Run seed: `npx prisma db seed`

6. **Create Database Utility Functions**
   Create `src/lib/db-utils.ts`:
   - `getUserWithCredits(userId)` - Get user with credit info
   - `getUserWithBrandVoice(userId)` - Get user with brand voice
   - `getReviewsForUser(userId, filters)` - Query reviews with filters
   - `getCreditUsageHistory(userId, limit)` - Get credit history
   - Transaction helpers for credit deduction

7. **Create Type Definitions**
   Create `src/types/database.ts`:
   - Export Prisma types
   - Create custom types for API responses
   - Create types for form inputs

8. **Set Up Prisma Studio**
   - Configure `npx prisma studio` for local development
   - Document how to access at http://localhost:5555

9. **Verify Database Setup**
   - Confirm connection to Supabase
   - Verify all tables created
   - Check indexes are applied
   - Test CRUD operations on User table
   - Test relationships work (User -> Review -> ReviewResponse)

10. **Error Handling**
    Create `src/lib/db-errors.ts`:
    - Handle Prisma-specific errors
    - Convert to user-friendly messages
    - Log database errors appropriately

**Deliverables:**
- Complete `schema.prisma` file
- Successful migration applied
- Prisma Client generated
- Database utility functions
- Type definitions
- Seed data (if applicable)
- Verification screenshots/logs

**Testing Checklist:**
- [ ] Can connect to Supabase database
- [ ] All tables created successfully
- [ ] Can create a User record
- [ ] Can create a Review with relationship to User
- [ ] Can query User with nested relations
- [ ] Indexes are applied (check with `EXPLAIN`)
- [ ] Prisma Studio loads all tables
- [ ] TypeScript types are generated correctly

**Time Estimate:** 3-4 hours
```

**Expected Output:**
- Functional Prisma setup
- All database tables created
- Working type system
- Database utility functions

---

# Prompt 3: Authentication System

## Context Files
- 07_AUTHENTICATION_SYSTEM.md (complete NextAuth config)
- 02_PRD_MVP_PHASE1.md (Epic 1: Authentication stories)
- 03_USER_FLOWS.md (Authentication flows)

## Prompt

```
Implement the complete authentication system using NextAuth.js v5 with email/password and Google OAuth.

**Requirements:**

1. **NextAuth Configuration**
   - Create `src/app/api/auth/[...nextauth]/route.ts`
   - Implement EXACTLY as specified in `07_AUTHENTICATION_SYSTEM.md`
   - Configure:
     - Credentials Provider (email/password)
     - Google OAuth Provider
     - JWT session strategy (30 days)
     - Prisma adapter
     - Custom callbacks for user data

2. **Authentication Pages**
   
   **Signup Page:** `src/app/(auth)/signup/page.tsx`
   - Email + password form
   - "Continue with Google" button
   - Form validation (Zod schema)
   - Password strength indicator
   - Link to login page
   - Error handling (email exists, weak password, etc.)
   
   **Login Page:** `src/app/(auth)/login/page.tsx`
   - Email + password form
   - "Continue with Google" button
   - "Remember me" checkbox
   - "Forgot password?" link
   - Link to signup page
   - Error messages
   
   **Email Verification:** `src/app/(auth)/verify-email/page.tsx`
   - Show verification pending message
   - Resend verification email button
   - Auto-redirect if already verified

3. **Password Management**
   
   **Forgot Password:** `src/app/(auth)/forgot-password/page.tsx`
   - Email input form
   - Send reset link
   - Success message
   
   **Reset Password:** `src/app/(auth)/reset-password/page.tsx`
   - Token validation from URL
   - New password form
   - Password confirmation
   - Success redirect to login

4. **Email Templates**
   Create `src/lib/email-templates.ts`:
   - Welcome email (after signup)
   - Email verification template
   - Password reset template
   - Use Resend's API for sending

5. **Auth API Routes**
   
   **POST `/api/auth/signup`**
   - Validate input (Zod)
   - Check if email exists
   - Hash password (bcrypt, cost factor 12)
   - Create user with defaults (FREE tier, 15 credits, 35 sentiment)
   - Create default BrandVoice
   - Send verification email
   - Return user + token
   
   **POST `/api/auth/forgot-password`**
   - Generate reset token
   - Store in VerificationToken table
   - Send reset email
   - Token expires in 1 hour
   
   **POST `/api/auth/reset-password`**
   - Validate token
   - Check not expired
   - Hash new password
   - Update user
   - Invalidate token
   - Return success

6. **Protected Routes Middleware**
   Create `src/middleware.ts`:
   ```typescript
   import { withAuth } from "next-auth/middleware";
   
   export default withAuth({
     callbacks: {
       authorized: ({ req, token }) => {
         // Protect dashboard routes
         if (req.nextUrl.pathname.startsWith("/dashboard")) {
           return !!token;
         }
         return true;
       },
     },
   });
   
   export const config = {
     matcher: ["/dashboard/:path*", "/api/:path*"],
   };
   ```

7. **Auth Components**
   
   **AuthProvider:** `src/components/providers/auth-provider.tsx`
   - Wrap app with SessionProvider
   
   **UserButton:** `src/components/auth/user-button.tsx`
   - Show user avatar/name
   - Dropdown menu (Profile, Settings, Logout)
   
   **LoginForm:** `src/components/auth/login-form.tsx`
   - Reusable login form component
   - React Hook Form + Zod validation
   
   **SignupForm:** `src/components/auth/signup-form.tsx`
   - Reusable signup form component
   - React Hook Form + Zod validation

8. **Auth Utilities**
   Create `src/lib/auth-utils.ts`:
   - `getCurrentUser()` - Get current user server-side
   - `requireAuth()` - Throw if not authenticated
   - `hashPassword(password)` - Bcrypt wrapper
   - `verifyPassword(password, hash)` - Bcrypt compare
   - `generateVerificationToken()` - Random token generator

9. **Auth Hooks**
   Create `src/hooks/use-auth.ts`:
   - `useCurrentUser()` - Get current user client-side
   - `useRequireAuth()` - Redirect if not authenticated
   - `useCredits()` - Get user's credit balance

10. **Session Management**
    - JWT stored in httpOnly cookie
    - Automatic session refresh
    - Logout clears session
    - Session includes: userId, email, tier, credits

**UI Requirements:**
- Use shadcn/ui components (Form, Input, Button, Card)
- Responsive design (mobile-first)
- Loading states for all forms
- Error messages clearly displayed
- Success notifications (toast)
- Password visibility toggle
- Accessible forms (ARIA labels)

**Security Requirements:**
- Rate limiting (5 login attempts per 15 min)
- CSRF protection (NextAuth handles)
- Secure password hashing (bcrypt cost 12)
- HttpOnly session cookies
- No passwords in logs
- Email verification required before dashboard access

**Testing Requirements:**
Test all flows:
- [ ] Signup with email/password
- [ ] Email verification
- [ ] Login with verified email
- [ ] Login fails without verification
- [ ] Google OAuth signup
- [ ] Google OAuth login
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Logout
- [ ] Protected route redirect
- [ ] Rate limiting works

**Deliverables:**
- Complete authentication system
- All auth pages functional
- Email sending working
- OAuth integration working
- Protected routes enforced
- Error handling comprehensive

**Time Estimate:** 1-2 days
```

**Critical Success Criteria:**
- User can sign up and receive verification email
- User can log in after verification
- Google OAuth works end-to-end
- Dashboard is protected (redirects to login if not authenticated)
- Password reset flow completes successfully

---

# Prompt 4: Dashboard & Core UI

## Context Files
- 02_PRD_MVP_PHASE1.md (UI/UX requirements)
- 03_USER_FLOWS.md (Dashboard flows)
- 01_PRODUCT_ONE_PAGER.md (Success metrics)

## Prompt

```
Build the main dashboard and core UI components for ReviewFlow.

**Requirements:**

1. **Dashboard Layout**
   Create `src/app/(dashboard)/layout.tsx`:
   ```
   ┌────────────────────────────────────────┐
   │  Sidebar     │  Main Content Area     │
   │              │                        │
   │  - Dashboard │  [Dynamic Page]        │
   │  - Reviews   │                        │
   │  - Settings  │                        │
   │              │                        │
   │  [User Menu] │                        │
   └────────────────────────────────────────┘
   ```
   
   Features:
   - Responsive sidebar (collapsible on mobile)
   - Navigation items with active state
   - User profile dropdown (avatar, name, email, logout)
   - Credit balance display in sidebar header
   - Mobile navigation menu

2. **Dashboard Home Page**
   Create `src/app/(dashboard)/dashboard/page.tsx`:
   
   **Top Section - Stats Cards:**
   ```
   ┌──────────────────────────────────────────────────────┐
   │  💳 Credits          😊 Sentiment Quota             │
   │  14 / 15 remaining   28 / 35 remaining              │
   └──────────────────────────────────────────────────────┘
   │  📝 Reviews          ✅ Responses Generated         │
   │  23 total            18 this month                  │
   └──────────────────────────────────────────────────────┘
   ```
   
   **Middle Section - Quick Actions:**
   - [+ Add New Review] button (prominent)
   - [View All Reviews] link
   - [Configure Brand Voice] link (if not set up)
   
   **Bottom Section - Recent Reviews Table:**
   - Show last 5 reviews
   - Columns: Platform, Rating, Sentiment, Preview, Status, Actions
   - Status: "Needs Response" | "Response Generated" | "Approved"
   - Actions: "Generate Response" or "View Response" button
   - Empty state if no reviews

3. **Review List Page**
   Create `src/app/(dashboard)/reviews/page.tsx`:
   
   **Header:**
   - Page title: "Reviews"
   - Search bar (filter by text)
   - Filter dropdowns: Platform, Sentiment, Status
   - [+ Add Review] button
   
   **Review Cards:**
   ```
   ┌──────────────────────────────────────────────┐
   │  ⭐⭐⭐⭐⭐  Google Business  🟢 Positive      │
   │                                              │
   │  "Great service! The team was very helpful   │
   │   and responded quickly to my needs..."      │
   │                                              │
   │  Language: 🇬🇧 English                       │
   │  Date: Jan 5, 2026                           │
   │                                              │
   │  [Generate Response]  [View Details]         │
   └──────────────────────────────────────────────┘
   ```
   
   - Pagination (10 reviews per page)
   - Loading skeleton states
   - Empty state if no reviews match filters

4. **Add Review Page**
   Create `src/app/(dashboard)/reviews/new/page.tsx`:
   
   **Form Fields:**
   - Platform dropdown (Google, Amazon, Shopify, Trustpilot, Other)
   - Rating selector (1-5 stars, visual)
   - Review text textarea (2000 char limit, counter)
   - Reviewer name (optional)
   - Review date (optional, date picker)
   - Language override (optional, auto-detected by default)
   
   **Features:**
   - Auto-detect language on text input (debounced)
   - Character counter (shows 1847/2000)
   - Form validation errors
   - Submit button:
     - If sentiment quota available: "Save Review"
     - If sentiment quota exceeded: "Save Review (no sentiment)"
   - Cancel button (returns to reviews list)
   
   **After Save:**
   - Show success toast: "Review saved! Sentiment: Positive ✓"
   - Redirect to review detail page
   - If sentiment quota exceeded: "Review saved (sentiment analysis skipped)"

5. **Review Detail Page**
   Create `src/app/(dashboard)/reviews/[id]/page.tsx`:
   
   **Layout:**
   ```
   ┌──────────────────────────────────────────────┐
   │  Back to Reviews                              │
   ├──────────────────────────────────────────────┤
   │  Review Details                               │
   │  ⭐⭐⭐⭐⭐  Google Business  🟢 Positive      │
   │                                              │
   │  [Full review text here...]                  │
   │                                              │
   │  Language: English                           │
   │  Reviewer: John Doe                          │
   │  Date: Jan 5, 2026                           │
   │                                              │
   │  [Edit Review]  [Delete Review]              │
   ├──────────────────────────────────────────────┤
   │  Response                                     │
   │  [If no response generated]                  │
   │    [Generate Response] button                │
   │                                              │
   │  [If response exists]                        │
   │    [Show response text]                      │
   │    [Edit]  [Regenerate]  [Approve]           │
   └──────────────────────────────────────────────┘
   ```

6. **Shared UI Components**
   
   **ReviewCard:** `src/components/reviews/review-card.tsx`
   - Display review summary
   - Props: review object
   - Action buttons
   - Sentiment badge
   
   **StatsCard:** `src/components/dashboard/stats-card.tsx`
   - Display stat with icon
   - Props: title, value, subtitle, icon, color
   
   **CreditBalance:** `src/components/dashboard/credit-balance.tsx`
   - Show credits remaining
   - Progress bar visual
   - Warning state if <3 credits
   - Upgrade CTA if 0 credits
   
   **SentimentBadge:** `src/components/shared/sentiment-badge.tsx`
   - Color-coded badge
   - Props: sentiment ("positive" | "neutral" | "negative" | null)
   - Green for positive, yellow for neutral, red for negative
   
   **PlatformIcon:** `src/components/shared/platform-icon.tsx`
   - Show platform logo/icon
   - Props: platform name
   
   **EmptyState:** `src/components/shared/empty-state.tsx`
   - Generic empty state component
   - Props: icon, title, description, action button

7. **Loading & Error States**
   
   **Loading Skeletons:**
   - ReviewCardSkeleton
   - StatsCardSkeleton
   - TableRowSkeleton
   
   **Error Components:**
   - ErrorBoundary wrapper
   - 404 page (review not found)
   - 500 page (server error)
   - ErrorAlert component

8. **Responsive Design**
   - Mobile: Single column, collapsible sidebar
   - Tablet: 2-column grid for stats
   - Desktop: Full layout with sidebar
   - All tables responsive (horizontal scroll on mobile)

9. **Accessibility**
   - Semantic HTML
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Focus visible states
   - Screen reader announcements for dynamic content

10. **Performance Optimizations**
    - Server components where possible
    - Client components only for interactivity
    - Image optimization (Next.js Image)
    - Code splitting by route
    - Loading states for all async operations

**Deliverables:**
- Complete dashboard layout
- All pages functional (empty states OK, no API integration yet)
- All shared components created
- Responsive design working
- Loading/error states in place
- Navigation working between pages

**Testing Checklist:**
- [ ] Dashboard loads with placeholder data
- [ ] Navigation works (sidebar, breadcrumbs)
- [ ] Add Review form validates correctly
- [ ] Review list shows and filters work (mock data)
- [ ] Mobile view is usable
- [ ] All buttons have hover states
- [ ] Loading skeletons appear correctly
- [ ] 404 and error pages display

**Time Estimate:** 2-3 days
```

**Note:** This prompt focuses on UI only. API integration comes in later prompts.

---

# Prompt 5: Review Management

## Context Files
- 02_PRD_MVP_PHASE1.md (Epic 2: Manual Review Input)
- 03_USER_FLOWS.md (Review management flows)
- 04_DATA_MODEL.md (Review schema)
- 05_API_CONTRACTS.md (Review API endpoints)

## Prompt

```
Implement complete review management functionality including create, read, update, delete operations.

**Requirements:**

1. **Review API Endpoints**
   
   **POST `/api/reviews`** - Create review
   Create `src/app/api/reviews/route.ts`:
   - Validate input (Zod schema from `05_API_CONTRACTS.md`)
   - Get authenticated user
   - Auto-detect language (use `franc` library)
   - Save review to database
   - Run sentiment analysis if quota available
   - Return created review with sentiment
   
   Request body:
   ```typescript
   {
     platform: string;
     reviewText: string;
     rating?: number;
     reviewerName?: string;
     reviewDate?: string;
     languageOverride?: string;
   }
   ```
   
   Response:
   ```typescript
   {
     success: true,
     data: {
       review: Review;
       sentimentAnalyzed: boolean;
       sentimentQuotaRemaining: number;
     }
   }
   ```
   
   **GET `/api/reviews`** - List reviews
   - Pagination (page, limit)
   - Filters: platform, sentiment, status, search
   - Sort: createdAt, rating
   - Return reviews with response count
   
   **GET `/api/reviews/[id]`** - Get single review
   - Include related response if exists
   - Include credit usage history
   - 404 if not found or not user's review
   
   **PUT `/api/reviews/[id]`** - Update review
   - Allow updating: platform, rating, reviewText, reviewerName, reviewDate
   - If reviewText changed, re-run language detection
   - Don't re-run sentiment (manual trigger only)
   - Return updated review
   
   **DELETE `/api/reviews/[id]`** - Delete review
   - Soft delete (set deletedAt)
   - Cascade delete response and versions
   - Don't refund credits (fraud prevention)
   - Return success message

2. **Language Detection Integration**
   Create `src/lib/language-detection.ts`:
   - Install `franc` package: `npm install franc`
   - Function: `detectLanguage(text: string): string`
   - Map franc language codes to display names
   - Support 40+ languages as per `09_MULTILANGUAGE_SUPPORT.md`
   - Fallback to "English" if detection fails
   - Handle short text (<20 chars) gracefully

3. **Review Form Implementation**
   Update `src/app/(dashboard)/reviews/new/page.tsx`:
   - Connect form to POST `/api/reviews`
   - Show loading state during submission
   - Display validation errors
   - Success: Show toast + redirect to review detail
   - Error: Show error message, keep form data
   - Auto-detect language on text input (debounced 500ms)
   - Character counter updates in real-time

4. **Review List Implementation**
   Update `src/app/(dashboard)/reviews/page.tsx`:
   - Fetch reviews from GET `/api/reviews`
   - Implement filters (platform, sentiment, status)
   - Implement search (debounced, searches reviewText)
   - Implement pagination
   - Show loading skeletons while fetching
   - Handle empty states
   - Handle errors gracefully

5. **Review Detail Implementation**
   Update `src/app/(dashboard)/reviews/[id]/page.tsx`:
   - Fetch review from GET `/api/reviews/[id]`
   - Show all review details
   - Edit button opens edit form
   - Delete button shows confirmation dialog
   - Generate response button (functionality in next prompt)

6. **Edit Review Modal**
   Create `src/components/reviews/edit-review-modal.tsx`:
   - Modal with form (same fields as create)
   - Pre-populate with existing data
   - Connect to PUT `/api/reviews/[id]`
   - Success: Update UI + show toast
   - Error: Show error message

7. **Delete Confirmation**
   Create `src/components/reviews/delete-review-dialog.tsx`:
   - Confirmation dialog (shadcn Dialog)
   - Warning: "This will also delete the response. Credits won't be refunded."
   - Connect to DELETE `/api/reviews/[id]`
   - Success: Redirect to reviews list + show toast
   - Error: Show error message

8. **Review Hooks**
   Create `src/hooks/use-reviews.ts`:
   - `useReviews(filters)` - Fetch and manage review list
   - `useReview(id)` - Fetch single review
   - `useCreateReview()` - Create review mutation
   - `useUpdateReview(id)` - Update review mutation
   - `useDeleteReview(id)` - Delete review mutation
   - Use React Query or SWR for caching and revalidation

9. **Validation Schemas**
   Create `src/lib/validations/review.ts`:
   - Zod schemas for review create/update
   - Export: `createReviewSchema`, `updateReviewSchema`
   - Validation rules:
     - reviewText: 1-2000 characters, required
     - platform: enum of supported platforms, required
     - rating: 1-5 or null, optional
     - reviewerName: 1-100 characters, optional
     - reviewDate: valid date, optional

10. **Error Handling**
    - Handle all edge cases from `03_USER_FLOWS.md` Error & Edge Case section
    - Empty review text → validation error
    - Review text >2000 chars → validation error
    - Network errors → retry with exponential backoff
    - 401 errors → redirect to login
    - 403 errors → show "Access denied" message
    - 404 errors → show "Review not found"

**Testing Requirements:**
Manual testing checklist:
- [ ] Create review with all fields
- [ ] Create review with only required fields
- [ ] Language auto-detects correctly (test 3+ languages)
- [ ] Sentiment runs automatically if quota available
- [ ] Sentiment skipped if quota exceeded
- [ ] Review list shows all reviews
- [ ] Filters work (platform, sentiment)
- [ ] Search works
- [ ] Pagination works
- [ ] Edit review updates successfully
- [ ] Delete review works with confirmation
- [ ] Can't delete another user's review
- [ ] Validation errors display correctly
- [ ] Character counter works
- [ ] Loading states appear
- [ ] Error messages are clear

**API Testing with cURL:**
```bash
# Create review
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google",
    "reviewText": "Great service!",
    "rating": 5
  }'

# Get reviews
curl http://localhost:3000/api/reviews?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

**Deliverables:**
- All review API endpoints working
- Review CRUD operations functional
- Language detection working
- Forms connected to API
- Validation working
- Error handling comprehensive

**Time Estimate:** 1-2 days
```

---

# Prompt 6: Brand Voice Configuration

## Context Files
- 02_PRD_MVP_PHASE1.md (Epic 4: Brand Voice Learning)
- 04_DATA_MODEL.md (BrandVoice schema)
- 05_API_CONTRACTS.md (Brand Voice API)

## Prompt

```
Implement brand voice customization system that allows users to define their brand's tone and style.

**Requirements:**

1. **Brand Voice API Endpoints**
   
   **GET `/api/brand-voice`** - Get user's brand voice
   Create `src/app/api/brand-voice/route.ts`:
   - Get authenticated user
   - Fetch brandVoice from database
   - If doesn't exist, create with defaults:
     - tone: "professional"
     - formality: 3
     - keyPhrases: []
     - styleNotes: null
     - sampleResponses: []
   - Return brand voice data
   
   **PUT `/api/brand-voice`** - Update brand voice
   - Validate input (Zod schema)
   - Update existing or create if doesn't exist
   - Return updated brand voice
   
   Request body:
   ```typescript
   {
     tone: "friendly" | "professional" | "casual" | "formal";
     formality: number; // 1-5
     keyPhrases: string[]; // max 10 phrases
     styleNotes?: string; // max 1000 chars
     sampleResponses: string[]; // max 5 responses
   }
   ```

2. **Brand Voice Settings Page**
   Create `src/app/(dashboard)/settings/brand-voice/page.tsx`:
   
   **Page Layout:**
   ```
   ┌──────────────────────────────────────────────┐
   │  Brand Voice Settings                         │
   ├──────────────────────────────────────────────┤
   │  Your brand voice helps AI generate          │
   │  responses that match your style             │
   ├──────────────────────────────────────────────┤
   │  Tone Presets                                │
   │  [Friendly] [Professional] [Casual] [Formal] │
   │                                              │
   │  Formality Level                             │
   │  1 ━━━━●━━━━━ 5                             │
   │  Casual      Formal                          │
   │                                              │
   │  Key Phrases (Optional)                      │
   │  Phrases to include in responses             │
   │  [+ Add Phrase]                              │
   │  - "Thank you for your feedback"  [×]        │
   │  - "We appreciate your business"  [×]        │
   │                                              │
   │  Style Notes (Optional)                      │
   │  [Textarea: Additional writing guidelines]   │
   │  0/1000 characters                           │
   │                                              │
   │  Sample Responses (Optional)                 │
   │  Upload 1-5 example responses                │
   │  [+ Add Sample]                              │
   │  - Response 1 [View] [×]                     │
   │  - Response 2 [View] [×]                     │
   │                                              │
   │  [Save Changes]  [Reset to Defaults]         │
   └──────────────────────────────────────────────┘
   ```
   
   **Form Features:**
   - Tone selector (4 preset buttons)
   - Formality slider (1-5 scale)
   - Key phrases input (add/remove, max 10)
   - Style notes textarea (1000 char limit)
   - Sample responses list (add/view/remove, max 5)
   - Save button (shows saving state)
   - Reset button (confirmation dialog)
   - Auto-save draft (optional, save to localStorage)

3. **Brand Voice Components**
   
   **ToneSelector:** `src/components/settings/tone-selector.tsx`
   - 4 buttons in a grid
   - Active state highlight
   - Each button shows icon + label
   - Props: value, onChange
   
   **FormalitySlider:** `src/components/settings/formality-slider.tsx`
   - Slider component (shadcn Slider)
   - Labels: "Casual" (1) → "Formal" (5)
   - Visual feedback on change
   - Props: value, onChange
   
   **KeyPhraseInput:** `src/components/settings/key-phrase-input.tsx`
   - Input field + "Add" button
   - List of added phrases with remove button
   - Max 10 phrases validation
   - Each phrase max 100 characters
   - Props: phrases, onAdd, onRemove
   
   **SampleResponseInput:** `src/components/settings/sample-response-input.tsx`
   - Textarea for adding sample
   - List of added samples with view/remove buttons
   - Max 5 samples validation
   - Each sample max 500 characters
   - Props: samples, onAdd, onRemove, onView
   
   **ViewSampleDialog:** `src/components/settings/view-sample-dialog.tsx`
   - Dialog showing full sample response
   - Read-only display
   - Close button

4. **Brand Voice Hook**
   Create `src/hooks/use-brand-voice.ts`:
   - `useBrandVoice()` - Fetch brand voice
   - `useUpdateBrandVoice()` - Update mutation
   - Handle loading/error states
   - Optimistic updates

5. **Brand Voice Utility Functions**
   Create `src/lib/brand-voice-utils.ts`:
   - `buildBrandVoicePrompt(brandVoice)` → string
     - Convert brand voice settings to text for AI prompt
     - Example output:
       ```
       Write in a professional yet friendly tone (formality: 3/5).
       
       Include these key phrases when appropriate:
       - "Thank you for your feedback"
       - "We appreciate your business"
       
       Style guidelines:
       - Always personalize with customer name if available
       - Keep responses under 150 words
       
       Here are examples of our brand voice:
       [Sample 1 text...]
       [Sample 2 text...]
       ```
   - `getDefaultBrandVoice()` → BrandVoice object
   - `validateBrandVoice(data)` → validation result

6. **Validation Schema**
   Create `src/lib/validations/brand-voice.ts`:
   - Zod schema for brand voice
   - Rules:
     - tone: enum ["friendly", "professional", "casual", "formal"]
     - formality: 1-5 integer
     - keyPhrases: array of strings (max 10, each max 100 chars)
     - styleNotes: string (max 1000 chars) or null
     - sampleResponses: array of strings (max 5, each max 500 chars)

7. **Default Brand Voice Setup**
   Update `src/app/api/auth/signup/route.ts`:
   - After creating user, create default brand voice:
     ```typescript
     await prisma.brandVoice.create({
       data: {
         userId: user.id,
         tone: "professional",
         formality: 3,
         keyPhrases: [],
         sampleResponses: [],
       },
     });
     ```

8. **Settings Navigation**
   Update `src/app/(dashboard)/settings/layout.tsx`:
   - Add sidebar with:
     - Brand Voice (current page)
     - Account (future)
     - Billing (future)
     - GDPR (future)

9. **Brand Voice Preview**
   Add to brand voice page:
   - "Preview" section at bottom
   - Shows how current settings affect AI
   - Example: Generate sample response with current brand voice
   - [Generate Preview] button
   - Shows loading state
   - Displays generated preview

10. **Error Handling**
    - Handle API errors (show toast)
    - Handle validation errors (inline form errors)
    - Handle network errors (retry button)
    - Handle save conflicts (last-write-wins with warning)

**Testing Requirements:**
- [ ] Can fetch default brand voice
- [ ] Can update tone
- [ ] Can adjust formality slider
- [ ] Can add key phrases (max 10)
- [ ] Can remove key phrases
- [ ] Can add style notes (max 1000 chars)
- [ ] Can add sample responses (max 5)
- [ ] Can view sample responses
- [ ] Can remove sample responses
- [ ] Save works and persists
- [ ] Reset to defaults works
- [ ] Form validation works
- [ ] Error messages display
- [ ] Preview generation works

**Deliverables:**
- Brand voice API endpoints working
- Settings page fully functional
- All components working
- Validation working
- Preview feature working
- Data persists correctly

**Time Estimate:** 1 day
```

---

# Prompt 7: AI Response Generation

## Context Files
- 02_PRD_MVP_PHASE1.md (Epic 3: AI Response Generation)
- 03_USER_FLOWS.md (Response generation flows)
- 04_DATA_MODEL.md (ReviewResponse, ResponseVersion schemas)
- 05_API_CONTRACTS.md (Response API endpoints)
- 09_MULTILANGUAGE_SUPPORT.md (Language handling)

## Prompt

```
Implement AI-powered response generation using Claude API with credit tracking and multi-language support.

**Requirements:**

1. **Claude API Integration**
   Create `src/lib/claude-api.ts`:
   
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';
   
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });
   
   export async function generateReviewResponse(params: {
     reviewText: string;
     rating: number | null;
     language: string;
     brandVoice: BrandVoice;
     tone?: string; // Optional override: "friendly" | "professional" | "apologetic"
   }): Promise<{
     responseText: string;
     tokensUsed: number;
   }> {
     // Build prompt using brand voice
     const systemPrompt = buildSystemPrompt(params.brandVoice);
     const userPrompt = buildUserPrompt(params);
     
     // Call Claude API
     const response = await anthropic.messages.create({
       model: 'claude-sonnet-4-20250514',
       max_tokens: 200, // Max response length
       temperature: 0.7,
       system: systemPrompt,
       messages: [{
         role: 'user',
         content: userPrompt,
       }],
     });
     
     return {
       responseText: response.content[0].text,
       tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
     };
   }
   ```
   
   **Prompt Building Functions:**
   - `buildSystemPrompt(brandVoice)` - Convert brand voice to instructions
   - `buildUserPrompt({ reviewText, rating, language, tone })` - Format request
   
   **System Prompt Structure:**
   ```
   You are a professional review response writer. Generate a response to the following review that:
   
   1. Matches this brand voice:
      - Tone: {tone}
      - Formality: {formality}/5
      - Key phrases to include: {keyPhrases}
      - Style notes: {styleNotes}
   
   2. Sample responses in our voice:
      {sampleResponses}
   
   3. Guidelines:
      - Respond in the same language as the review
      - Keep response under 150 words
      - Be authentic and specific
      - Address concerns directly
      - Thank the reviewer
   ```
   
   **User Prompt Structure:**
   ```
   Review: {reviewText}
   Rating: {rating} stars
   Language: {language}
   Tone override: {tone} (if provided)
   
   Generate a response that addresses this review appropriately.
   ```

2. **Response Generation API**
   
   **POST `/api/responses/generate`** - Generate response
   Create `src/app/api/responses/generate/route.ts`:
   
   Flow:
   1. Get authenticated user
   2. Check credits available (must have ≥1)
   3. Get review from database
   4. Get user's brand voice
   5. Call Claude API
   6. Deduct 1 credit (transaction)
   7. Save response to database
   8. Log credit usage
   9. Return response
   
   Request body:
   ```typescript
   {
     reviewId: string;
     toneOverride?: "friendly" | "professional" | "apologetic";
   }
   ```
   
   Response:
   ```typescript
   {
     success: true,
     data: {
       response: ReviewResponse;
       creditsRemaining: number;
     }
   }
   ```
   
   Error handling:
   - No credits → 402 Payment Required
   - Review not found → 404
   - Review already has response → 409 Conflict (allow regenerate)
   - Claude API error → 500 (don't deduct credit)

3. **Response Regeneration API**
   
   **POST `/api/responses/[id]/regenerate`** - Regenerate response
   Create `src/app/api/responses/[id]/regenerate/route.ts`:
   
   Flow:
   1. Check credits (≥1)
   2. Get existing response
   3. Save current response as version (ResponseVersion)
   4. Generate new response with Claude
   5. Deduct 1 credit
   6. Update response in database
   7. Log credit usage
   8. Return new response
   
   Request body:
   ```typescript
   {
     toneOverride?: "friendly" | "professional" | "apologetic";
   }
   ```

4. **Response Editing API**
   
   **PUT `/api/responses/[id]`** - Edit response
   - Update responseText
   - Set isEdited = true
   - Set editedAt = now()
   - Don't deduct credits for manual edits
   - Return updated response

5. **Response Approval API**
   
   **POST `/api/responses/[id]/approve`** - Approve response
   - Set isPublished = true
   - Set publishedAt = now()
   - Return updated response

6. **Response UI Components**
   
   **Generate Response Button:**
   Update review detail page:
   - Show "Generate Response" button if no response exists
   - Button disabled if 0 credits
   - Click → Loading state → Response appears
   
   **Response Editor:**
   Create `src/components/responses/response-editor.tsx`:
   ```
   ┌──────────────────────────────────────────────┐
   │  AI Generated Response                        │
   ├──────────────────────────────────────────────┤
   │  [Response text here in textarea]            │
   │                                              │
   │  125/500 characters                          │
   │  Language: English 🇬🇧                        │
   │  Credits used: 1                             │
   ├──────────────────────────────────────────────┤
   │  [Regenerate ↻]  [Edit ✎]  [Approve ✓]      │
   │                                              │
   │  Tone:                                       │
   │  [Default] [Friendly] [Professional]         │
   │  [Apologetic]                                │
   └──────────────────────────────────────────────┘
   ```
   
   Features:
   - Editable textarea
   - Character counter
   - Regenerate button with tone options
   - Edit mode (enable/disable textarea)
   - Approve button (confirmation)
   - Credit usage display
   - Loading states
   
   **Response Version History:**
   Create `src/components/responses/version-history.tsx`:
   - Dialog showing all versions
   - Each version: text, timestamp, tone used, credits
   - "Restore this version" button
   - Restoring creates new version (deducts credit)

7. **Credit Tracking Implementation**
   
   **Credit Deduction Function:**
   Create `src/lib/credits.ts`:
   ```typescript
   export async function deductCredits(params: {
     userId: string;
     reviewId: string;
     responseId?: string;
     amount: number; // Typically 1
     action: 'generate' | 'regenerate';
   }): Promise<void> {
     await prisma.$transaction(async (tx) => {
       // 1. Check user has credits
       const user = await tx.user.findUnique({
         where: { id: params.userId },
         select: { credits: true }
       });
       
       if (!user || user.credits < params.amount) {
         throw new Error('Insufficient credits');
       }
       
       // 2. Deduct credits
       await tx.user.update({
         where: { id: params.userId },
         data: { credits: { decrement: params.amount } }
       });
       
       // 3. Log usage (for fraud prevention)
       await tx.creditUsage.create({
         data: {
           userId: params.userId,
           reviewId: params.reviewId,
           responseId: params.responseId,
           creditsUsed: params.amount,
           action: params.action,
           details: JSON.stringify({
             timestamp: new Date(),
             // Log relevant data for audit
           })
         }
       });
     });
   }
   ```

8. **Multi-Language Support**
   - Response generated in same language as review
   - Language code passed to Claude API
   - No translation needed (Claude is natively multilingual)
   - Test with 5+ languages (English, Spanish, French, German, Chinese)

9. **Error Handling**
   - Claude API timeout (5 seconds) → Retry with exponential backoff (3 attempts)
   - Claude API rate limit → Wait and retry
   - Claude API error → Show error, don't deduct credit
   - Network error → Show retry button
   - Out of credits → Show upgrade CTA

10. **Performance Optimization**
    - Cache brand voice (don't fetch on every generation)
    - Stream Claude response (optional, for real-time feel)
    - Debounce regenerate button (prevent double-clicks)
    - Show progress indicator during generation

**Testing Requirements:**
- [ ] Generate response for English review
- [ ] Generate response for Spanish review
- [ ] Generate response for French review
- [ ] Generate response with 5-star rating (positive tone)
- [ ] Generate response with 1-star rating (apologetic tone)
- [ ] Regenerate response with different tone
- [ ] Edit response manually
- [ ] Approve response
- [ ] Credit deducted correctly on generation
- [ ] Credit deducted correctly on regeneration
- [ ] No credit deducted on manual edit
- [ ] Out of credits error shows
- [ ] Claude API error handled gracefully
- [ ] Response length <200 tokens (as configured)
- [ ] Brand voice applied correctly
- [ ] Version history works

**Example Test Cases:**
```typescript
// Test 1: Positive review
reviewText: "Great service! Very helpful team."
rating: 5
language: "English"
expectedTone: "grateful and friendly"

// Test 2: Negative review
reviewText: "Waited 2 hours. Very disappointed."
rating: 1
language: "English"
expectedTone: "apologetic and solution-oriented"

// Test 3: Spanish review
reviewText: "Excelente producto, muy recomendado."
rating: 5
language: "Spanish"
expectedResponse: "In Spanish, thanking customer"
```

**Deliverables:**
- Claude API integration working
- Response generation API functional
- Regeneration with tone options working
- Response editor component working
- Credit deduction working correctly
- Multi-language generation working
- Error handling comprehensive

**Time Estimate:** 1-2 days
```

**Critical Success Criteria:**
- Response generation completes in <5 seconds
- Credits deduct correctly every time
- Multi-language works (test 5+ languages)
- Brand voice is applied consistently
- No credits deducted on API errors

---

# Prompt 8: Sentiment Analysis

## Context Files
- 02_PRD_MVP_PHASE1.md (Epic 7: Sentiment Analysis)
- 01_PRODUCT_ONE_PAGER.md (DeepSeek API details)
- 04_DATA_MODEL.md (SentimentUsage schema)

## Prompt

```
Implement sentiment analysis using DeepSeek API with separate quota system.

**Requirements:**

1. **DeepSeek API Integration**
   Create `src/lib/deepseek-api.ts`:
   
   ```typescript
   import OpenAI from 'openai'; // DeepSeek uses OpenAI SDK
   
   const deepseek = new OpenAI({
     apiKey: process.env.DEEPSEEK_API_KEY,
     baseURL: 'https://api.deepseek.com',
   });
   
   export async function analyzeSentiment(
     reviewText: string
   ): Promise<"positive" | "neutral" | "negative"> {
     try {
       const response = await deepseek.chat.completions.create({
         model: 'deepseek-chat',
         messages: [
           {
             role: 'system',
             content: `You are a sentiment analysis expert. Analyze the sentiment of customer reviews.
             
             Output ONLY one word: "positive", "neutral", or "negative".
             
             Guidelines:
             - positive: 4-5 stars, praise, satisfaction, recommendations
             - neutral: 3 stars, mixed feelings, factual statements
             - negative: 1-2 stars, complaints, disappointment, problems`
           },
           {
             role: 'user',
             content: `Review: "${reviewText}"
             
             Sentiment:`
           }
         ],
         max_tokens: 10,
         temperature: 0.3,
       });
       
       const sentiment = response.choices[0].message.content?.toLowerCase().trim();
       
       if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
         return sentiment;
       }
       
       throw new Error('Invalid sentiment response');
     } catch (error) {
       console.error('DeepSeek API error:', error);
       throw error;
     }
   }
   ```

2. **Automatic Sentiment on Review Save**
   Update POST `/api/reviews`:
   
   Flow when saving review:
   ```typescript
   async function createReview(data, userId) {
     return await prisma.$transaction(async (tx) => {
       // 1. Create review
       const review = await tx.review.create({ data });
       
       // 2. Check sentiment quota
       const user = await tx.user.findUnique({
         where: { id: userId },
         select: { sentimentUsed: true, sentimentQuota: true }
       });
       
       if (user.sentimentUsed < user.sentimentQuota) {
         try {
           // 3. Analyze sentiment
           const sentiment = await analyzeSentiment(review.reviewText);
           
           // 4. Update review with sentiment
           await tx.review.update({
             where: { id: review.id },
             data: { sentiment }
           });
           
           // 5. Increment sentiment usage
           await tx.user.update({
             where: { id: userId },
             data: { sentimentUsed: { increment: 1 } }
           });
           
           // 6. Log sentiment usage (fraud prevention)
           await tx.sentimentUsage.create({
             data: {
               userId,
               reviewId: review.id,
               sentiment,
               details: JSON.stringify({
                 platform: review.platform,
                 rating: review.rating,
                 analyzedAt: new Date()
               })
             }
           });
         } catch (error) {
           // If sentiment fails, still save review (sentiment = null)
           console.error('Sentiment analysis failed:', error);
         }
       }
       
       return review;
     });
   }
   ```

3. **Manual Sentiment Analysis**
   
   **POST `/api/sentiment/analyze`** - Manually analyze review
   Create `src/app/api/sentiment/analyze/route.ts`:
   - For reviews with sentiment = null
   - Check quota available
   - Run sentiment analysis
   - Update review
   - Deduct from quota
   - Log usage
   - Return updated review with sentiment
   
   Request body:
   ```typescript
   {
     reviewId: string;
   }
   ```

4. **Batch Sentiment Analysis**
   
   **POST `/api/sentiment/batch`** - Analyze multiple reviews
   - For initial setup (analyze existing reviews)
   - Check quota available
   - Analyze up to N reviews at once (N = min(10, quotaRemaining))
   - Update all reviews
   - Deduct from quota
   - Return results
   
   Request body:
   ```typescript
   {
     reviewIds: string[];
   }
   ```

5. **Sentiment Quota Management**
   
   **Quota Tracking:**
   - FREE: 35 analyses/month
   - STARTER: 300 analyses/month
   - GROWTH: 1000 analyses/month
   
   **Monthly Reset:**
   - Create cron job (Vercel Cron or similar)
   - Reset sentimentUsed to 0 for all users on 1st of month
   - Update sentimentResetDate
   
   Create `src/app/api/cron/reset-sentiment-quota/route.ts`:
   ```typescript
   export async function GET(request: Request) {
     // Verify cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     // Reset quota for all users
     await prisma.user.updateMany({
       data: {
         sentimentUsed: 0,
         sentimentResetDate: new Date()
       }
     });
     
     return Response.json({ success: true, message: 'Sentiment quota reset' });
   }
   ```

6. **Sentiment UI Components**
   
   **SentimentBadge:** (already created in Prompt 4)
   - Update to handle null sentiment
   - If null: Show "Analyze" button
   
   **SentimentQuotaDisplay:**
   Create `src/components/dashboard/sentiment-quota-display.tsx`:
   ```
   ┌──────────────────────────────────────────┐
   │  😊 Sentiment Quota                      │
   │  28 / 35 remaining                       │
   │  [████████░░] 80%                        │
   │                                          │
   │  Resets: Feb 1, 2026                     │
   └──────────────────────────────────────────┘
   ```
   
   Features:
   - Show used/total
   - Progress bar
   - Reset date
   - Warning if <10% remaining
   - Link to upgrade if quota exceeded
   
   **Analyze Button:**
   - On review cards with sentiment = null
   - Shows "Analyze Sentiment" button
   - Click → API call → Update badge
   - Disabled if quota = 0

7. **Batch Analysis UI**
   
   **Batch Analyze Modal:**
   Create `src/components/reviews/batch-analyze-modal.tsx`:
   - Shows reviews without sentiment
   - Select reviews to analyze (checkboxes)
   - Show quota remaining
   - "Analyze Selected (N reviews)" button
   - Progress indicator during analysis
   - Success: Show results, update cards
   
   Trigger: Button on reviews page "Analyze All Without Sentiment"

8. **Dashboard Integration**
   Update dashboard stats:
   - Add sentiment quota card
   - Show sentiment distribution chart:
     ```
     Sentiment Breakdown
     🟢 Positive: 15 (65%)
     🟡 Neutral: 5 (22%)
     🔴 Negative: 3 (13%)
     ```

9. **Error Handling**
   - DeepSeek API error → Skip sentiment, save review anyway
   - Quota exceeded → Save review without sentiment
   - Invalid sentiment response → Default to null
   - Network error → Retry once, then skip
   
   User messaging:
   - "Sentiment analysis skipped (quota exceeded)"
   - "Sentiment analysis unavailable (API error)"
   - "Analyzing sentiment..." (loading)

10. **Fraud Prevention**
    - Log every sentiment analysis in SentimentUsage table
    - Include: userId, reviewId, sentiment, timestamp
    - Never delete logs (even if review deleted)
    - Query for suspicious patterns:
      - Same review analyzed multiple times
      - Rapid analysis in short time period
      - Unusual quota consumption

**Testing Requirements:**
- [ ] Sentiment analyzed automatically on review save
- [ ] Sentiment skipped if quota = 0
- [ ] Manual sentiment analysis works
- [ ] Batch analysis works (3+ reviews)
- [ ] Quota deducts correctly
- [ ] Quota display shows correct values
- [ ] Sentiment badge displays correctly
- [ ] Positive reviews get "positive" sentiment
- [ ] Negative reviews get "negative" sentiment
- [ ] Neutral reviews get "neutral" sentiment
- [ ] DeepSeek API error handled gracefully
- [ ] Quota reset cron job works (test manually)
- [ ] Sentiment usage logged correctly

**Test Cases:**
```typescript
// Test 1: Positive sentiment
reviewText: "Excellent product! Highly recommend."
expectedSentiment: "positive"

// Test 2: Negative sentiment
reviewText: "Terrible experience. Never again."
expectedSentiment: "negative"

// Test 3: Neutral sentiment
reviewText: "It's okay. Works as expected."
expectedSentiment: "neutral"

// Test 4: Quota exceeded
sentimentUsed: 35
sentimentQuota: 35
expectedBehavior: "Review saved without sentiment"
```

**Deliverables:**
- DeepSeek API integration working
- Automatic sentiment on review save
- Manual sentiment analysis working
- Batch analysis working
- Quota tracking working
- Monthly reset cron job configured
- UI components for sentiment display
- Error handling comprehensive

**Time Estimate:** 1 day
```

---

# Prompt 9: Credit System

## Context Files
- 02_PRD_MVP_PHASE1.md (Epic 6: Credit System)
- 01_PRODUCT_ONE_PAGER.md (Credit pricing details)
- 04_DATA_MODEL.md (CreditUsage schema)
- 05_API_CONTRACTS.md (Credit API endpoints)

## Prompt

```
Implement comprehensive credit tracking and management system.

**Requirements:**

1. **Credit Tracking Infrastructure**
   
   Already implemented in previous prompts:
   - [x] Credit deduction on response generation
   - [x] Credit deduction on regeneration
   - [x] CreditUsage logging
   
   Verify implementation:
   - Credits deduct correctly (atomic transaction)
   - No double-deduction on errors
   - CreditUsage logs complete

2. **Credit Management API**
   
   **GET `/api/credits`** - Get user's credit info
   Create `src/app/api/credits/route.ts`:
   ```typescript
   export async function GET(request: Request) {
     const user = await getCurrentUser();
     
     return Response.json({
       success: true,
       data: {
         credits: user.credits,
         tier: user.tier,
         resetDate: user.creditsResetDate,
         usage: {
           thisMonth: await getCreditUsageThisMonth(user.id),
           lastMonth: await getCreditUsageLastMonth(user.id),
         }
       }
     });
   }
   ```
   
   **GET `/api/credits/history`** - Get usage history
   - Pagination (page, limit)
   - Filters: date range, action type
   - Return CreditUsage records with related review/response

3. **Monthly Credit Reset**
   
   **Cron Job:** Reset credits on 1st of month
   Create `src/app/api/cron/reset-credits/route.ts`:
   ```typescript
   export async function GET(request: Request) {
     // Verify cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     // Reset credits based on tier
     await prisma.user.updateMany({
       where: { tier: 'FREE' },
       data: {
         credits: 15,
         creditsResetDate: new Date()
       }
     });
     
     await prisma.user.updateMany({
       where: { tier: 'STARTER' },
       data: {
         credits: 60,
         creditsResetDate: new Date()
       }
     });
     
     await prisma.user.updateMany({
       where: { tier: 'GROWTH' },
       data: {
         credits: 200,
         creditsResetDate: new Date()
       }
     });
     
     return Response.json({
       success: true,
       message: 'Credits reset for all users'
     });
   }
   ```
   
   Configure in `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/reset-credits",
       "schedule": "0 0 1 * *"
     }]
   }
   ```

4. **Credit Dashboard Components**
   
   **CreditBalance:** (update existing component)
   Location: Sidebar header
   ```
   ┌──────────────────────┐
   │  💳 Credits          │
   │  14 / 15 remaining   │
   │  [███████████░] 93%  │
   │  Resets: Feb 1       │
   └──────────────────────┘
   ```
   
   Features:
   - Real-time balance
   - Progress bar
   - Reset date countdown
   - Warning if <3 credits
   - Urgent warning if 0 credits
   
   **CreditUsageHistory:**
   Create `src/components/credits/credit-usage-history.tsx`:
   ```
   ┌────────────────────────────────────────────┐
   │  Credit Usage History                       │
   ├────────────────────────────────────────────┤
   │  Jan 7, 2:30 PM | Generate  | -1 | Review: "Great..." │
   │  Jan 7, 2:25 PM | Regenerate| -1 | Review: "Good..."  │
   │  Jan 6, 4:15 PM | Generate  | -1 | Review: "Nice..."  │
   │  Jan 5, 1:00 PM | Reset     | +15| Monthly reset      │
   ├────────────────────────────────────────────┤
   │  Page 1 of 3    [Previous] [Next]          │
   └────────────────────────────────────────────┘
   ```
   
   Features:
   - Paginated table
   - Filter by date range
   - Filter by action type
   - Show review preview
   - Link to review detail
   - Export to CSV (optional)
   
   **LowCreditWarning:**
   Create `src/components/credits/low-credit-warning.tsx`:
   - Shows alert banner when <3 credits
   - "You're running low on credits. Upgrade to continue."
   - [Upgrade Now] button
   - Dismissible (stores in localStorage)
   
   **OutOfCreditsModal:**
   Create `src/components/credits/out-of-credits-modal.tsx`:
   - Shows when user tries to generate with 0 credits
   - Can't dismiss (blocks action)
   - "You're out of credits!"
   - Shows tier options (FREE → STARTER → GROWTH)
   - [Upgrade to Starter] [Upgrade to Growth] [Maybe Later]
   - "Maybe Later" just closes modal

5. **Credit Usage Analytics**
   
   **Dashboard Stats:**
   Add to dashboard:
   - Total credits used this month
   - Average credits per response (current: ~1.2)
   - Credits used vs. available (chart)
   - Projection: "At this rate, you'll run out in X days"
   
   **Usage Insights:**
   Create `src/components/credits/usage-insights.tsx`:
   - Calculate user's average:
     - Credits per response
     - Regenerations per response
     - Edit rate (manual edits / total responses)
   - Compare to platform averages
   - Tips to optimize credit usage

6. **Credit Utilities**
   Create `src/lib/credits-utils.ts`:
   
   ```typescript
   // Check if user has credits
   export async function hasCredits(userId: string, amount: number = 1): Promise<boolean> {
     const user = await prisma.user.findUnique({
       where: { id: userId },
       select: { credits: true }
     });
     return user ? user.credits >= amount : false;
   }
   
   // Get credit limit for tier
   export function getCreditLimit(tier: Tier): number {
     const limits = {
       FREE: 15,
       STARTER: 60,
       GROWTH: 200
     };
     return limits[tier];
   }
   
   // Calculate days until credits reset
   export function daysUntilReset(resetDate: Date): number {
     const now = new Date();
     const diff = resetDate.getTime() - now.getTime();
     return Math.ceil(diff / (1000 * 60 * 60 * 24));
   }
   
   // Get usage stats
   export async function getCreditStats(userId: string) {
     const thisMonth = await prisma.creditUsage.aggregate({
       where: {
         userId,
         createdAt: { gte: startOfMonth(new Date()) }
       },
       _sum: { creditsUsed: true },
       _count: { id: true }
     });
     
     return {
       totalUsed: thisMonth._sum.creditsUsed || 0,
       totalActions: thisMonth._count || 0,
       averagePerAction: thisMonth._count > 0
         ? (thisMonth._sum.creditsUsed || 0) / thisMonth._count
         : 0
     };
   }
   ```

7. **Upgrade Prompts**
   
   **When to Show:**
   - 0 credits → Show immediately on generate attempt
   - <3 credits → Show banner on dashboard
   - >50% quota used → Show gentle reminder
   
   **Where to Show:**
   - Modal (out of credits)
   - Banner (low credits)
   - In sidebar (always visible count)
   - On settings page (upgrade options)
   
   **Upgrade Flow (Phase 1 - No Stripe):**
   - Show pricing comparison
   - Link to "Contact Sales" form
   - Or placeholder "Upgrade coming soon"
   - Track upgrade interest in database

8. **Fraud Prevention**
   
   **Credit Usage Auditing:**
   - All credit usage logged permanently
   - Include: userId, reviewId, responseId, action, timestamp
   - Never delete CreditUsage records
   - Query for suspicious patterns:
     - Excessive regenerations (>10 per response)
     - Rapid-fire generations
     - Credit manipulation attempts
   
   **Transaction Safety:**
   - Always use database transactions
   - Check-then-deduct pattern:
     ```typescript
     await prisma.$transaction(async (tx) => {
       const user = await tx.user.findUnique(...);
       if (user.credits < 1) throw new Error();
       await tx.user.update({ data: { credits: { decrement: 1 } } });
       // ... rest of logic
     });
     ```
   
   **Rate Limiting:**
   - Max 10 generations per minute per user
   - Max 5 regenerations per response
   - Prevent credit abuse via API

9. **Testing Credit System**
   
   **Unit Tests:**
   ```typescript
   describe('Credit System', () => {
     test('deducts credit on generation', async () => {
       // Create user with 5 credits
       // Generate response
       // Verify credits = 4
     });
     
     test('prevents generation with 0 credits', async () => {
       // Create user with 0 credits
       // Attempt generation
       // Expect error
     });
     
     test('logs credit usage', async () => {
       // Generate response
       // Verify CreditUsage record created
     });
     
     test('atomic transaction on error', async () => {
       // Mock Claude API error
       // Attempt generation
       // Verify credits NOT deducted
     });
   });
   ```
   
   **Manual Tests:**
   - [ ] Generate response → Credit deducts
   - [ ] Regenerate response → Credit deducts
   - [ ] Edit response → Credit NOT deducted
   - [ ] Claude API error → Credit NOT deducted
   - [ ] Attempt with 0 credits → Blocked
   - [ ] Credit history shows all actions
   - [ ] Low credit warning appears
   - [ ] Out of credits modal blocks action
   - [ ] Monthly reset works (test manually by calling cron endpoint)

10. **Documentation**
    Create `docs/CREDITS.md`:
    - How credits work
    - Tier limits
    - What consumes credits
    - What doesn't consume credits
    - Monthly reset behavior
    - Upgrade options
    - Fraud prevention measures

**Deliverables:**
- Credit tracking fully functional
- Credit API endpoints working
- Monthly reset cron job configured
- Dashboard components showing credit info
- Usage history page working
- Low credit warnings implemented
- Out of credits modal implemented
- Fraud prevention measures in place
- Comprehensive testing completed

**Time Estimate:** 1 day
```

---

# Prompt 10: Testing, Deployment & Finalization

## Context Files
- All Phase 0 documents
- Outputs from Prompts 1-9

## Prompt

```
Finalize the MVP with comprehensive testing, deployment setup, and documentation.

**Requirements:**

1. **End-to-End Testing**
   
   **Complete User Journey Test:**
   Test the entire flow from signup to approved response:
   
   ```
   1. Signup
      - [ ] Email/password signup works
      - [ ] Verification email sent
      - [ ] Click verification link
      - [ ] Redirect to dashboard
      - [ ] Default brand voice created
      - [ ] Credits initialized (15)
      - [ ] Sentiment quota initialized (35)
   
   2. Brand Voice Setup
      - [ ] Navigate to settings
      - [ ] Update tone to "Friendly"
      - [ ] Add 2 key phrases
      - [ ] Add style notes
      - [ ] Save successfully
   
   3. Add First Review
      - [ ] Click "Add Review"
      - [ ] Paste review text
      - [ ] Select 5-star rating
      - [ ] Select "Google Business"
      - [ ] Language auto-detected
      - [ ] Save review
      - [ ] Sentiment analyzed automatically
      - [ ] Redirected to review detail
   
   4. Generate Response
      - [ ] Click "Generate Response"
      - [ ] Loading state appears
      - [ ] Response generated in <5 seconds
      - [ ] Response matches brand voice
      - [ ] Response in same language as review
      - [ ] Credit deducted (14/15)
      - [ ] CreditUsage logged
   
   5. Regenerate with Different Tone
      - [ ] Click "Regenerate"
      - [ ] Select "Professional" tone
      - [ ] New response generated
      - [ ] Previous version saved
      - [ ] Credit deducted (13/15)
   
   6. Edit Response
      - [ ] Click "Edit"
      - [ ] Modify text
      - [ ] Save changes
      - [ ] Credit NOT deducted
      - [ ] isEdited flag set
   
   7. Approve Response
      - [ ] Click "Approve"
      - [ ] Confirmation dialog
      - [ ] Response approved
      - [ ] Status updated
   
   8. View Dashboard
      - [ ] Stats cards show correct numbers
      - [ ] Recent reviews listed
      - [ ] Credit balance correct (13/15)
      - [ ] Sentiment quota correct (34/35)
   
   9. Add More Reviews
      - [ ] Add 5 more reviews (different languages)
      - [ ] Generate responses for each
      - [ ] Verify multi-language works
      - [ ] Check credit balance decreases
   
   10. Test Credit Exhaustion
       - [ ] Generate responses until 0 credits
       - [ ] Out of credits modal appears
       - [ ] Can't generate new responses
       - [ ] Can still edit existing responses
   ```

2. **Error Handling Tests**
   
   Test all error scenarios:
   - [ ] Invalid email on signup
   - [ ] Weak password rejected
   - [ ] Email already exists
   - [ ] Invalid login credentials
   - [ ] Unverified email login blocked
   - [ ] Review text too long (>2000 chars)
   - [ ] Review text too short (<1 char)
   - [ ] Generate with 0 credits blocked
   - [ ] Claude API timeout handled
   - [ ] DeepSeek API error handled
   - [ ] Network disconnection handled
   - [ ] Database connection error handled
   - [ ] Concurrent credit deduction (race condition)

3. **Multi-Language Testing**
   
   Test response generation in multiple languages:
   - [ ] English review → English response
   - [ ] Spanish review → Spanish response
   - [ ] French review → French response
   - [ ] German review → German response
   - [ ] Chinese review → Chinese response
   - [ ] Mixed language review → Handled correctly
   
   Verify:
   - Language detection accuracy >95%
   - Response quality in each language
   - Brand voice applies across languages

4. **Performance Testing**
   
   Benchmark critical operations:
   - [ ] Response generation <5 seconds (p95)
   - [ ] Page load <2 seconds
   - [ ] API response <500ms (non-AI endpoints)
   - [ ] Database queries <100ms
   - [ ] Review list pagination smooth
   - [ ] No memory leaks (check dev tools)

5. **Security Audit**
   
   Verify security measures:
   - [ ] Passwords hashed (bcrypt cost 12)
   - [ ] JWT tokens httpOnly
   - [ ] CSRF protection active
   - [ ] SQL injection prevented (Prisma)
   - [ ] XSS prevented (React escaping)
   - [ ] Rate limiting works (5 login attempts)
   - [ ] API routes require authentication
   - [ ] Users can only access own data
   - [ ] No sensitive data in logs
   - [ ] Environment variables secured

6. **Database Integrity**
   
   Verify data integrity:
   - [ ] All foreign keys work
   - [ ] Cascade deletes work correctly
   - [ ] Indexes improve query speed
   - [ ] No orphaned records
   - [ ] Transactions are atomic
   - [ ] Credit deduction can't go negative
   - [ ] Sentiment quota can't go negative

7. **Deployment Setup**
   
   **Vercel Deployment:**
   
   A. Environment Variables Setup:
   ```bash
   # Add to Vercel project settings:
   DATABASE_URL="[Supabase Production URL]"
   NEXTAUTH_URL="https://reviewflow.vercel.app"
   NEXTAUTH_SECRET="[Generate new secret]"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ANTHROPIC_API_KEY="..."
   DEEPSEEK_API_KEY="..."
   RESEND_API_KEY="..."
   CRON_SECRET="[Generate secure secret]"
   ```
   
   B. Configure Vercel Project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`
   
   C. Set up Custom Domain (optional):
   - Add domain in Vercel
   - Configure DNS records
   - Enable SSL (automatic)
   
   D. Configure Cron Jobs:
   - Add `vercel.json`:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/reset-credits",
           "schedule": "0 0 1 * *"
         },
         {
           "path": "/api/cron/reset-sentiment-quota",
           "schedule": "0 0 1 * *"
         }
       ]
     }
     ```

8. **Database Migration to Production**
   
   ```bash
   # 1. Update DATABASE_URL to production
   export DATABASE_URL="[Supabase Production URL]"
   
   # 2. Run migrations
   npx prisma migrate deploy
   
   # 3. Generate Prisma client
   npx prisma generate
   
   # 4. Verify connection
   npx prisma studio
   ```

9. **Monitoring & Logging Setup**
   
   A. Sentry Integration (Error Tracking):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
   
   B. Vercel Analytics (Performance):
   - Enable in Vercel dashboard
   - Add `<Analytics />` component
   
   C. Custom Logging:
   - Log all API errors
   - Log credit deductions
   - Log sentiment analysis failures
   - Log authentication events
   
   D. Alerts:
   - Sentry: Error rate >1% → Slack notification
   - Credit system: Negative credits detected → Email alert
   - API: Claude/DeepSeek downtime → Email alert

10. **Documentation**
    
    Create documentation files:
    
    **README.md:**
    - Project overview
    - Tech stack
    - Local development setup
    - Environment variables
    - Database setup
    - Running tests
    - Deployment process
    
    **ARCHITECTURE.md:**
    - System architecture diagram
    - Folder structure explanation
    - Data flow diagrams
    - API architecture
    - Database schema overview
    
    **API_DOCUMENTATION.md:**
    - All API endpoints
    - Request/response examples
    - Error codes
    - Rate limits
    - Authentication
    
    **DEVELOPMENT.md:**
    - How to add a new feature
    - Code style guide
    - Git workflow
    - PR process
    - Testing guidelines
    
    **DEPLOYMENT.md:**
    - Deployment checklist
    - Environment setup
    - Database migration process
    - Rollback procedure
    - Monitoring dashboards

11. **Beta Launch Checklist**
    
    Before inviting beta users:
    - [ ] All acceptance criteria met
    - [ ] Manual testing completed
    - [ ] Error tracking configured
    - [ ] Deployed to production
    - [ ] Database backups enabled
    - [ ] Monitoring active
    - [ ] Documentation complete
    - [ ] Privacy policy published at /privacy
    - [ ] Terms of service published at /terms
    - [ ] Cookie consent banner added
    - [ ] GDPR data export working
    - [ ] GDPR account deletion working
    - [ ] Email templates finalized
    - [ ] Onboarding flow polished
    - [ ] Help documentation created
    - [ ] Feedback collection method set up
    - [ ] Bug reporting method set up
    - [ ] Beta user invitation email ready

12. **Post-Launch Tasks**
    
    After beta launch:
    - [ ] Monitor error rates daily
    - [ ] Check performance metrics
    - [ ] Review credit usage patterns
    - [ ] Analyze sentiment quota usage
    - [ ] Collect user feedback
    - [ ] Track user activation rate
    - [ ] Monitor response generation quality
    - [ ] Check API costs (Claude + DeepSeek)
    - [ ] Identify bugs and prioritize fixes
    - [ ] Plan Phase 2 features (CSV import)

**Final Deliverables:**
- Fully functional MVP
- All tests passing
- Deployed to production (Vercel)
- Monitoring configured
- Documentation complete
- Beta users can be onboarded
- Feedback collection ready

**Success Criteria:**
- 5 beta users successfully complete full journey
- Response generation success rate >95%
- Average response time <5 seconds
- Zero critical bugs
- Credit system 100% accurate
- Multi-language works in 5+ languages
- User satisfaction >4/5 stars

**Time Estimate:** 2-3 days
```

---

## Appendix: Quick Reference

### Development Sequence Summary

1. **Planning** (Prompt 0) - 0.5 day
2. **Project Setup** (Prompt 1) - 0.5 day
3. **Database** (Prompt 2) - 0.5 day
4. **Authentication** (Prompt 3) - 1.5 days
5. **Dashboard UI** (Prompt 4) - 2 days
6. **Review Management** (Prompt 5) - 1.5 days
7. **Brand Voice** (Prompt 6) - 1 day
8. **AI Response Generation** (Prompt 7) - 2 days
9. **Sentiment Analysis** (Prompt 8) - 1 day
10. **Credit System** (Prompt 9) - 1 day
11. **Testing & Deployment** (Prompt 10) - 2 days

**Total Estimated Time:** 14 days (2 weeks)

### Critical Dependencies

```
Prompt 1 (Setup)
    â†"
Prompt 2 (Database)
    â†"
Prompt 3 (Auth) ─────→ Prompt 4 (UI)
    â†"                     â†"
Prompt 6 (Brand)      Prompt 5 (Reviews)
    â†"                     â†"
Prompt 7 (AI) ←───────┘
    â†"
Prompt 8 (Sentiment)  Prompt 9 (Credits)
    â†"                     â†"
Prompt 10 (Testing & Deploy)
```

### Key Files Reference

```
Core Configuration:
- prisma/schema.prisma (Database schema)
- src/lib/prisma.ts (Prisma client)
- src/lib/auth.ts (NextAuth config)
- src/middleware.ts (Route protection)

API Integrations:
- src/lib/claude-api.ts (Response generation)
- src/lib/deepseek-api.ts (Sentiment analysis)
- src/lib/email.ts (Resend integration)

Core Business Logic:
- src/lib/credits.ts (Credit system)
- src/lib/brand-voice-utils.ts (Brand voice)
- src/lib/language-detection.ts (Multi-language)

Main Pages:
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(dashboard)/reviews/page.tsx
- src/app/(dashboard)/reviews/new/page.tsx
- src/app/(dashboard)/settings/brand-voice/page.tsx

API Routes:
- src/app/api/reviews/route.ts
- src/app/api/responses/generate/route.ts
- src/app/api/brand-voice/route.ts
- src/app/api/credits/route.ts
- src/app/api/sentiment/analyze/route.ts
```

---

## Notes for Claude Code

When using these prompts:

1. **Read All Context First**: Before starting each prompt, read all referenced documentation files
2. **Ask Clarifying Questions**: If anything is ambiguous, ask before implementing
3. **Follow Exact Specifications**: The Phase 0 docs are authoritative - implement exactly as specified
4. **Test After Each Prompt**: Verify functionality works before proceeding to next prompt
5. **Document Decisions**: If you make any implementation decisions, document them
6. **Report Blockers Immediately**: If you encounter issues, report them promptly
7. **Maintain Type Safety**: Use TypeScript strictly, no `any` types
8. **Write Clean Code**: Follow best practices, add comments for complex logic
9. **Handle Errors Gracefully**: Every API call should have error handling
10. **Think About Edge Cases**: Consider what could go wrong and handle it

---

**Document Status:** ✅ READY FOR IMPLEMENTATION

**Last Updated:** January 7, 2026

**Next Step:** Start with Prompt 0 (Planning & Architecture Review)
