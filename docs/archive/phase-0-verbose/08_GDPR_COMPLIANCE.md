# GDPR Compliance: ReviewFlow MVP Phase 1
## Data Protection & Privacy Implementation Guide

**Version:** 1.0  
**Last Updated:** January 6, 2026  
**Status:** Ready for Development  
**Regulation:** EU General Data Protection Regulation (GDPR)

---

## Document Purpose

This document ensures ReviewFlow complies with GDPR requirements for user data protection throughout the entire user lifecycle. Use this as:
- **Legal compliance reference** for GDPR Articles 5, 6, 15, 16, 17, 21 (core requirements)
- **Active user data processing guide** for lawful, transparent data handling
- **Implementation guide** for data anonymization on user deletion
- **Audit documentation** for data retention policies
- **Developer guide** for handling user rights (access, rectification, erasure, objection)
- **Privacy policy template** for public-facing disclosures

---

## Table of Contents

1. [GDPR Requirements Overview](#gdpr-requirements-overview)
2. [Active User Data Processing](#active-user-data-processing)
3. [Data Classification](#data-classification)
4. [User Rights Implementation](#user-rights-implementation)
5. [Anonymization Strategy](#anonymization-strategy)
6. [Data Retention Policies](#data-retention-policies)
7. [Implementation Guide](#implementation-guide)
8. [Testing & Validation](#testing--validation)
9. [Compliance Checklist](#compliance-checklist)

---

## GDPR Requirements Overview

### Key GDPR Articles Affecting ReviewFlow

**Article 5: Principles of Processing (Foundation)**
- Lawfulness, fairness, transparency
- Data minimization: Collect only what's necessary
- Purpose limitation: Use data only for stated purpose
- Storage limitation: Don't keep data longer than necessary
- Accuracy: Keep data up to date
- Integrity & confidentiality: Protect from unauthorized access

**Article 6: Legal Basis for Processing (Required)**
- Must have lawful basis to process personal data
- Common bases: Contract, Consent, Legitimate Interest
- Can't process data without legal justification

**Article 15: Right of Access**
- Users can request copy of their data
- Must provide in portable format (CSV, JSON)
- Must respond within 30 days

**Article 16: Right to Rectification**
- Users can correct inaccurate data
- Must update or erase on request

**Article 17: Right to Erasure ("Right to be Forgotten")**
- Users can request deletion of their personal data
- Must comply within 30 days
- Exceptions: Legal obligations, accounting requirements

**Article 21: Right to Object**
- Users can object to processing based on legitimate interest
- Must stop processing unless compelling grounds

**Article 25: Data Protection by Design**
- Privacy built into system architecture
- Default settings protect privacy

---

## Active User Data Processing

### Overview

This section covers GDPR compliance for **active users** (users who have accounts and are using ReviewFlow). While later sections focus on user deletion, GDPR also imposes strict requirements on how we process data while users are actively using the service.

**Key Principle:** GDPR doesn't just apply when users delete their accounts. It applies to **every moment** we're storing, processing, or sharing their data.

---

### Article 5: Core Processing Principles

#### 1. Lawfulness, Fairness, and Transparency

**We must have a legal basis for processing personal data.**

ReviewFlow's legal bases:

```typescript
// Legal bases for data processing in ReviewFlow

1. CONTRACT (Article 6(1)(b))
   Purpose: "Processing necessary to perform contract with user"
   Examples:
   - Store email to create and manage account
   - Store reviews to generate AI responses
   - Store responses to display in dashboard
   - Track credits to enforce usage limits
   
   Legal note: This is the SERVICE the user signed up for

2. LEGITIMATE INTEREST (Article 6(1)(f))
   Purpose: "Processing necessary for our legitimate interests"
   Examples:
   - Fraud detection (prevent credit abuse)
   - Security (protect accounts from unauthorized access)
   - Product analytics (improve AI response quality)
   
   Legal note: Must balance against user privacy rights

3. CONSENT (Article 6(1)(a))
   Purpose: "User explicitly agrees to processing"
   Examples:
   - Marketing emails (opt-in checkbox)
   - Optional analytics cookies (cookie banner)
   - Optional AI training (if we use reviews to improve models)
   
   Legal note: Must be freely given, specific, informed, unambiguous
```

**Implementation:**

```typescript
// Example: Check legal basis before processing
async function storeReview(userId: string, reviewText: string) {
  // Legal basis: CONTRACT
  // User signed up for review response service
  // Storing review is necessary to provide that service
  
  await prisma.review.create({
    data: {
      userId,
      reviewText,
      // This is lawful processing ✓
    }
  });
}

// Example: Require consent for optional processing
async function enableMarketingEmails(userId: string, hasConsent: boolean) {
  if (!hasConsent) {
    // Cannot send marketing without explicit consent
    throw new Error('Marketing requires user consent');
  }
  
  // Legal basis: CONSENT
  await prisma.user.update({
    where: { id: userId },
    data: { marketingOptIn: true }
  });
}
```

#### 2. Purpose Limitation

**Can only use data for the purpose we collected it.**

```typescript
// ✅ ALLOWED uses of user email:

async function sendLoginLink(email: string) {
  // ✓ Account management (original purpose)
  await sendEmail(email, 'Login to ReviewFlow', loginLink);
}

async function sendPasswordReset(email: string) {
  // ✓ Account security (related to original purpose)
  await sendEmail(email, 'Reset Your Password', resetLink);
}

async function sendCreditLimitNotification(email: string) {
  // ✓ Service notifications (related to core service)
  await sendEmail(email, 'Low Credit Balance', notification);
}

// ❌ NOT ALLOWED uses of user email:

async function sellEmailToAdvertisers(email: string) {
  // ✗ NOT the purpose we collected it for
  // ✗ Would require explicit consent
  await thirdPartyAPI.sell(email); // GDPR VIOLATION
}

async function sendUnrelatedMarketing(email: string) {
  // ✗ Marketing is different purpose
  // ✗ Requires separate opt-in consent
  await sendEmail(email, 'Buy our other product!', ad); // VIOLATION
}
```

**Privacy Policy Must State:**
```markdown
## How We Use Your Email:
- Create and manage your account ✓
- Send login links and password resets ✓
- Notify you about your credit balance ✓
- Send service updates (new features, downtime) ✓

## We DO NOT:
- Sell your email to third parties ✗
- Send marketing emails without consent ✗
- Share with advertisers ✗
```

#### 3. Data Minimization

**Only collect what's actually necessary for the service.**

```typescript
// ReviewFlow data collection audit

interface UserData {
  // ✅ NECESSARY (cannot provide service without)
  email: string;           // Login, account management
  password: string;        // Security
  
  // ✅ NECESSARY (for core features)
  reviews: Review[];       // Generate responses (core service)
  responses: Response[];   // Display in dashboard (core service)
  credits: number;         // Enforce usage limits (core service)
  
  // ✅ REASONABLE (improves service quality)
  brandVoice: BrandVoice; // Personalized responses
  
  // ⚠️ OPTIONAL (user choice)
  name?: string;           // Personalization (optional)
  profilePhoto?: string;   // Visual personalization (optional)
  
  // ❌ NOT NECESSARY (should NOT collect)
  dateOfBirth?: Date;      // Not needed for review responses
  phoneNumber?: string;    // Not needed for MVP
  physicalAddress?: string; // Not needed at all
  socialSecurityNumber?: string; // NEVER collect this!
}
```

**Examples of Over-Collection to Avoid:**

```typescript
// ❌ BAD: Collecting unnecessary data
interface RegistrationForm {
  email: string;
  password: string;
  firstName: string;      // ⚠️ Do we need this? Just "name" is enough
  lastName: string;       // ⚠️ Do we need this?
  phoneNumber: string;    // ❌ Not needed for MVP
  dateOfBirth: Date;      // ❌ Not needed
  gender: string;         // ❌ Not needed
  address: string;        // ❌ Not needed
  occupation: string;     // ❌ Not needed
}

// ✅ GOOD: Minimal necessary data
interface RegistrationForm {
  email: string;          // ✓ Required for login
  password: string;       // ✓ Required for security
  name?: string;          // ✓ Optional, improves UX
}
```

#### 4. Accuracy

**Keep data accurate and provide way to correct it.**

```typescript
// Implementation: User settings page

// User can update their information
async function updateUserProfile(userId: string, updates: {
  email?: string;
  name?: string;
}) {
  // Validate email format
  if (updates.email && !isValidEmail(updates.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updates
  });
}

// User can edit reviews they added
async function updateReview(reviewId: string, userId: string, newText: string) {
  // Verify ownership
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });
  
  if (!review) {
    throw new UnauthorizedError();
  }
  
  await prisma.review.update({
    where: { id: reviewId },
    data: { reviewText: newText }
  });
}
```

**UI Requirements:**
- Settings page with editable fields
- "Edit" buttons on reviews
- Clear error messages for invalid input
- Confirmation when data updated

#### 5. Storage Limitation

**Don't keep data longer than necessary.**

```typescript
// Data retention rules for ReviewFlow

// ✅ KEEP WHILE ACTIVE:
- User account data → As long as account exists
- Reviews → As long as user wants them
- Responses → As long as user wants them
- Active sessions → Until logout or expiry (30 days)

// ✅ DELETE WHEN NO LONGER NEEDED:
- Expired sessions → Delete immediately after expiry
- Password reset tokens → Delete after use or 1 hour
- Email verification tokens → Delete after verification or 24 hours
- Old session tokens → Delete after 30 days

// ✅ RETAIN FOR LEGAL REASONS:
- Credit usage logs → 7 years (tax law requirement)
- Anonymized after user deletion → 7 years
```

**Implementation:**

```typescript
// Cron job: Clean up expired sessions daily
async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      expires: { lt: new Date() }
    }
  });
  
  console.log(`Deleted ${result.count} expired sessions`);
}

// Cron job: Clean up expired tokens
async function cleanupExpiredTokens() {
  await prisma.verificationToken.deleteMany({
    where: {
      expires: { lt: new Date() }
    }
  });
}

// Schedule: Run daily at 2 AM UTC
cron.schedule('0 2 * * *', async () => {
  await cleanupExpiredSessions();
  await cleanupExpiredTokens();
});
```

#### 6. Integrity & Confidentiality (Security)

**Protect data from unauthorized access, loss, or damage.**

```typescript
// Security measures for ReviewFlow

// 1. ENCRYPTION
class SecurityConfig {
  // Passwords: Never store plain text
  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10); // Industry standard
  }
  
  // Data in transit: HTTPS only
  static enforceHTTPS(req, res, next) {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  }
  
  // Database: Encrypted at rest (Supabase default)
  // Connection string includes encryption params
}

// 2. ACCESS CONTROL
async function getReview(reviewId: string, requesterId: string) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: requesterId  // CRITICAL: Ensure user owns this
    }
  });
  
  if (!review) {
    throw new UnauthorizedError('Review not found or access denied');
  }
  
  return review;
}

// 3. SESSION SECURITY
const sessionConfig = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET, // Strong random secret
  cookie: {
    httpOnly: true,      // Prevent XSS attacks
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

// 4. LOGGING & MONITORING
async function logSecurityEvent(event: {
  userId?: string;
  action: string;
  ipAddress: string;
  success: boolean;
}) {
  await prisma.securityLog.create({
    data: {
      ...event,
      timestamp: new Date()
    }
  });
  
  // Alert on suspicious patterns
  if (event.action === 'LOGIN_FAILED') {
    await checkForBruteForce(event.ipAddress);
  }
}
```

---

### User Rights for Active Users

#### Right of Access (Article 15)

**Users can request copy of their data at any time.**

```typescript
// Export user data in machine-readable format
app.get('/api/user/export', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  const userData = await exportUserData(userId);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="reviewflow-data.json"'
  );
  
  res.json(userData);
});

// UI: Settings page with "Export My Data" button
<Button onClick={handleExport}>
  Export My Data (JSON)
</Button>
```

**Response Time:** Within 30 days (typically instant)

#### Right to Rectification (Article 16)

**Users can correct inaccurate data.**

```typescript
// Settings page: Editable fields
<Form>
  <Input
    label="Email"
    value={user.email}
    onChange={updateEmail}
  />
  <Input
    label="Name"
    value={user.name}
    onChange={updateName}
  />
  <Button type="submit">Save Changes</Button>
</Form>

// Review editing
<ReviewCard>
  <Text>{review.text}</Text>
  <Button onClick={() => setEditMode(true)}>
    Edit Review
  </Button>
</ReviewCard>
```

#### Right to Object (Article 21)

**Users can object to certain types of processing.**

```typescript
// Example: User can opt out of analytics
<Settings>
  <Checkbox
    checked={user.analyticsOptOut}
    onChange={toggleAnalytics}
  >
    Opt out of product analytics
  </Checkbox>
</Settings>

// Implementation
async function recordAnalyticsEvent(userId: string, event: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { analyticsOptOut: true }
  });
  
  if (user?.analyticsOptOut) {
    // User objected to analytics - don't record
    return;
  }
  
  // Record analytics event
  await analytics.track(userId, event);
}
```

---

### Transparency Requirements

#### Privacy Policy (Required)

**Must disclose all data processing activities.**

```markdown
# ReviewFlow Privacy Policy

Last updated: January 6, 2026

## 1. What Data We Collect

### Personal Information:
- **Email address** - Required to create and manage your account
- **Name** - Optional, for personalization
- **Password** - Stored securely (hashed with bcrypt)

### Content You Create:
- **Reviews** - Text of reviews you add to ReviewFlow
- **AI Responses** - Generated or edited responses
- **Brand Voice** - Your tone preferences and writing guidelines

### Usage Information:
- **Credit Usage** - History of AI responses generated
- **Login Activity** - For security and fraud prevention
- **Session Data** - To keep you logged in

### Technical Information:
- **IP Address** - For security and fraud detection only
- **Browser Type** - For compatibility purposes
- **Cookies** - Session cookies (required), analytics cookies (optional)

## 2. How We Use Your Data

### To Provide the Service (Legal Basis: Contract):
- Generate AI responses to your reviews
- Store your content in your dashboard
- Manage your credit balance and subscription
- Send service-related emails (login links, password resets)

### To Improve the Service (Legal Basis: Legitimate Interest):
- Analyze usage patterns (anonymized)
- Detect and prevent fraud
- Improve AI response quality
- Fix bugs and technical issues

### With Your Consent (Legal Basis: Consent):
- Send marketing emails (opt-in required)
- Use analytics cookies (cookie banner required)
- Use your reviews to train AI models (explicit opt-in required)

## 3. Who We Share Your Data With

### Service Providers:
We share data with trusted third parties who help us provide the service:

**Anthropic (Claude API)**
- Purpose: Generate AI responses to your reviews
- Data shared: Review text only (not your email or name)
- Location: United States
- GDPR: Anthropic is GDPR-compliant ([Privacy Policy](https://anthropic.com/privacy))

**Supabase (Database Hosting)**
- Purpose: Store all application data
- Data shared: All data you create in ReviewFlow
- Location: European Union (AWS Frankfurt)
- GDPR: Supabase is GDPR-compliant ([Privacy Policy](https://supabase.com/privacy))

**DeepSeek (Sentiment Analysis)**
- Purpose: Analyze review sentiment
- Data shared: Review text only (not your email or name)
- Location: [Check location]
- GDPR: [Check compliance status]

**Stripe (Payment Processing)** [If applicable]
- Purpose: Process subscription payments
- Data shared: Email, payment information
- Location: United States (Privacy Shield certified)
- GDPR: Stripe is GDPR-compliant ([Privacy Policy](https://stripe.com/privacy))

### We DO NOT:
- ❌ Sell your data to advertisers
- ❌ Share your data for marketing purposes
- ❌ Use your reviews for AI training without explicit consent
- ❌ Share your email with third parties (except service providers above)

## 4. How Long We Keep Your Data

**While Your Account is Active:**
- All data retained to provide the service

**After You Delete Your Account:**
- Personal data deleted within 30 days
- Credit usage records retained 7 years (tax law requirement)
- Personal information in credit records anonymized (names, emails redacted)

**Automatic Deletion:**
- Expired sessions: Deleted after 30 days
- Password reset tokens: Deleted after 1 hour or use
- Email verification tokens: Deleted after 24 hours or use

## 5. Your Rights Under GDPR

You have the following rights:

### Right of Access:
Request a copy of your data
→ Settings > Export My Data (instant download)

### Right to Rectification:
Correct inaccurate information
→ Settings > Profile (edit your information)

### Right to Erasure:
Delete your account and personal data
→ Settings > Delete Account (completed within 30 days)

### Right to Data Portability:
Export your data in machine-readable format (JSON)
→ Settings > Export My Data

### Right to Object:
Object to certain types of processing
→ Contact privacy@reviewflow.com

### Right to Lodge a Complaint:
You can complain to your local Data Protection Authority
→ [List of EU DPAs](https://edpb.europa.eu/about-edpb/board/members_en)

## 6. Data Security

We protect your data with:
- Passwords hashed with bcrypt (never stored in plain text)
- HTTPS/TLS encryption for data in transit
- Database encryption at rest
- Session security (HTTP-only cookies, CSRF protection)
- Regular security audits
- Automatic logout after 30 days of inactivity

## 7. International Data Transfers

Your data may be transferred outside the EU:
- **Anthropic (US):** Standard Contractual Clauses in place
- **Supabase (EU):** Data stored in EU (Frankfurt region)

All transfers comply with GDPR Chapter V requirements.

## 8. Cookies

We use two types of cookies:

**Essential Cookies (Required):**
- Session cookies to keep you logged in
- Cannot be disabled (necessary for service)

**Analytics Cookies (Optional):**
- Track usage patterns to improve the service
- Can be disabled in cookie banner
- No tracking if you opt out

## 9. Children's Privacy

ReviewFlow is not intended for users under 16.
We do not knowingly collect data from children.

## 10. Changes to This Policy

We may update this policy and will notify you:
- Email notification for material changes
- Notification banner in the app
- Continued use after changes means acceptance

## 11. Contact Us

Questions about privacy?

- **Email:** privacy@reviewflow.com
- **Data Protection Officer:** dpo@reviewflow.com [If appointed]
- **Address:** [Company registered address]
- **EU Representative:** [If required for non-EU companies]

## 12. Legal Basis Summary

| Processing Activity | Legal Basis |
|---------------------|-------------|
| Account management | Contract |
| Generate AI responses | Contract |
| Store reviews/responses | Contract |
| Credit tracking | Contract + Legitimate Interest |
| Fraud prevention | Legitimate Interest |
| Security monitoring | Legitimate Interest |
| Product analytics | Legitimate Interest (with opt-out) |
| Marketing emails | Consent (opt-in required) |
| AI training on reviews | Consent (explicit opt-in required) |
```

#### Cookie Banner (Required if Using Analytics)

```typescript
// Example: Cookie consent banner
<CookieBanner>
  <Text>
    We use cookies to keep you logged in and improve our service.
  </Text>
  
  <ButtonGroup>
    <Button onClick={acceptAll}>
      Accept All Cookies
    </Button>
    
    <Button onClick={rejectOptional}>
      Essential Only
    </Button>
    
    <Button onClick={openCustomize}>
      Customize
    </Button>
  </ButtonGroup>
  
  <Link href="/privacy">Privacy Policy</Link>
  <Link href="/cookies">Cookie Policy</Link>
</CookieBanner>

// Implementation
function acceptAll() {
  setConsent({
    essential: true,    // Always true
    analytics: true,    // User consented
    marketing: true     // User consented
  });
}

function rejectOptional() {
  setConsent({
    essential: true,    // Always true
    analytics: false,   // User rejected
    marketing: false    // User rejected
  });
}
```

---

### Third-Party Data Sharing Compliance

#### Anthropic Claude API

```typescript
// Privacy considerations for Anthropic API

async function generateResponse(reviewText: string) {
  // Data shared: Review text ONLY
  // NOT shared: User email, name, account info
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [{
      role: "user",
      content: reviewText  // Only the review text
    }]
  });
  
  return response.content[0].text;
}

// Privacy policy must disclose:
// "We share your review text with Anthropic Claude API 
//  to generate responses. Anthropic processes data 
//  according to their privacy policy: [link]"
```

**Action Items:**
- [ ] Review Anthropic's Data Processing Agreement (DPA)
- [ ] Confirm Anthropic is GDPR-compliant
- [ ] Add Anthropic disclosure to privacy policy
- [ ] Document data minimization (only share review text)

#### DeepSeek Sentiment API

```typescript
// If using DeepSeek for sentiment analysis

async function analyzeSentiment(reviewText: string) {
  // Data shared: Review text ONLY
  // NOT shared: User email, name, account info
  
  const sentiment = await deepseek.analyze(reviewText);
  return sentiment; // "positive" | "neutral" | "negative"
}

// Privacy policy must disclose:
// "We analyze review sentiment using DeepSeek API 
//  to help you prioritize responses."
```

**Action Items:**
- [ ] Check if DeepSeek stores review text
- [ ] Review DeepSeek's privacy policy
- [ ] Confirm DeepSeek is GDPR-compliant or EU-based
- [ ] Add DeepSeek disclosure to privacy policy
- [ ] Consider EU-based alternative if not compliant

---

### What ReviewFlow Does Right ✅

**1. Data Minimization:**
- Only collect email, name (optional), reviews
- Don't collect phone, address, DOB, or other unnecessary data
- User can use service with minimal personal data

**2. Purpose Limitation:**
- Use reviews only for generating responses (stated purpose)
- Use email only for account management (stated purpose)
- Don't sell data or use for unrelated purposes

**3. Security:**
- Passwords hashed with bcrypt (industry standard)
- HTTPS encryption for all data in transit
- Authorization checks on all API endpoints
- Session cookies are HTTP-only and secure

**4. User Rights:**
- Export button for data portability ✓
- Settings page for data correction ✓
- Delete account button for erasure ✓
- All rights accessible within the app

**5. Storage Limitation:**
- Sessions expire after 30 days
- Tokens expire after use or time limit
- No indefinite data retention

### What Needs to Be Added ⚠️

**1. Privacy Policy (CRITICAL - Before Launch):**
- [ ] Create comprehensive privacy policy (template above)
- [ ] Link in footer on every page
- [ ] Link during signup ("By signing up, you agree to our Privacy Policy")
- [ ] Make easy to read (plain language, not legalese)

**2. Cookie Banner (If Using Analytics):**
- [ ] Implement cookie consent banner
- [ ] Default to "essential only" (opt-in for analytics)
- [ ] Store user preference
- [ ] Don't load analytics scripts until user consents

**3. Data Cleanup Automation:**
- [ ] Cron job to delete expired sessions (daily)
- [ ] Cron job to delete expired tokens (daily)
- [ ] Log cleanup results for audit

**4. Third-Party Compliance:**
- [ ] Verify Anthropic DPA and GDPR compliance
- [ ] Verify DeepSeek DPA and GDPR compliance (or switch provider)
- [ ] Document data flows to all third parties
- [ ] Add all third-party disclosures to privacy policy

**5. Consent Management:**
- [ ] Marketing email opt-in checkbox (unchecked by default)
- [ ] Analytics opt-out option in settings
- [ ] Clear consent before any optional data processing

**6. User Education:**
- [ ] "What data do we collect?" explainer on signup
- [ ] "Your privacy rights" page
- [ ] Help articles about data export, deletion

---

### Action Items for Phase 1 Launch

#### Must Have (Week 1-2):
1. ✅ **Privacy Policy page** (use template above)
   - Comprehensive, clear disclosures
   - Link in footer and signup flow
   - Last updated date

2. ✅ **Cookie Banner** (if using any analytics)
   - Appear on first visit
   - Essential vs optional cookies
   - Store user preference

3. ✅ **Automated Data Cleanup**
   - Daily cron job for expired sessions
   - Daily cron job for expired tokens
   - Logging for audit trail

4. ✅ **Third-Party Verification**
   - Confirm Anthropic GDPR compliance
   - Confirm DeepSeek GDPR compliance or find alternative
   - Document all data flows

#### Should Have (Week 3-4):
5. ✅ **Settings Privacy Section**
   - View what data we store
   - Export data button (already planned)
   - Delete account button (already planned)
   - Marketing email preference

6. ✅ **Consent Checkboxes**
   - Marketing email opt-in (signup form)
   - Analytics opt-out (settings)
   - All default to most privacy-protective option

#### Nice to Have (Post-Launch):
7. ⚠️ **Activity Log**
   - Show user their login history
   - Show their data export history
   - Show their API usage

8. ⚠️ **Data Retention Dashboard**
   - Show user what data we keep and why
   - Transparency about retention periods

9. ⚠️ **Privacy-First Marketing**
   - "We respect your privacy" messaging
   - Transparent about data practices
   - Build trust through openness

---

## Data Classification

### Personal Data (PII - Must Be Deleted/Anonymized)

**Directly Identifiable:**
- ✅ User email address
- ✅ User name
- ✅ Password hash
- ✅ Profile photo URL
- ✅ Customer names in reviews (e.g., "Sarah Johnson")
- ✅ Employee names in reviews (e.g., "Manager John")
- ✅ Phone numbers (in review text or responses)
- ✅ Email addresses (if mentioned in reviews)
- ✅ Physical addresses (in review text)

**Indirectly Identifiable:**
- ✅ IP addresses (if logged)
- ✅ Session tokens
- ✅ OAuth tokens

### Non-Personal Data (Can Be Retained)

**Business Data:**
- ✅ Review rating (1-5 stars)
- ✅ Review platform (Google, Amazon, etc.)
- ✅ Review sentiment (positive/neutral/negative)
- ✅ Review language
- ✅ Response tone
- ✅ Credit usage amount
- ✅ Timestamp
- ✅ Action type (GENERATE_RESPONSE, REGENERATE, REFUND)

**Why These Can Be Retained:**
- Cannot identify individuals
- Necessary for accounting/legal compliance
- Serve legitimate business interest
- Aggregated statistics

---

## User Rights Implementation

### Right to Erasure (Article 17)

**User Triggers:**
1. Account deletion request (settings page)
2. Email request to support@reviewflow.com
3. GDPR form submission

**System Response (Within 30 Days):**

```typescript
// Complete GDPR deletion workflow
async function handleGDPRDeletionRequest(userId: string) {
  // 1. Verify user identity (prevent malicious deletions)
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // 2. Check for active subscriptions
  if (user.tier !== 'FREE') {
    // Cancel subscription first
    await cancelSubscription(userId);
  }
  
  // 3. Process pending refunds (if any)
  await processPendingRefunds(userId);
  
  // 4. Delete identifiable data
  await prisma.$transaction(async (tx) => {
    // Delete reviews & responses (CASCADE)
    const deletedReviews = await tx.review.deleteMany({
      where: { userId }
    });
    
    console.log(`Deleted ${deletedReviews.count} reviews`);
    
    // Delete brand voice
    await tx.brandVoice.deleteMany({
      where: { userId }
    });
    
    // Delete sessions
    await tx.session.deleteMany({
      where: { userId }
    });
    
    // Delete OAuth accounts
    await tx.account.deleteMany({
      where: { userId }
    });
    
    // 5. Anonymize credit usage (preserve for accounting)
    const creditUsage = await tx.creditUsage.findMany({
      where: { userId }
    });
    
    for (const record of creditUsage) {
      if (record.details) {
        const details = JSON.parse(record.details);
        
        // Anonymize snapshots
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
    
    // 5b. Anonymize sentiment usage (preserve for accounting)
    const sentimentUsage = await tx.sentimentUsage.findMany({
      where: { userId }
    });
    
    console.log(`Anonymizing ${sentimentUsage.length} sentiment usage records`);
    
    for (const record of sentimentUsage) {
      if (record.details) {
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
    }
    
    // 6. Anonymize user account (keep for FK integrity)
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
  
  // 7. Log deletion for compliance audit
  await logGDPRDeletion({
    userId,
    requestDate: new Date(),
    completionDate: new Date(),
    method: 'AUTOMATED'
  });
  
  // 8. Send confirmation email (to original email before deletion)
  await sendEmail({
    to: user.email,
    subject: "Account Deletion Complete",
    body: "Your ReviewFlow account and all personal data have been deleted."
  });
}
```

### Right of Access (Article 15)

**User Requests Data Export:**

```typescript
// Generate data export for user
async function exportUserData(userId: string): Promise<Buffer> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviews: {
        include: {
          response: true
        }
      },
      brandVoice: true,
      creditUsage: true,
      sentimentUsage: true
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Package all data into JSON
  const exportData = {
    user: {
      email: user.email,
      name: user.name,
      tier: user.tier,
      credits: user.credits,
      sentimentQuota: user.sentimentQuota,
      sentimentUsed: user.sentimentUsed,
      createdAt: user.createdAt
    },
    reviews: user.reviews.map(review => ({
      platform: review.platform,
      reviewText: review.reviewText,
      rating: review.rating,
      sentiment: review.sentiment,
      createdAt: review.createdAt,
      response: review.response ? {
        responseText: review.response.responseText,
        isPublished: review.response.isPublished,
        createdAt: review.response.createdAt
      } : null
    })),
    brandVoice: user.brandVoice,
    creditUsage: user.creditUsage.map(usage => ({
      creditsUsed: usage.creditsUsed,
      action: usage.action,
      createdAt: usage.createdAt
    })),
    sentimentUsage: user.sentimentUsage.map(usage => ({
      sentiment: usage.sentiment,
      createdAt: usage.createdAt
    }))
  };
  
  // Convert to JSON file
  return Buffer.from(JSON.stringify(exportData, null, 2));
}

// Usage in API endpoint
app.get('/api/user/export', async (req, res) => {
  const userId = req.user.id;
  const data = await exportUserData(userId);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="reviewflow-data.json"');
  res.send(data);
});
```

---

## Anonymization Strategy

### Option 1: Simple Redaction with NER ⭐ **SELECTED**

**Why This Approach:**
- ✅ Balance of effectiveness and simplicity
- ✅ Fast processing (<1 second per record)
- ✅ Good accuracy (95%+ for English)
- ✅ No external API costs
- ✅ Preserves useful content for business operations

**Implementation:**

```typescript
// Main anonymization function
async function anonymizeText(text: string): Promise<string> {
  let anonymized = text;
  
  // 1. Redact names using NER
  const names = await detectNames(anonymized);
  for (const name of names) {
    anonymized = anonymized.replace(
      new RegExp(escapeRegex(name), 'gi'),
      '[NAME]'
    );
  }
  
  // 2. Redact phone numbers (regex patterns)
  anonymized = redactPhoneNumbers(anonymized);
  
  // 3. Redact emails (regex)
  anonymized = redactEmails(anonymized);
  
  // 4. Redact addresses (regex + NER)
  anonymized = redactAddresses(anonymized);
  
  // 5. Redact apartment/unit numbers
  anonymized = redactUnits(anonymized);
  
  return anonymized;
}

// Helper: Detect names using NER
async function detectNames(text: string): Promise<string[]> {
  // Using compromise library (lightweight NER for JavaScript)
  const nlp = require('compromise');
  const doc = nlp(text);
  
  const names: string[] = [];
  
  // Extract person names
  doc.people().forEach((person: any) => {
    names.push(person.text());
  });
  
  // Extract organization names (might include person names)
  doc.organizations().forEach((org: any) => {
    const orgName = org.text();
    // Only add if looks like person name (has common first name patterns)
    if (looksLikePersonName(orgName)) {
      names.push(orgName);
    }
  });
  
  return [...new Set(names)]; // Remove duplicates
}

// Helper: Check if text looks like person name
function looksLikePersonName(text: string): boolean {
  const commonFirstNames = [
    'john', 'sarah', 'michael', 'emma', 'david', 'lisa',
    // ... add more common names
  ];
  
  const words = text.toLowerCase().split(' ');
  return words.some(word => commonFirstNames.includes(word));
}

// Helper: Redact phone numbers
function redactPhoneNumbers(text: string): string {
  // Match various phone number formats
  const patterns = [
    // US format: (555) 123-4567 or 555-123-4567
    /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    // International format: +44 20 1234 5678
    /\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,4}/g,
    // Simple format: 5551234567
    /\b\d{10}\b/g
  ];
  
  let anonymized = text;
  for (const pattern of patterns) {
    anonymized = anonymized.replace(pattern, '[PHONE]');
  }
  
  return anonymized;
}

// Helper: Redact emails
function redactEmails(text: string): string {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.replace(emailPattern, '[EMAIL]');
}

// Helper: Redact addresses
function redactAddresses(text: string): string {
  const addressPatterns = [
    // Street addresses: 123 Main Street
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b/gi,
    // PO Box
    /P\.?O\.?\s*Box\s+\d+/gi
  ];
  
  let anonymized = text;
  for (const pattern of addressPatterns) {
    anonymized = anonymized.replace(pattern, '[ADDRESS]');
  }
  
  return anonymized;
}

// Helper: Redact apartment/unit numbers
function redactUnits(text: string): string {
  const unitPattern = /(?:apartment|apt|unit|suite|ste|#)\s*#?\s*\d+[a-z]?/gi;
  return text.replace(unitPattern, '[UNIT]');
}

// Helper: Escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

**NPM Dependencies:**

```json
{
  "dependencies": {
    "compromise": "^14.9.0"  // Lightweight NER for JavaScript
  }
}
```

---

## Data Retention Policies

### Active Users

**While Account Active:**
- All data retained for service functionality
- No automatic deletion
- User controls their data

### Deleted Users

**After GDPR Deletion:**
- Personal data: Immediately anonymized
- Credit usage records: Retained for 7 years (accounting requirement)
- Anonymized data: Shows [NAME], [EMAIL], [PHONE] instead of actual values
- Non-PII preserved: ratings, platforms, sentiments, timestamps

**Legal Justification:**
```
Article 17(3)(b): Compliance with legal obligation
Article 17(3)(e): Establishment, exercise or defense of legal claims

Credit usage records retained for:
- Tax compliance (7 years)
- Financial auditing
- Fraud detection
- Dispute resolution
```

### Backup Retention

**Database Backups:**
- Daily backups retained: 30 days
- After GDPR deletion: User data in backups becomes stale
- Backup restoration: Would trigger re-anonymization
- No active recovery of deleted user data

---

## Implementation Guide

### Phase 1: Basic GDPR Compliance (MVP)

**Week 1-2: Core Implementation**

```typescript
// 1. Add account deletion button in settings
// File: components/settings/AccountSettings.tsx

export function AccountSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  return (
    <div>
      <h2>Danger Zone</h2>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="bg-red-600 text-white"
      >
        Delete Account
      </button>
      
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

// 2. Create deletion API endpoint
// File: pages/api/user/delete.ts

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await handleGDPRDeletionRequest(session.user.id);
    
    // Destroy session
    await destroySession(req, res);
    
    return res.status(200).json({ 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('GDPR deletion error:', error);
    return res.status(500).json({ 
      error: 'Deletion failed. Please contact support.' 
    });
  }
}

// 3. Install NER library
npm install compromise

// 4. Add anonymization module
// File: lib/gdpr/anonymize.ts
// (Copy anonymizeText function from above)

// 5. Add GDPR deletion function
// File: lib/gdpr/delete-user.ts
// (Copy handleGDPRDeletionRequest from above)

// 6. Add compliance logging
// File: lib/gdpr/audit-log.ts

async function logGDPRDeletion(data: {
  userId: string;
  requestDate: Date;
  completionDate: Date;
  method: 'AUTOMATED' | 'MANUAL';
}) {
  await prisma.gdprAuditLog.create({
    data: {
      ...data,
      action: 'USER_DELETION'
    }
  });
}
```

**Week 3: Data Export**

```typescript
// File: pages/api/user/export.ts

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const data = await exportUserData(session.user.id);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 
      'attachment; filename="reviewflow-data.json"'
    );
    res.send(data);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Export failed' });
  }
}
```

---

## Testing & Validation

### Anonymization Tests

```typescript
// tests/gdpr/anonymization.test.ts

describe('GDPR Anonymization', () => {
  describe('Name Redaction', () => {
    it('should redact single names', async () => {
      const input = "John was very helpful";
      const output = await anonymizeText(input);
      expect(output).toBe("[NAME] was very helpful");
    });
    
    it('should redact full names', async () => {
      const input = "Sarah Johnson helped me";
      const output = await anonymizeText(input);
      expect(output).toBe("[NAME] helped me");
    });
    
    it('should redact multiple names', async () => {
      const input = "John and Sarah were great";
      const output = await anonymizeText(input);
      expect(output).toBe("[NAME] and [NAME] were great");
    });
  });
  
  describe('Phone Redaction', () => {
    it('should redact US phone numbers', async () => {
      const input = "Call me at (555) 123-4567";
      const output = await anonymizeText(input);
      expect(output).toBe("Call me at [PHONE]");
    });
    
    it('should redact multiple formats', async () => {
      const input = "555-123-4567 or 5551234567";
      const output = await anonymizeText(input);
      expect(output).toBe("[PHONE] or [PHONE]");
    });
  });
  
  describe('Email Redaction', () => {
    it('should redact email addresses', async () => {
      const input = "Email me at john@example.com";
      const output = await anonymizeText(input);
      expect(output).toBe("Email me at [EMAIL]");
    });
  });
  
  describe('Address Redaction', () => {
    it('should redact street addresses', async () => {
      const input = "Located at 123 Main Street";
      const output = await anonymizeText(input);
      expect(output).toBe("Located at [ADDRESS]");
    });
    
    it('should redact apartment numbers', async () => {
      const input = "Apartment 4B";
      const output = await anonymizeText(input);
      expect(output).toBe("[UNIT]");
    });
  });
  
  describe('Content Preservation', () => {
    it('should preserve non-PII content', async () => {
      const input = "Terrible service at the Seattle location";
      const output = await anonymizeText(input);
      expect(output).toContain("Terrible service");
      expect(output).toContain("Seattle location");
    });
    
    it('should preserve business context', async () => {
      const input = "Manager was rude, 1 star review";
      const output = await anonymizeText(input);
      expect(output).toContain("Manager was rude");
      expect(output).toContain("1 star review");
    });
  });
  
  describe('Complex Scenarios', () => {
    it('should handle review with multiple PII types', async () => {
      const input = "Manager John at 123 Main St was rude. Call me at 555-1234 or email john@example.com";
      const output = await anonymizeText(input);
      
      expect(output).toContain("[NAME]");
      expect(output).toContain("[ADDRESS]");
      expect(output).toContain("[PHONE]");
      expect(output).toContain("[EMAIL]");
      expect(output).toContain("was rude");
    });
  });
});
```

### Integration Tests

```typescript
// tests/gdpr/deletion.integration.test.ts

describe('GDPR User Deletion', () => {
  let testUser;
  
  beforeEach(async () => {
    // Create test user with data
    testUser = await createTestUser({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    await createTestReview({
      userId: testUser.id,
      reviewText: 'Sarah Johnson was great!',
      rating: 5
    });
  });
  
  it('should delete all personal data', async () => {
    await handleGDPRDeletionRequest(testUser.id);
    
    // Verify user anonymized
    const user = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    expect(user.email).toMatch(/^deleted-.*@anonymized\.local$/);
    expect(user.name).toBe('Deleted User');
    expect(user.password).toBeNull();
  });
  
  it('should delete all reviews', async () => {
    await handleGDPRDeletionRequest(testUser.id);
    
    const reviews = await prisma.review.findMany({
      where: { userId: testUser.id }
    });
    
    expect(reviews).toHaveLength(0);
  });
  
  it('should anonymize credit usage snapshots', async () => {
    await handleGDPRDeletionRequest(testUser.id);
    
    const usage = await prisma.creditUsage.findFirst({
      where: { userId: testUser.id }
    });
    
    const details = JSON.parse(usage.details);
    
    expect(details.anonymized).toBe(true);
    expect(details.reviewSnapshot.text).toContain('[NAME]');
    expect(details.reviewSnapshot.text).not.toContain('Sarah Johnson');
  });
  
  it('should preserve non-PII data', async () => {
    await handleGDPRDeletionRequest(testUser.id);
    
    const usage = await prisma.creditUsage.findFirst({
      where: { userId: testUser.id }
    });
    
    const details = JSON.parse(usage.details);
    
    // These should be preserved
    expect(details.reviewSnapshot.rating).toBe(5);
    expect(details.reviewSnapshot.platform).toBeDefined();
    expect(usage.creditsUsed).toBe(1);
  });
});
```

---

## Compliance Checklist

### Pre-Launch Requirements

- [ ] **Account deletion feature** implemented in settings
- [ ] **Data export feature** (JSON download) available
- [ ] **Anonymization function** tested with >95% accuracy
- [ ] **Privacy policy** published and linked in footer
- [ ] **GDPR audit log** table created in database
- [ ] **Deletion confirmation email** template created
- [ ] **Support email** (support@reviewflow.com) monitored

### Ongoing Compliance

- [ ] **Monitor deletion requests** - respond within 30 days
- [ ] **Test anonymization** monthly with real data samples
- [ ] **Audit anonymized records** quarterly (spot checks)
- [ ] **Update privacy policy** when features change
- [ ] **Log all GDPR requests** for compliance audits
- [ ] **Train support staff** on GDPR procedures
- [ ] **Review data retention** annually

### Documentation Requirements

- [ ] **Privacy Policy** - public facing, explains data usage
- [ ] **Data Processing Agreement** - for business customers
- [ ] **GDPR Audit Trail** - internal, tracks all deletions
- [ ] **Technical Documentation** - this document
- [ ] **Incident Response Plan** - for data breaches

---

## Legal Disclaimers

**This document provides technical implementation guidance for GDPR compliance. It is not legal advice.**

For legal compliance questions:
- Consult with a qualified data protection lawyer
- Review with your Data Protection Officer (DPO) if required
- Consider GDPR consulting services
- Stay updated on regulatory changes

**Key Contacts:**
- Technical Implementation: dev@reviewflow.com
- Legal Questions: legal@reviewflow.com
- Data Protection Officer: dpo@reviewflow.com (if appointed)

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO GDPR Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [Article 17: Right to Erasure](https://gdpr-info.eu/art-17-gdpr/)
- [Article 15: Right of Access](https://gdpr-info.eu/art-15-gdpr/)

---

**Document Status:** ✅ READY FOR IMPLEMENTATION

**Next Steps:**
1. Review with legal counsel
2. Implement deletion UI (Week 1)
3. Add anonymization function (Week 1)
4. Deploy to staging for testing (Week 2)
5. Test with real PII samples (Week 2)
6. Launch with privacy policy (Week 3)

**Last Review:** January 6, 2026  
**Next Review:** April 6, 2026 (Quarterly)