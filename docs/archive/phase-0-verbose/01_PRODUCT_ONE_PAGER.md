# Product One-Pager: ReviewFlow
## AI-Powered Review Response Management Platform

**Version:** 2.0  
**Last Updated:** January 5, 2026  
**Status:** Pre-Development (Phase 0)  
**Pricing Model:** Credit-Based System

---

## What We're Building

An AI-powered platform that helps businesses automatically generate personalized responses to customer reviews across multiple platforms (Google Business, Amazon via CSV, Shopify, Trustpilot) with brand voice customization, multi-language support, and sentiment analysis.

**In one sentence:** ReviewFlow saves businesses 10+ hours per week by using AI to generate on-brand review responses in any language, with automatic sentiment tracking and one-click posting to major review platforms.

---

## The Problem We're Solving

### Pain Points
1. **Time-consuming:** Businesses spend 5-15 hours/week manually responding to reviews
2. **Inconsistent tone:** Different team members respond differently, diluting brand voice
3. **Language barriers:** International reviews require translation and native-level responses
4. **Platform fragmentation:** Reviews scattered across Google, Amazon, Shopify, Trustpilot, etc.
5. **Scalability issues:** As business grows, review volume becomes unmanageable
6. **No insights:** Can't track sentiment trends or identify issues across review platforms

### Current Solutions (Inadequate)
- **Manual responses:** Time-consuming, inconsistent, no analytics
- **Generic templates:** Feel robotic, harm brand perception
- **General AI writers (Grammarly, Jasper):** Not specialized for reviews, no integration
- **Enterprise tools (Reputation.com, Birdeye):** $500+/month, overkill for SMBs

---

## Who This Is For

### Primary Target: SMBs Processing Moderate Review Volumes
- **Company size:** 10-100 employees
- **Industries:** E-commerce, retail, restaurants, services, multi-location businesses
- **Review volume:** 20-200 reviews/month (any business with online reviews)
- **Platforms:** Google Business, Shopify, Amazon, Trustpilot, etc.
- **Pain:** Spending too much time on review management, need automation

### Explicit Non-Targets (For MVP)
- ❌ Solo entrepreneurs (<10 reviews/month) → Free tier sufficient
- ❌ Large enterprises (>500 employees) → Need Reputation.com/Birdeye features
- ❌ Agencies managing multiple clients → Future multi-tenant feature
- ❌ Review generation/solicitation platforms → Different product category

---

## Why This Will Win

### Competitive Advantages
1. **AI-First, Review-Specialized:** Purpose-built for review responses (not generic AI writing)
2. **Brand Voice Learning:** Analyzes past responses to match unique tone automatically
3. **Multi-Language Native:** Auto-detects language, responds in same language (40+ languages)
4. **Built-in Sentiment Analysis:** Track trends without manual review reading
5. **Credit-Based Fairness:** Pay only for AI responses generated, unlimited review storage
6. **SMB-Focused:** Simple, affordable ($29-79/mo), self-serve (vs enterprise $500+/mo)

### Market Opportunity
- **Market Size:** $500M+ review management software market
- **Growth:** 15-20% YoY as online reviews become critical for discovery
- **Timing:** 2025-2026 is AI adoption wave for SMBs
- **Gap:** No dominant AI-first review response tool for SMBs under $100/month

---

## Core Features (MVP - Phase 1)

### Week 1-2: Foundation
1. **AI Response Generation**
   - Input: Review text + rating
   - Output: Personalized response draft in same language
   - Uses: Claude 3.5 Sonnet API
   - Speed: <5 seconds per response
   - Cost: ~1 credit per API call (~2 credits per final published response)

2. **Brand Voice Customization**
   - User provides: Brand guidelines, tone preferences, sample responses
   - System learns: Writing style, vocabulary, response patterns
   - Result: AI responses match brand personality automatically

3. **Manual Review Input**
   - Copy-paste reviews from any platform
   - Auto-detect: Rating (1-5 stars), language, sentiment
   - Fallback: Works when APIs unavailable

4. **Response Editor & Regeneration**
   - Edit AI suggestions before publishing
   - Regenerate with different tone (friendly, professional, apologetic)
   - Track response history and credit usage

5. **Multi-Language Support**
   - Auto-detect review language (40+ languages)
   - Generate response in same language (no translation needed)
   - Native-quality responses in Spanish, French, German, Chinese, etc.

6. **Credit Tracking Dashboard**
   - Real-time credit balance display
   - Usage analytics (credits consumed per day/week)
   - Low credit warnings (< 10% remaining)

7. **Sentiment Analysis** (Powered by DeepSeek API)
   - Auto-analyze sentiment: Positive, Neutral, Negative
   - Separate quota from AI response credits
   - Two-batch system: Analyze historical reviews + ongoing monthly reviews

### Week 3: CSV Import (Phase 2)
- Upload CSV files from any review platform
- Auto-detect format (Amazon, Trustpilot, Google, Yelp, etc.)
- Bulk process 100s of reviews
- Export responses as CSV for manual posting

### Week 4: Google Business Integration (Phase 3)
- OAuth connection to Google Business Profile
- Auto-sync new reviews daily
- One-click response posting back to Google
- Proof that API integrations work (enables future integrations)

---

## Credit-Based Pricing System ⭐

### How Credits Work
- **1 credit = 1 API call to Claude 3.5 Sonnet**
- **Average usage: ~2.0 credits per final published response**
  - Initial generation: 1 credit
  - Regeneration/edits: +0-3 credits (depending on user)
  - Most users: 50% use as-is, 30% regenerate once, 20% edit multiple times

### Sentiment Analysis (Separate Quota)
- **Powered by:** DeepSeek API (10x cheaper than Claude)
- **Cost:** ~$0.001 per review analyzed
- **Quota calculation:**
  - Free tier: (credits × 10) / 4 → (15 × 10) / 4 = 35 analyses/month
  - Paid tiers: (credits × 10) / 2 → Starter: 300, Growth: 1,000 analyses/month
- **Two-batch system:**
  - Batch 1: Analyze existing reviews (one-time, up to quota)
  - Batch 2: Analyze new reviews monthly (ongoing, up to monthly quota)

---

## Pricing Tiers (Finalized for MVP)

```
FREE TIER - $0/month
├─ 15 credits/month (~7-8 final responses)
├─ 35 sentiment analyses/month
├─ Unlimited review storage
├─ Manual input only
├─ Basic brand voice
└─ Community support
   → Goal: Let users taste the product
   → Converts to paid within 1-2 months

STARTER - $29/month
├─ 60 credits/month (~30 final responses)
├─ 300 sentiment analyses/month
├─ Unlimited review storage
├─ CSV import (bulk processing)
├─ Advanced brand voice learning
├─ 1 Google Business integration
└─ Email support
   → Goal: Small businesses, single locations
   → Target: 15-30 reviews needing responses/month
   → Margin: 91% ($26.33 profit per user)

GROWTH - $79/month
├─ 200 credits/month (~100 final responses)
├─ 1,000 sentiment analyses/month
├─ Unlimited review storage
├─ 3 platform integrations (Google, Shopify, CSV)
├─ Team collaboration (3 users)
├─ Priority support
├─ Custom tone profiles (multiple brand voices)
└─ Advanced analytics dashboard
   → Goal: Multi-location businesses, medium e-commerce
   → Target: 50-100 reviews needing responses/month
   → Margin: 88% ($69.50 profit per user)

NO ENTERPRISE TIER FOR MVP
├─ Reason: Lacks necessary features (SSO, white-label, SLA, dedicated support)
├─ When: Add after product-market fit (Month 7-12)
└─ Pricing: $299-499/month when ready
```

### Key Pricing Principles
1. **Unlimited review storage** (all tiers) → Storage is cheap, AI is valuable
2. **Credits = AI responses only** → Align revenue with actual costs
3. **Sentiment has separate quota** → DeepSeek is 10x cheaper, 5x multiplier (Free: 35, Starter: 150, Growth: 500)
4. **Queue carry-forward** → Unused sentiment quota doesn't expire (creates upgrade pressure)
5. **Launch simple, iterate based on data** → Validate assumptions with real usage

---

## Success Metrics

### Product Metrics (Week 4 - MVP Launch)
- ✅ **5 beta users** actively using the platform
- ✅ **100+ reviews processed** successfully
- ✅ **<5 second response time** for AI generation
- ✅ **85%+ brand voice match** (user rating)
- ✅ **40+ languages** supported automatically
- ✅ **<$0.015 cost** per AI response (including sentiment)

### Business Metrics (Month 6)
- 🎯 **100 total users** (free + paid)
- 🎯 **30 paying customers** (20 Starter, 10 Growth)
- 🎯 **$10K MRR** (Monthly Recurring Revenue milestone)
- 🎯 **40% free-to-paid conversion** within 60 days
- 🎯 **<5% monthly churn** rate

### User Value Metrics (Ongoing)
- 📊 **10+ hours/week saved** per paying customer (verified via survey)
- 📊 **2.0 average credits** per final published response (validate assumption)
- 📊 **80%+ of AI suggestions** used without major edits
- 📊 **60-70% of Free users** hit 15-credit limit monthly (upgrade pressure)

### Quality Metrics (Always Monitor)
- 📊 **95%+ uptime** (AI API availability)
- 📊 **<$0.01 cost** per AI response (Claude API)
- 📊 **<$0.001 cost** per sentiment analysis (DeepSeek API)
- 📊 **4.5+ star rating** when launched on Shopify App Store

---

## Go-to-Market Strategy

### Phase 1: Product Hunt Launch (Week 4)
- Launch on Product Hunt with working MVP
- Target: 500+ upvotes, 50 signups (30 Free, 20 Starter trial)
- Messaging: "Save 10 hours/week responding to reviews with AI"
- Free tier drives volume, conversion focus

### Phase 2: Content Marketing (Month 2-6)
- **SEO content:**
  - "How to respond to negative reviews" (high-volume keyword)
  - "Customer review response templates" (lead magnet)
  - "Restaurant review management guide" (vertical content)
- **Free resources:**
  - 50 review response templates (PDF download)
  - Review response quality scorecard
  - Brand voice worksheet
- **Target:** 1,000 organic visitors/month by Month 3

### Phase 3: Shopify App Store (Month 2)
- Submit app to Shopify App Store
- Partner with Judge.me (review app integration)
- Target: 100 installs in first month
- Leverage Shopify's built-in discovery (8M+ merchants)

### Phase 4: Partnership (Month 4+)
- Partner with e-commerce agencies (20% affiliate commission)
- Partner with review platforms (Trustpilot, Judge.me integration)
- Cross-promote with complementary tools (email marketing, CRM)

### Distribution Channels (Priority Order)
1. **Product Hunt** → Initial traction, press coverage
2. **Organic SEO** → Sustainable long-term traffic
3. **Shopify App Store** → Built-in discovery for e-commerce
4. **Partnerships** → Leveraged distribution
5. **Paid ads** → Only after proven unit economics (Month 6+)

---

## Technical Architecture (High-Level)

### Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **AI - Response Generation:** Anthropic Claude 3.5 Sonnet API
- **AI - Sentiment Analysis:** DeepSeek API (cost-effective)
- **Auth:** NextAuth.js (email/password + Google OAuth)
- **Payments:** Stripe (subscriptions)
- **Hosting:** Vercel (frontend + API routes)
- **Email:** Resend (transactional emails)
- **Monitoring:** Sentry (errors) + Vercel Analytics (performance)

### Key Technical Decisions
1. **Monorepo:** All code in one Next.js project (simpler for solo development)
2. **No vector DB initially:** Store brand voice as structured data, add Pinecone later if needed
3. **Aggressive API caching:** Cache similar review-response pairs (reduce costs 30-40%)
4. **Rate limiting:** Per-user rate limits (prevent abuse, manage API costs)
5. **Two-AI approach:** Claude for quality responses, DeepSeek for scale sentiment
6. **GDPR-first:** Built-in consent, data export, right to deletion from day 1

### Data Flow (Simplified)
```
User Input → Review stored → AI generates response → Credits deducted
         ↓
Sentiment analysis (DeepSeek) → Store sentiment → Update dashboard
         ↓
User edits/publishes → Track final response → Update metrics
```

### Infrastructure Costs (Monthly Estimate)
- Vercel hosting: $20/month (Pro plan)
- Supabase database: $25/month (Pro plan)
- Claude API: ~$150-200/month (assuming 30 users, 1,500 responses)
- DeepSeek API: ~$10-15/month (assuming 6,000 sentiment analyses)
- Stripe fees: 2.9% + $0.30 per transaction
- Email (Resend): $20/month
- Monitoring (Sentry): Free tier
- **Total: ~$225-280/month operating costs**

---

## Scope Control: Explicit Non-Goals for MVP

### ❌ NOT Building in Phase 1 (Week 1-4)
- Sentiment analysis dashboard (basic sentiment only, no trends yet)
- Review request campaigns (different product, email automation)
- Review monitoring/alerts (manual checking only)
- Mobile app (web-first, mobile-responsive only)
- Slack/email notifications (manual checking only)
- Custom AI model fine-tuning (use Claude as-is)
- Multi-workspace/agency features (single business per account)
- Advanced permissions/roles (admin/user roles deferred)
- Automated response posting (requires trust, one-click only)
- A/B testing different response styles (need data first)

### ⚠️ Deferred to Phase 2+ (Month 2-6)
- Shopify native integration (after Google Business proves concept)
- Facebook integration (after Shopify works)
- Trustpilot native API (CSV import handles this for now)
- Amazon Seller Central API (CSV import sufficient)
- Approval workflows (team collaboration feature)
- Response templates library (users can save their own)
- Advanced analytics (sentiment trends, NPS tracking)
- White-label/reseller features (need PMF first)

### 🚫 Will Never Build (Wrong Product)
- Review generation/solicitation (we respond, not request)
- Email marketing campaigns (different tool)
- Customer support ticketing (different category)
- Social media management (too broad)
- Review widget/display (different product)

---

## Risks & Mitigations

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Claude API costs exceed projections | Medium | High | Aggressive caching (30-40% savings), rate limiting per user, DeepSeek for sentiment |
| Claude API downtime | Low | High | Retry logic, exponential backoff, fallback to manual editing, status page |
| Google API changes/breaks | Medium | Medium | Versioned API calls, monitor deprecation notices, CSV fallback |
| Credit tracking inaccuracy | Low | Critical | Atomic database transactions, real-time balance checks, audit logs |
| GDPR compliance gaps | Medium | Critical | Legal review (Month 2), use Supabase (GDPR-compliant), data export on day 1 |
| Sentiment API quality insufficient | Medium | Medium | Test multiple services, allow manual override, use as "suggestion" not fact |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Free-to-paid conversion <20% | High | Critical | Optimize onboarding, demonstrate value fast, time-limited trials |
| Grammarly/Jasper add review features | Medium | High | Move fast, build brand voice moat, focus on integrations |
| Users don't trust AI responses | Medium | High | Human-in-the-loop always, show confidence scores, allow full editing |
| Shopify app rejection | Medium | Medium | Follow guidelines strictly, submit early for feedback, have backup plan |
| 2.0 credits assumption wrong | High | High | Track actual usage first 30 days, adjust pricing by Month 2 if needed |
| Churn higher than expected | Medium | High | Build engagement features, track NPS weekly, respond to feedback fast |

### Market Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Market too small | Low | Critical | Validated $500M+ market, SMB segment underserved |
| Competitors react aggressively | Medium | Medium | First-mover advantage, superior UX, build switching costs |
| AI quality insufficient | Low | Critical | Claude 3.5 Sonnet is best-in-class, human editing fallback always |
| Credit system confuses users | Medium | Medium | Clear UI, examples on pricing page, interactive calculator |

---

## Timeline & Milestones

### Week 1-2: MVP Development (Phase 1)
- [ ] Authentication system (email + OAuth)
- [ ] Manual review input form
- [ ] AI response generation working (Claude API)
- [ ] Brand voice customization UI
- [ ] Response editor with regeneration
- [ ] Multi-language detection + generation
- [ ] Credit tracking system
- [ ] Sentiment analysis (DeepSeek API)
- [ ] Basic dashboard (credits, recent reviews)
- [ ] 5 beta users onboarded

### Week 3: CSV Import (Phase 2)
- [ ] CSV upload functionality
- [ ] Format auto-detection (Amazon, Google, Trustpilot)
- [ ] Bulk processing (100+ reviews)
- [ ] Export responses as CSV
- [ ] Test with real user data

### Week 4: Google Business Integration (Phase 3)
- [ ] OAuth flow with Google Business Profile API
- [ ] Review sync (pull new reviews daily)
- [ ] One-click response posting (push to Google)
- [ ] Error handling for API failures
- [ ] Product Hunt launch

### Month 2: Polish & Shopify Integration
- [ ] Shopify app submitted to App Store
- [ ] Judge.me partnership established
- [ ] Stripe payment integration complete
- [ ] 10 paying customers acquired
- [ ] $300-500 MRR

### Month 3-6: Scale & Optimize
- [ ] 30 paying customers
- [ ] $1,500-2,000 MRR (Month 3)
- [ ] $5,000-7,000 MRR (Month 5)
- [ ] $10,000+ MRR (Month 6) ⭐
- [ ] Content marketing generating 500+ organic visits/month
- [ ] Product-market fit validated (NPS >30, <5% churn)

---

## Decision Log (Critical Business Choices)

### Key Decisions Made
1. **Decision:** Credit-based pricing (not review-based)
   - **Rationale:** Aligns revenue with costs (Claude API), prevents abuse, clear value metric
   - **Date:** January 5, 2026
   - **Document:** See `decisions/001_pricing_model.md`

2. **Decision:** No Enterprise tier for MVP
   - **Rationale:** Lacks necessary features (SSO, white-label, SLA), premature for 0-customer product
   - **Date:** January 5, 2026
   - **Alternative:** Add in Month 7-12 after PMF

3. **Decision:** DeepSeek for sentiment analysis (not Claude)
   - **Rationale:** 10x cheaper ($0.001 vs $0.01), sufficient accuracy for sentiment tagging
   - **Date:** January 5, 2026
   - **Document:** See `decisions/003_sentiment_api_choice.md`

4. **Decision:** 2.0 credits per response assumption
   - **Rationale:** Based on estimated user behavior (50% use as-is, 30% regenerate once, 20% multiple edits)
   - **Date:** January 5, 2026
   - **Risk:** Must validate with real data in first 30 days
   - **Document:** See `decisions/002_credit_consumption.md`

5. **Decision:** Start with manual input, add integrations incrementally
   - **Rationale:** Faster MVP validation, CSV handles most platforms, APIs added based on demand
   - **Date:** January 5, 2026

6. **Decision:** Freemium (not free trial)
   - **Rationale:** Lower friction, builds user base, proven SaaS model, sticky product
   - **Date:** January 5, 2026

7. **Decision:** Next.js monorepo (not microservices)
   - **Rationale:** Simpler for solo development, faster iteration, sufficient for 100-1000 users
   - **Date:** January 5, 2026

8. **Decision:** 3 tiers only (Free, Starter, Growth)
   - **Rationale:** Simple choice, clear upgrade path, covers 95% of target market
   - **Date:** January 5, 2026
   - **Document:** See `decisions/004_tier_structure.md`

---

## Team & Resources

### Solo Founder (Vibe Coding with AI)
- **Developer/PM:** Prajeen
- **AI Assistant:** Claude Code (for code generation + documentation)
- **Time Commitment:** 40-50 hours/week for 4 weeks
- **Budget:** $5,000-7,000 (API costs, hosting, tools)

### Tools & Services
- GitHub (version control) - Free
- Vercel (hosting) - $20/month
- Supabase (database) - $25/month
- Claude API (AI responses) - ~$150-200/month
- DeepSeek API (sentiment) - ~$10-15/month
- Stripe (payments) - 2.9% + $0.30 per transaction
- Resend (email) - $20/month
- **Total: ~$225-280/month**

### Development Approach
- **Vibe coding:** AI-assisted development (Claude generates 70-80% of code)
- **Phase-based:** Complete Phase 1 before Phase 2 (no parallel development)
- **Documentation-driven:** Write specs before code (these 9 Phase 0 docs)
- **User-first:** 5 beta users testing from Week 2 onwards

---

## North Star Metric

**Primary Metric:** Hours saved per customer per week

**Why this matters:**
- Directly measures value delivered
- Easy to calculate: `(Reviews responded × 5 minutes each) ÷ 60`
- Drives retention and word-of-mouth
- Justifies pricing (10 hours saved × $20/hour = $200 value vs $29 price)

**Target:** 10+ hours saved per week per paying customer

**How we measure:**
- User survey at Day 30: "How much time do you spend on reviews now vs before?"
- Track in-app: Reviews processed per week × estimated time saved
- NPS question: "How likely to recommend?" (correlates with time saved)

---

## Definition of Success (6 Months)

### Minimum Success (Acceptable)
- ✅ 50 total users (free + paid)
- ✅ 15 paying customers (10 Starter, 5 Growth)
- ✅ $500 MRR
- ✅ Product works reliably (>95% uptime)
- ✅ Users save 5+ hours/week

### Expected Success (Target)
- ✅ 150 total users
- ✅ 50 paying customers (35 Starter, 15 Growth)
- ✅ $2,000-3,000 MRR
- ✅ 4.0+ star reviews
- ✅ Users save 10+ hours/week
- ✅ <10% monthly churn

### Exceptional Success (Stretch Goal)
- ✅ 300+ total users
- ✅ 100+ paying customers
- ✅ $5,000-10,000 MRR
- ✅ Shopify Featured App status
- ✅ Inbound partnership requests
- ✅ Profitable (revenue > costs + $2K/mo salary)

---

## Appendix: User Personas

### Persona 1: "Sarah - E-Commerce Manager"
- **Company:** Mid-size Shopify store ($1-2M ARR, 15 employees)
- **Role:** Marketing Manager
- **Reviews:** 80-120/month across Google, Shopify, Facebook
- **Current process:** Spends 6-8 hours/week manually responding, inconsistent tone
- **Pain:** Language barriers (gets Spanish/French reviews), slow response time hurts SEO
- **Budget:** $50-100/month for solution
- **Tier fit:** Starter ($29) → Growth ($79) as business scales
- **Success metric:** Cut response time to <1 hour/week, consistent brand voice

### Persona 2: "Mike - Multi-Location Restaurant Owner"
- **Company:** 3 restaurant locations (local chain)
- **Role:** Owner/Operator
- **Reviews:** 150-200/month total on Google Business
- **Current process:** Each location manager responds differently, many ignored
- **Pain:** Brand voice inconsistency, negative reviews not addressed fast enough
- **Budget:** $100-200/month for solution
- **Tier fit:** Growth ($79) for 3 locations, team collaboration
- **Success metric:** Consistent responses across all locations, <24hr response time

### Persona 3: "Jennifer - Boutique Hotel Manager"
- **Company:** Single boutique hotel (25 rooms)
- **Role:** General Manager
- **Reviews:** 30-50/month on Google, TripAdvisor, Booking.com
- **Current process:** Responds manually to all reviews, time-consuming but important
- **Pain:** Multilingual guests (English, Spanish, French, German), response takes 20+ min each
- **Budget:** $30-50/month
- **Tier fit:** Starter ($29) perfect fit
- **Success metric:** Native-quality responses in all languages, 5 min per response

---

**Document Status:** ✅ APPROVED - Ready for Development  
**Next Document:** 02_PRD_MVP_PHASE1.md (Product Requirements Document)

**Key Takeaways for Development:**
1. Credit system is core (not review limits)
2. Sentiment analysis is separate quota (DeepSeek API)
3. Three tiers only (no Enterprise until PMF)
4. 2.0 credits per response assumption (MUST validate)
5. Unlimited review storage on all plans
6. Manual input → CSV → Google → Shopify (phased rollout)


