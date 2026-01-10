# Security & Privacy: ReviewFlow MVP Phase 1
## Comprehensive Security Implementation Guide

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Development  
**Security Level:** Production-Ready with Defense-in-Depth

---

## Document Purpose

This document defines ReviewFlow's security architecture and privacy protections for Phase 1. Use this as:
- **Security implementation reference** for all authentication, authorization, and data protection
- **Developer guide** for secure coding practices
- **Compliance foundation** for GDPR and data protection requirements
- **Incident response preparation** for security events
- **Audit documentation** for security reviews

**Related Documents:**
- See `08_GDPR_COMPLIANCE.md` for detailed GDPR requirements and user rights
- See `05_API_CONTRACTS.md` for endpoint-specific security requirements
- See `04_DATA_MODEL.md` for data access control patterns

---

## Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection & Encryption](#data-protection--encryption)
4. [API Security](#api-security)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Credit System Security](#credit-system-security)
7. [Third-Party Service Security](#third-party-service-security)
8. [Session Management](#session-management)
9. [Monitoring & Logging](#monitoring--logging)
10. [Incident Response](#incident-response)
11. [Privacy Protections](#privacy-protections)
12. [Security Checklist](#security-checklist)

---

## Security Architecture Overview

### Defense-in-Depth Strategy

ReviewFlow implements multiple layers of security to protect user data and prevent unauthorized access:

```
â"Œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"
â"‚  Layer 1: Network Security (HTTPS/TLS, WAF)              â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 2: Application Security (Rate Limiting, CORS)     â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 3: Authentication (JWT, OAuth, MFA-ready)         â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 4: Authorization (User-owned data, RBAC)          â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 5: Input Validation (Schema validation, XSS)      â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 6: Data Protection (Encryption, Hashing, Masking) â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 7: Database Security (Parameterized queries, RLS) â"‚
â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"¤
â"‚  Layer 8: Monitoring & Auditing (Security logs, alerts)  â"‚
â""â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"˜
```

### Security Principles

**1. Principle of Least Privilege**
- Users can only access their own data
- API keys have minimal required permissions
- No admin accounts in Phase 1 (all users equal)

**2. Security by Default**
- HTTPS enforced (no HTTP)
- Secure session cookies (httpOnly, secure, sameSite)
- Password requirements enforced
- Rate limiting enabled by default

**3. Data Minimization**
- Collect only essential information (see GDPR compliance)
- No unnecessary PII storage
- Anonymize on user deletion

**4. Fail Securely**
- Errors don't leak sensitive information
- Authentication failures return generic messages
- Database errors caught and logged securely

---

## Authentication & Authorization

### Password Security

#### Password Requirements

```typescript
// Password validation rules
interface PasswordRequirements {
  minLength: 8,
  maxLength: 128,
  requireUppercase: false,  // Phase 1: Simple requirements
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialChars: false,
  
  // Phase 2+: Can add complexity requirements
  // requireUppercase: true,
  // requireNumbers: true,
}

// Validation function
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Check for common passwords (optional but recommended)
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Password Hashing

**NEVER store plain-text passwords.**

```typescript
import bcrypt from 'bcryptjs';

// Hashing configuration
const BCRYPT_ROUNDS = 12;  // High security, ~250ms compute time

// Hash password on signup
async function hashPassword(plainPassword: string): Promise<string> {
  // bcrypt automatically handles salting
  const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  return hashedPassword;
}

// Verify password on login
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  return isValid;
}

// Example: Signup flow
async function createUser(email: string, password: string) {
  // Validate password
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new ValidationError(validation.errors[0]);
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Store hashed password (NEVER plain text)
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,  // âœ" Hashed
      // password: password,     // âœ— NEVER DO THIS
    }
  });
}
```

**Security Notes:**
- Bcrypt automatically handles salting (no need to generate salt separately)
- Cost factor of 12 provides strong security without excessive delay
- Bcrypt is resistant to brute-force attacks (intentionally slow)
- Consider argon2 for Phase 2+ (more modern, but bcrypt is proven)

---

### JWT Authentication

#### Token Generation

```typescript
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;  // Must be strong random string
const JWT_EXPIRES_IN = '30d';                // 30 days

interface JWTPayload {
  userId: string;
  email: string;
  tier: 'FREE' | 'STARTER' | 'GROWTH';
  iat: number;   // Issued at
  exp: number;   // Expiration
}

// Generate JWT on login
function generateAuthToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    tier: user.tier,
  };
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  });
  
  return token;
}

// Verify JWT on protected routes
function verifyAuthToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired. Please log in again');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}
```

#### Authentication Middleware

```typescript
// Next.js API route protection
import { NextRequest, NextResponse } from 'next/server';

async function authenticateRequest(request: NextRequest): Promise<User> {
  // Extract token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing authentication token');
  }
  
  const token = authHeader.substring(7); // Remove "Bearer "
  
  // Verify token
  const payload = verifyAuthToken(token);
  
  // Fetch user from database (validates user still exists)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  
  // Check if email is verified
  if (!user.emailVerified) {
    throw new UnauthorizedError('Email not verified');
  }
  
  return user;
}

// Protect API routes
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    
    // User is authenticated, proceed with request
    return NextResponse.json({ success: true, data: {...} });
    
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    throw error;
  }
}
```

#### JWT Security Best Practices

**âœ… DO:**
- Store JWT_SECRET in environment variables (never in code)
- Use strong random secret (min 256 bits)
- Set reasonable expiration (30 days for Phase 1)
- Include minimal claims (userId, email, tier only)
- Use HS256 algorithm (sufficient for Phase 1)
- Verify token on every protected request
- Check user still exists in database

**âŒ DON'T:**
- Store sensitive data in JWT payload (it's base64, not encrypted)
- Use the same secret across environments (dev/staging/prod different)
- Accept expired tokens
- Trust token claims without verification
- Store JWT in localStorage (use httpOnly cookies when possible)

---

### OAuth 2.0 (Google Sign-In)

#### OAuth Security Implementation

```typescript
// NextAuth.js configuration
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',  // Minimal scopes (data minimization)
          prompt: 'consent',              // Always show consent screen
        }
      }
    })
  ],
  
  callbacks: {
    // Verify email on OAuth signup
    async signIn({ user, account, profile }) {
      // Google emails are pre-verified
      if (account.provider === 'google') {
        user.emailVerified = new Date();
      }
      return true;
    },
    
    // Create or update user
    async session({ session, user }) {
      // Attach minimal user info to session
      session.user.id = user.id;
      session.user.tier = user.tier;
      return session;
    }
  },
  
  // Security settings
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
```

**OAuth Security Checklist:**
- âœ" Store OAuth secrets in environment variables
- âœ" Use minimal scopes (only email and profile)
- âœ" Validate state parameter (CSRF protection)
- âœ" Verify email domain if restricting access
- âœ" Handle OAuth errors gracefully
- âœ" Log OAuth events for security monitoring

---

### Authorization (Access Control)

#### Resource Ownership Verification

**Every data access MUST verify user ownership.**

```typescript
// CRITICAL: Always verify ownership before data access

// âœ… CORRECT: Verify user owns the review
async function getReview(reviewId: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: userId  // CRITICAL: Filter by user
    }
  });
  
  if (!review) {
    throw new NotFoundError('Review not found');  // Don't reveal if exists
  }
  
  return review;
}

// âœ— WRONG: No ownership verification
async function getReviewWrong(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }  // SECURITY VULNERABILITY
  });
  return review;  // Any user can access any review!
}

// âœ… CORRECT: Verify ownership before update
async function updateReview(
  reviewId: string,
  userId: string,
  newText: string
) {
  // First verify ownership
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });
  
  if (!review) {
    throw new UnauthorizedError('Not authorized to update this review');
  }
  
  // Then update
  return await prisma.review.update({
    where: { id: reviewId },
    data: { reviewText: newText }
  });
}

// âœ… CORRECT: List only user's reviews
async function listReviews(userId: string) {
  return await prisma.review.findMany({
    where: { userId },  // ALWAYS filter by userId
    orderBy: { createdAt: 'desc' }
  });
}
```

#### Authorization Patterns

```typescript
// Pattern 1: Direct ownership check
async function canAccessReview(reviewId: string, userId: string): Promise<boolean> {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    select: { id: true }  // Only fetch ID (faster)
  });
  return review !== null;
}

// Pattern 2: Ownership through relationship
async function canAccessResponse(responseId: string, userId: string): Promise<boolean> {
  const response = await prisma.reviewResponse.findFirst({
    where: {
      id: responseId,
      review: {
        userId  // Access through review ownership
      }
    },
    select: { id: true }
  });
  return response !== null;
}

// Pattern 3: Authorization middleware
async function requireOwnership(resourceType: string, resourceId: string, userId: string) {
  const canAccess = await checkOwnership(resourceType, resourceId, userId);
  if (!canAccess) {
    throw new UnauthorizedError('Access denied');
  }
}

// Usage in API route
export async function DELETE(request: NextRequest, { params }) {
  const user = await authenticateRequest(request);
  const reviewId = params.id;
  
  // Verify ownership before deletion
  await requireOwnership('review', reviewId, user.id);
  
  // Now safe to delete
  await prisma.review.delete({ where: { id: reviewId } });
  
  return NextResponse.json({ success: true });
}
```

---

### Brute Force Protection

#### Login Rate Limiting

```typescript
// Rate limiting for authentication endpoints
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),  // 5 attempts per 15 minutes
  prefix: 'ratelimit:login',
});

// Apply to login endpoint
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Rate limit by IP address
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success, limit, remaining } = await loginRateLimiter.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many login attempts. Please try again in 15 minutes',
          details: {
            limit,
            remaining: 0,
            resetIn: '15 minutes'
          }
        }
      },
      { status: 429 }
    );
  }
  
  // Proceed with login
  const result = await authenticateUser(email, password);
  
  return NextResponse.json(result);
}
```

#### Account Lockout (Optional - Phase 2+)

```typescript
// Track failed login attempts
interface LoginAttempt {
  email: string;
  ipAddress: string;
  success: boolean;
  timestamp: Date;
}

async function trackLoginAttempt(attempt: LoginAttempt) {
  await prisma.loginAttempt.create({ data: attempt });
  
  // Check for suspicious pattern
  if (!attempt.success) {
    const recentFailures = await prisma.loginAttempt.count({
      where: {
        email: attempt.email,
        success: false,
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000)  // Last 15 minutes
        }
      }
    });
    
    if (recentFailures >= 5) {
      // Lock account temporarily
      await prisma.user.update({
        where: { email: attempt.email },
        data: {
          accountLocked: true,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
        }
      });
      
      // Send security alert email
      await sendSecurityAlert(attempt.email, 'Account temporarily locked due to multiple failed login attempts');
    }
  }
}
```

---

## Data Protection & Encryption

### Encryption at Rest

**Database Encryption:**

```typescript
// Supabase provides automatic encryption at rest
// Configuration (already enabled by default):
{
  encryption: {
    atRest: true,           // AES-256 encryption
    provider: 'AWS KMS',    // Key management
    keyRotation: true       // Automatic key rotation
  }
}

// No additional code needed - handled by Supabase
// Database backups are also encrypted
```

**Sensitive Field Encryption (if needed in Phase 2+):**

```typescript
import crypto from 'crypto';

// Encrypt specific fields (API keys, tokens, etc.)
class FieldEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    // Derive key from environment variable
    this.key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY,
      'salt',
      32
    );
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv + authTag + encrypted (all hex)
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }
  
  decrypt(ciphertext: string): string {
    // Extract iv, authTag, encrypted
    const iv = Buffer.from(ciphertext.slice(0, 32), 'hex');
    const authTag = Buffer.from(ciphertext.slice(32, 64), 'hex');
    const encrypted = ciphertext.slice(64);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Usage (only for highly sensitive data)
const encryption = new FieldEncryption();

// Store encrypted API key
const encryptedKey = encryption.encrypt(userApiKey);
await prisma.user.update({
  where: { id: userId },
  data: { encryptedApiKey: encryptedKey }
});

// Retrieve and decrypt
const user = await prisma.user.findUnique({ where: { id: userId } });
const decryptedKey = encryption.decrypt(user.encryptedApiKey);
```

**Note:** For Phase 1, encryption at rest (Supabase default) is sufficient. Field-level encryption adds complexity and should only be used for extremely sensitive data (payment info, API keys, etc.).

---

### Encryption in Transit

**HTTPS/TLS Enforcement:**

```typescript
// Next.js middleware to enforce HTTPS
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Enforce HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = request.url.replace('http://', 'https://');
    return NextResponse.redirect(httpsUrl, 301);
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**TLS Configuration:**

```yaml
# Vercel automatically provides:
- TLS 1.3 support
- Automatic HTTPS redirection
- Free SSL certificate (Let's Encrypt)
- Certificate auto-renewal

# No manual configuration needed
```

---

### Environment Variable Security

**Secure Storage:**

```bash
# .env.local (NEVER commit to git)

# Database
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Authentication
JWT_SECRET="32-byte-random-string-here"  # Generate: openssl rand -base64 32
NEXTAUTH_SECRET="another-32-byte-random-string"
NEXTAUTH_URL="https://reviewflow.com"

# OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret-here"

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
DEEPSEEK_API_KEY="sk-..."

# Email
RESEND_API_KEY="re_..."

# Redis (Rate limiting)
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Encryption (if needed)
ENCRYPTION_KEY="strong-random-key-here"
```

**Security Checklist:**
- âœ" Add `.env.local` to `.gitignore`
- âœ" Never commit secrets to git
- âœ" Use different secrets per environment (dev/staging/prod)
- âœ" Rotate secrets regularly (every 90 days)
- âœ" Use environment variables in CI/CD (Vercel secrets)
- âœ" Restrict access to production secrets (team permissions)
- âœ" Monitor secret usage (detect unauthorized access)

**Secret Rotation Process:**

```typescript
// When rotating JWT_SECRET, maintain two keys temporarily
const OLD_JWT_SECRET = process.env.OLD_JWT_SECRET;
const NEW_JWT_SECRET = process.env.NEW_JWT_SECRET;

function verifyAuthToken(token: string): JWTPayload {
  try {
    // Try new secret first
    return jwt.verify(token, NEW_JWT_SECRET) as JWTPayload;
  } catch (error) {
    // Fallback to old secret during transition period
    if (OLD_JWT_SECRET) {
      try {
        return jwt.verify(token, OLD_JWT_SECRET) as JWTPayload;
      } catch (oldError) {
        throw new UnauthorizedError('Invalid token');
      }
    }
    throw error;
  }
}

// After 30 days (all tokens expired), remove OLD_JWT_SECRET
```

---

## API Security

### Rate Limiting

**Endpoint-Specific Limits:**

```typescript
// Rate limiting configuration per endpoint type

const rateLimits = {
  // Authentication endpoints (stricter)
  login: {
    requests: 5,
    window: '15m',
    identifier: 'ip'
  },
  signup: {
    requests: 3,
    window: '1h',
    identifier: 'ip'
  },
  passwordReset: {
    requests: 3,
    window: '1h',
    identifier: 'email'
  },
  
  // AI generation endpoints (prevent credit abuse)
  generateResponse: {
    requests: 10,
    window: '1m',
    identifier: 'userId'
  },
  analyzeSentiment: {
    requests: 20,
    window: '1m',
    identifier: 'userId'
  },
  
  // Standard CRUD endpoints
  standard: {
    requests: 100,
    window: '1m',
    identifier: 'userId'
  },
  
  // Data export (resource-intensive)
  dataExport: {
    requests: 1,
    window: '1m',
    identifier: 'userId'
  }
};

// Implementation
async function applyRateLimit(
  endpoint: keyof typeof rateLimits,
  identifier: string
): Promise<boolean> {
  const config = rateLimits[endpoint];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:${endpoint}`,
  });
  
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  
  if (!success) {
    throw new RateLimitError({
      message: `Rate limit exceeded for ${endpoint}`,
      limit,
      remaining: 0,
      resetAt: reset
    });
  }
  
  return true;
}

// Usage in API route
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  
  // Apply rate limit
  await applyRateLimit('generateResponse', user.id);
  
  // Proceed with request
  return await generateResponse(...);
}
```

**Rate Limit Headers:**

```typescript
// Add rate limit info to response headers
function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
) {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  
  return response;
}
```

---

### CORS Configuration

```typescript
// CORS policy (Next.js API routes)

const ALLOWED_ORIGINS = [
  'https://reviewflow.com',
  'https://app.reviewflow.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000'
].filter(Boolean);

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
  
  return new NextResponse(null, { status: 403 });
}
```

---

## Input Validation & Sanitization

### Validation Strategy

**Validate ALL user input at multiple layers:**

1. **Client-side validation** (UX, not security)
2. **API schema validation** (Zod)
3. **Database constraints** (Prisma)

```typescript
import { z } from 'zod';

// Define validation schemas
const ReviewInputSchema = z.object({
  reviewText: z.string()
    .min(1, 'Review text is required')
    .max(2000, 'Review text must be less than 2000 characters')
    .trim(),
  
  rating: z.number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional()
    .nullable(),
  
  platform: z.enum([
    'google',
    'amazon',
    'shopify',
    'trustpilot',
    'yelp',
    'facebook',
    'other'
  ]),
  
  reviewerName: z.string()
    .max(100, 'Reviewer name must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  
  reviewDate: z.coerce.date()
    .optional()
    .nullable()
});

// Apply validation in API route
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  const body = await request.json();
  
  // Validate input
  const validation = ReviewInputSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: validation.error.flatten()
        }
      },
      { status: 400 }
    );
  }
  
  // Input is valid and sanitized
  const data = validation.data;
  
  // Create review
  return await createReview(user.id, data);
}
```

### XSS Prevention

**HTML Sanitization:**

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user-generated content before display
function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],  // Strip all HTML tags
    ALLOWED_ATTR: []   // Strip all attributes
  });
}

// Example: Display review text
function ReviewCard({ review }) {
  // Sanitize before rendering
  const safeReviewText = sanitizeHTML(review.reviewText);
  
  return (
    <div>
      <p>{safeReviewText}</p>
    </div>
  );
}

// Note: In Phase 1, reviews are plain text (no HTML)
// Sanitization is still applied as defense-in-depth
```

**React Automatic XSS Protection:**

React automatically escapes values in JSX, providing built-in XSS protection:

```typescript
// âœ… SAFE: React escapes automatically
<div>{review.reviewText}</div>

// âœ— UNSAFE: dangerouslySetInnerHTML bypasses protection
<div dangerouslySetInnerHTML={{ __html: review.reviewText }} />
// Never use dangerouslySetInnerHTML with user input!
```

### SQL Injection Prevention

**Prisma ORM Automatic Protection:**

```typescript
// âœ… SAFE: Prisma uses parameterized queries automatically
async function getReview(reviewId: string, userId: string) {
  return await prisma.review.findFirst({
    where: {
      id: reviewId,      // Automatically parameterized
      userId: userId     // Automatically escaped
    }
  });
}

// âœ— UNSAFE: Raw SQL without parameters (don't do this)
async function getReviewUnsafe(reviewId: string) {
  return await prisma.$queryRaw`
    SELECT * FROM reviews WHERE id = ${reviewId}
  `;
  // Still safe because Prisma escapes template literals
  // But prefer the ORM methods above
}

// âœ— VERY UNSAFE: String concatenation (NEVER do this)
async function getReviewVeryUnsafe(reviewId: string) {
  const query = "SELECT * FROM reviews WHERE id = '" + reviewId + "'";
  // SQL INJECTION VULNERABILITY
  // Attacker can pass: "1' OR '1'='1"
  return await prisma.$queryRawUnsafe(query);  // DON'T USE
}
```

**Security Guarantee:** Prisma ORM prevents SQL injection by default. **Never use raw SQL with string concatenation.**

---

### CSRF Protection

**Token-Based CSRF Prevention:**

```typescript
// Next.js automatically provides CSRF protection via:
// 1. SameSite cookies (prevents cross-site requests)
// 2. Origin header validation

// Additional CSRF middleware (optional, defense-in-depth)
import csrf from 'csrf';

const tokens = new csrf();

// Generate CSRF token on page load
export async function GET(request: NextRequest) {
  const secret = await tokens.secret();
  const token = tokens.create(secret);
  
  const response = NextResponse.json({ csrfToken: token });
  
  // Store secret in httpOnly cookie
  response.cookies.set('csrf-secret', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  
  return response;
}

// Verify CSRF token on state-changing requests
export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const csrfSecret = request.cookies.get('csrf-secret')?.value;
  
  if (!csrfToken || !csrfSecret) {
    throw new ForbiddenError('CSRF token missing');
  }
  
  if (!tokens.verify(csrfSecret, csrfToken)) {
    throw new ForbiddenError('Invalid CSRF token');
  }
  
  // Proceed with request
  return await processRequest(request);
}
```

**Note:** For Phase 1, SameSite cookies (default in Next.js) provide sufficient CSRF protection. Additional token validation can be added in Phase 2+ if needed.

---

## Credit System Security

### Fraud Prevention

**Atomic Transactions:**

```typescript
// CRITICAL: Credit deduction must be atomic
// Either ALL operations succeed, or ALL fail

async function generateResponseWithCredits(
  userId: string,
  reviewId: string
): Promise<string> {
  // Use database transaction
  return await prisma.$transaction(async (tx) => {
    // Step 1: Get current credits
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    
    if (!user || user.credits < 1) {
      throw new InsufficientCreditsError('Not enough credits');
    }
    
    // Step 2: Deduct credit
    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } }
    });
    
    // Step 3: Call AI API
    let generatedResponse: string;
    try {
      generatedResponse = await callClaudeAPI(reviewId);
    } catch (error) {
      // API failed - transaction will rollback
      throw new AIGenerationError('Failed to generate response');
    }
    
    // Step 4: Save response
    const response = await tx.reviewResponse.create({
      data: {
        reviewId,
        responseText: generatedResponse,
        creditsUsed: 1
      }
    });
    
    // Step 5: Log credit usage with audit trail
    await tx.creditUsage.create({
      data: {
        userId,
        reviewId,
        reviewResponseId: response.id,
        creditsUsed: 1,
        action: 'GENERATE_RESPONSE',
        details: JSON.stringify({
          reviewSnapshot: await getReviewSnapshot(tx, reviewId)
        })
      }
    });
    
    return generatedResponse;
  });
  
  // If ANY step fails, ALL changes are rolled back:
  // - Credit is refunded automatically
  // - Response is not saved
  // - Usage log is not created
}
```

**Credit Refund Policy:**

```typescript
// Automatic refunds for system failures
async function refundCredit(
  userId: string,
  reviewResponseId: string,
  reason: string
) {
  await prisma.$transaction(async (tx) => {
    // Refund credit
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } }
    });
    
    // Log refund in audit trail
    await tx.creditUsage.create({
      data: {
        userId,
        reviewResponseId,
        creditsUsed: -1,  // Negative = refund
        action: 'REFUND',
        details: JSON.stringify({ reason })
      }
    });
  });
}

// Refund scenarios
const refundReasons = {
  API_ERROR: 'AI API returned error',
  TIMEOUT: 'Request timed out (>30 seconds)',
  EMPTY_RESPONSE: 'AI generated empty response',
  SYSTEM_ERROR: 'Internal server error'
};

// No refunds for:
// - User deletes response (anti-abuse)
// - User regenerates response (intentional)
// - User dislikes quality (subjective)
```

### Audit Trail

**Complete Credit Usage Tracking:**

```typescript
// CreditUsage table stores complete audit trail
interface CreditUsageRecord {
  id: string;
  userId: string;
  reviewId: string | null;         // Can be null if review deleted
  reviewResponseId: string | null; // Can be null if response deleted
  creditsUsed: number;             // 1 for usage, -1 for refund
  action: 'GENERATE_RESPONSE' | 'REGENERATE' | 'REFUND';
  details: string;                 // JSON snapshot of review + response
  createdAt: Date;
}

// Snapshot format (survives deletion)
interface CreditUsageSnapshot {
  reviewSnapshot: {
    text: string;      // First 200 chars
    rating: number;
    platform: string;
    sentiment: string;
    language: string;
  };
  responseSnapshot: {
    text: string;      // Full response
    tone: string;
    model: string;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    timestamp: string;
  };
  anonymized?: boolean;  // Set to true on user deletion
}

// Query credit usage history
async function getCreditUsageHistory(userId: string) {
  const usageRecords = await prisma.creditUsage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      review: true,           // null if deleted
      reviewResponse: true    // null if deleted
    }
  });
  
  // Parse details field for audit information
  return usageRecords.map(record => ({
    ...record,
    snapshot: JSON.parse(record.details || '{}')
  }));
}
```

**Fraud Detection Patterns:**

```typescript
// Detect suspicious credit usage patterns
async function detectFraudulentBehavior(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // Pattern 1: Excessive deletions
  const deletionRate = await calculateDeletionRate(userId);
  if (deletionRate > 0.5) {  // >50% of responses deleted
    alerts.push({
      type: 'HIGH_DELETION_RATE',
      severity: 'HIGH',
      message: 'User deletes >50% of generated responses'
    });
  }
  
  // Pattern 2: Rapid regenerations
  const avgRegenerations = await calculateAvgRegenerations(userId);
  if (avgRegenerations > 5) {  // >5 regenerations per review
    alerts.push({
      type: 'EXCESSIVE_REGENERATIONS',
      severity: 'MEDIUM',
      message: 'User regenerates excessively (>5x per review)'
    });
  }
  
  // Pattern 3: Suspicious timing
  const creditsUsedInHour = await getCreditsUsedInLastHour(userId);
  if (creditsUsedInHour > 50) {  // >50 credits in 1 hour
    alerts.push({
      type: 'RAPID_USAGE',
      severity: 'HIGH',
      message: 'Unusually rapid credit consumption'
    });
  }
  
  return alerts;
}

// Automated response to fraud detection
async function handleFraudAlert(userId: string, alert: Alert) {
  // Log for manual review
  await logSecurityEvent({
    userId,
    type: 'FRAUD_ALERT',
    details: alert
  });
  
  // For high-severity alerts, consider temporary restrictions
  if (alert.severity === 'HIGH') {
    // Don't auto-ban, but flag for review
    await flagAccountForReview(userId, alert);
  }
}
```

---

## Third-Party Service Security

### Claude API Security

```typescript
// Secure Claude API integration

class ClaudeAPIClient {
  private apiKey: string;
  private rateLimiter: Ratelimit;
  
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    // Rate limit Claude API calls
    this.rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1m'),  // 60 requests/min
      prefix: 'ratelimit:claude-api'
    });
  }
  
  async generateResponse(prompt: string): Promise<string> {
    // Apply rate limit
    const { success } = await this.rateLimiter.limit('global');
    if (!success) {
      throw new RateLimitError('Claude API rate limit exceeded');
    }
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      return response.content[0].text;
      
    } catch (error) {
      // Log error securely (don't expose API key)
      await logAPIError({
        service: 'claude',
        error: error.message,
        // Don't log: error.config (may contain API key)
      });
      
      throw new AIGenerationError('Failed to generate response');
    }
  }
}

// Never log API keys
function logAPIError(error: any) {
  // âœ… SAFE: Log error without sensitive data
  console.error('API Error:', {
    service: error.service,
    message: error.message,
    timestamp: new Date()
  });
  
  // âœ— UNSAFE: Don't log full error object (may contain keys)
  // console.error('API Error:', error);
}
```

### DeepSeek API Security

```typescript
// Similar security practices for DeepSeek API

class DeepSeekAPIClient {
  private apiKey: string;
  private rateLimiter: Ratelimit;
  
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }
    
    this.rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1m'),  // 100 requests/min
      prefix: 'ratelimit:deepseek-api'
    });
  }
  
  async analyzeSentiment(text: string): Promise<string> {
    const { success } = await this.rateLimiter.limit('global');
    if (!success) {
      throw new RateLimitError('DeepSeek API rate limit exceeded');
    }
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/sentiment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      return data.sentiment;  // 'positive' | 'neutral' | 'negative'
      
    } catch (error) {
      await logAPIError({
        service: 'deepseek',
        error: error.message
      });
      
      // Fail gracefully - sentiment is not critical
      return null;
    }
  }
}
```

### API Key Rotation

```typescript
// Rotate API keys without downtime

class APIKeyManager {
  private currentKey: string;
  private deprecatedKey?: string;
  private keyRotationDate?: Date;
  
  constructor() {
    this.currentKey = process.env.API_KEY_CURRENT;
    this.deprecatedKey = process.env.API_KEY_DEPRECATED;  // Old key during transition
    
    if (this.deprecatedKey) {
      this.keyRotationDate = new Date(process.env.KEY_ROTATION_DATE);
    }
  }
  
  getActiveKey(): string {
    // Use new key
    return this.currentKey;
  }
  
  async makeRequest(endpoint: string, data: any) {
    try {
      // Try with current key
      return await this.request(endpoint, data, this.currentKey);
    } catch (error) {
      // If current key fails and we have deprecated key, try it
      if (this.deprecatedKey && error.statusCode === 401) {
        console.warn('Current key failed, trying deprecated key');
        return await this.request(endpoint, data, this.deprecatedKey);
      }
      throw error;
    }
  }
  
  private async request(endpoint: string, data: any, apiKey: string) {
    // Make API request with specified key
    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }
}

// Rotation process:
// 1. Generate new API key
// 2. Add as API_KEY_CURRENT in environment
// 3. Move old key to API_KEY_DEPRECATED
// 4. Deploy (both keys work during transition)
// 5. Wait 7 days
// 6. Remove API_KEY_DEPRECATED
```

---

## Session Management

### Secure Session Configuration

```typescript
// Session security settings

const sessionConfig = {
  // Session duration
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  
  // Cookie settings
  cookieName: 'reviewflow.session',
  cookieOptions: {
    httpOnly: true,        // Prevent JavaScript access (XSS protection)
    secure: true,          // HTTPS only
    sameSite: 'lax',       // CSRF protection
    path: '/',
    domain: process.env.NODE_ENV === 'production'
      ? '.reviewflow.com'  // Allow subdomain access
      : undefined
  },
  
  // Session storage
  store: 'database',       // Store sessions in PostgreSQL (via Prisma)
  
  // Security
  rolling: true,           // Extend session on activity
  regenerateOnSignIn: true // New session ID on login
};
```

### Session Lifecycle

```typescript
// Create session on login
async function createSession(userId: string): Promise<string> {
  // Generate secure session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiration
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Store session in database
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires
    }
  });
  
  return sessionToken;
}

// Validate session on request
async function validateSession(sessionToken: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  });
  
  // Check if session exists and is not expired
  if (!session || session.expires < new Date()) {
    return null;
  }
  
  // Optionally: Extend session on activity (rolling sessions)
  if (shouldExtendSession(session)) {
    await extendSession(sessionToken);
  }
  
  return session.user;
}

// Extend session
async function extendSession(sessionToken: string) {
  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  await prisma.session.update({
    where: { sessionToken },
    data: { expires: newExpiry }
  });
}

// Destroy session on logout
async function destroySession(sessionToken: string) {
  await prisma.session.delete({
    where: { sessionToken }
  });
}

// Clean up expired sessions (cron job)
async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      expires: { lt: new Date() }
    }
  });
  
  console.log(`Cleaned up ${result.count} expired sessions`);
}

// Schedule cleanup daily at 2 AM
cron.schedule('0 2 * * *', cleanupExpiredSessions);
```

---

## Monitoring & Logging

### Security Logging

**What to Log:**

```typescript
// Security event logging
interface SecurityEvent {
  type: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET' | 'UNAUTHORIZED_ACCESS' | 'RATE_LIMIT' | 'FRAUD_ALERT';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
  timestamp: Date;
}

async function logSecurityEvent(event: SecurityEvent) {
  await prisma.securityLog.create({
    data: {
      type: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: event.success,
      details: JSON.stringify(event.details),
      timestamp: event.timestamp
    }
  });
  
  // Alert on critical events
  if (event.type === 'FRAUD_ALERT' || event.type === 'UNAUTHORIZED_ACCESS') {
    await sendSecurityAlert(event);
  }
}

// Usage examples
await logSecurityEvent({
  type: 'LOGIN',
  userId: user.id,
  ipAddress: request.ip,
  userAgent: request.headers.get('user-agent'),
  success: true,
  timestamp: new Date()
});

await logSecurityEvent({
  type: 'UNAUTHORIZED_ACCESS',
  userId: attemptedUserId,
  ipAddress: request.ip,
  userAgent: request.headers.get('user-agent'),
  success: false,
  details: { resource: 'review', resourceId: reviewId },
  timestamp: new Date()
});
```

**What NOT to Log:**

```typescript
// âŒ NEVER log these:
// - Passwords (plain or hashed)
// - API keys
// - Session tokens
// - Credit card numbers
// - Social security numbers
// - Full email addresses in public logs

// âœ… DO log these:
// - User IDs (not email)
// - IP addresses
// - Timestamps
// - Action types
// - Success/failure status
// - Error types (not full stack traces with sensitive data)
```

### Performance Monitoring

```typescript
// Monitor API performance
async function monitorAPIPerformance(
  endpoint: string,
  handler: () => Promise<any>
): Promise<any> {
  const startTime = Date.now();
  
  try {
    const result = await handler();
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 5000) {  // >5 seconds
      await logPerformanceIssue({
        endpoint,
        duration,
        type: 'SLOW_REQUEST'
      });
    }
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await logPerformanceIssue({
      endpoint,
      duration,
      type: 'ERROR',
      error: error.message
    });
    
    throw error;
  }
}
```

### Alert Thresholds

```typescript
// Define alert conditions
const alertThresholds = {
  // Authentication
  failedLoginAttempts: {
    threshold: 5,
    window: '15m',
    action: 'FLAG_FOR_REVIEW'
  },
  
  // Performance
  slowRequests: {
    threshold: 10,  // 10 requests >5s in 1 hour
    window: '1h',
    action: 'NOTIFY_TEAM'
  },
  
  // Security
  suspiciousActivity: {
    threshold: 1,   // Any suspicious activity
    window: 'immediate',
    action: 'IMMEDIATE_ALERT'
  },
  
  // Credit system
  unusualCreditUsage: {
    threshold: 50,  // >50 credits in 1 hour
    window: '1h',
    action: 'FLAG_FOR_REVIEW'
  }
};

// Monitor and alert
async function checkAlertThresholds() {
  for (const [metric, config] of Object.entries(alertThresholds)) {
    const count = await getMetricCount(metric, config.window);
    
    if (count >= config.threshold) {
      await triggerAlert(metric, count, config.action);
    }
  }
}
```

---

## Incident Response

### Incident Response Plan

**1. Detection**
- Automated alerts for security events
- User reports via support
- Monitoring dashboard anomalies

**2. Triage (< 5 minutes)**
```typescript
// Severity levels
enum IncidentSeverity {
  P0_CRITICAL = 'P0',  // Data breach, service down
  P1_HIGH = 'P1',      // Fraud, unauthorized access
  P2_MEDIUM = 'P2',    // Performance degradation
  P3_LOW = 'P3'        // Minor issues
}

async function triageIncident(incident: SecurityIncident): Promise<void> {
  // Determine severity
  const severity = assessSeverity(incident);
  
  // P0: Immediate action
  if (severity === IncidentSeverity.P0_CRITICAL) {
    await notifyOnCallEngineer();
    await initiateLockdown();
  }
  
  // P1: Urgent response
  if (severity === IncidentSeverity.P1_HIGH) {
    await notifySecurityTeam();
    await investigateImmediately();
  }
}
```

**3. Containment**
```typescript
// Immediate containment actions
async function containSecurityIncident(incident: SecurityIncident) {
  switch (incident.type) {
    case 'DATA_BREACH':
      await suspendAllSessions();
      await rotateAPIKeys();
      await notifyAffectedUsers();
      break;
      
    case 'FRAUD_DETECTED':
      await suspendUserAccount(incident.userId);
      await freezeCredits(incident.userId);
      await investigateFraud(incident.userId);
      break;
      
    case 'API_KEY_LEAKED':
      await rotateAPIKey(incident.keyType);
      await auditAPIKeyUsage(incident.keyType);
      break;
      
    case 'DDOS_ATTACK':
      await enableRateLimiting('strict');
      await blockMaliciousIPs(incident.attackerIPs);
      break;
  }
}
```

**4. Investigation**
- Review security logs
- Analyze audit trails
- Interview affected users (if applicable)
- Document findings

**5. Recovery**
- Fix vulnerability
- Restore normal operations
- Verify security controls

**6. Post-Incident**
- Write incident report
- Update runbooks
- Improve security measures
- Notify stakeholders

### Breach Notification

```typescript
// GDPR Article 33: Breach notification (within 72 hours)
async function handleDataBreach(breach: DataBreach) {
  // 1. Assess severity
  const affectedUsers = await getAffectedUsers(breach);
  const dataExposed = assessExposedData(breach);
  
  // 2. Notify authorities (if required)
  if (affectedUsers.length > 0 && isGDPRBreach(dataExposed)) {
    await notifyDataProtectionAuthority({
      breach,
      affectedUsers: affectedUsers.length,
      dataTypes: dataExposed,
      timeOfBreach: breach.timestamp,
      mitigationActions: breach.actions
    });
  }
  
  // 3. Notify affected users
  for (const user of affectedUsers) {
    await sendBreachNotification(user, {
      dataExposed: dataExposed,
      actions: 'We recommend changing your password immediately',
      contact: 'security@reviewflow.com'
    });
  }
  
  // 4. Public disclosure (if >500 users affected)
  if (affectedUsers.length > 500) {
    await publishSecurityAdvisory(breach);
  }
}
```

---

## Privacy Protections

### Data Minimization

**Collect Only What's Necessary:**

```typescript
// âœ… MINIMAL: Only collect essential data
interface UserSignup {
  email: string;           // Required for authentication
  password: string;        // Required for security
  name?: string;           // Optional, improves UX
}

// âŒ EXCESSIVE: Don't collect unnecessary data
interface UserSignupBad {
  email: string;
  password: string;
  name: string;
  firstName: string;       // âŒ Not needed
  lastName: string;        // âŒ Not needed
  phoneNumber: string;     // âŒ Not needed for MVP
  dateOfBirth: Date;       // âŒ Not needed
  gender: string;          // âŒ Not needed
  address: string;         // âŒ Not needed
}
```

### Purpose Limitation

**Use Data Only for Stated Purpose:**

```typescript
// âœ… ALLOWED: Use email for account management
async function sendPasswordReset(email: string) {
  // This is the purpose we collected email for
  await sendEmail(email, 'Reset Your Password', resetLink);
}

// âŒ NOT ALLOWED: Use email for unrelated marketing
async function sendMarketingEmail(email: string) {
  // This requires separate consent
  // Check if user opted in to marketing
  const user = await prisma.user.findUnique({
    where: { email },
    select: { marketingOptIn: true }
  });
  
  if (!user.marketingOptIn) {
    throw new Error('User has not opted in to marketing');
  }
  
  await sendEmail(email, 'Check out our new feature!', marketing);
}
```

### User Consent Management

```typescript
// Track user consent for optional processing
interface UserConsent {
  userId: string;
  marketingEmails: boolean;       // Opt-in for marketing
  analyticsTracking: boolean;     // Opt-in for analytics
  dataSharing: boolean;           // Opt-in for third-party sharing
  consentDate: Date;
}

// Update consent
async function updateUserConsent(
  userId: string,
  consent: Partial<UserConsent>
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      marketingOptIn: consent.marketingEmails,
      analyticsOptIn: consent.analyticsTracking,
      dataShareOptIn: consent.dataSharing,
      consentUpdatedAt: new Date()
    }
  });
}

// UI: Consent management in settings
function ConsentSettings() {
  return (
    <div>
      <h3>Privacy Preferences</h3>
      
      <Checkbox
        label="Send me marketing emails"
        checked={user.marketingOptIn}
        onChange={updateMarketingConsent}
      />
      
      <Checkbox
        label="Track my usage for product improvements"
        checked={user.analyticsOptIn}
        onChange={updateAnalyticsConsent}
      />
      
      <p>You can change these preferences at any time.</p>
    </div>
  );
}
```

### Data Retention

**Delete Data When No Longer Needed:**

```typescript
// Retention policies
const retentionPolicies = {
  // Active data
  userAccount: 'Until user deletes account',
  reviews: 'Until user deletes review',
  responses: 'Until user deletes response',
  
  // Temporary data
  sessions: '30 days after last activity',
  emailVerificationTokens: '24 hours after creation',
  passwordResetTokens: '1 hour after creation',
  
  // Audit data (legal requirement)
  creditUsage: '7 years (anonymized after account deletion)',
  securityLogs: '1 year',
  
  // Deleted user data
  anonymizedData: '7 years after deletion',
};

// Automated cleanup (cron jobs)
async function cleanupExpiredData() {
  // Clean expired sessions
  await prisma.session.deleteMany({
    where: { expires: { lt: new Date() } }
  });
  
  // Clean expired tokens
  await prisma.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } }
  });
  
  // Clean old security logs (>1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  await prisma.securityLog.deleteMany({
    where: { timestamp: { lt: oneYearAgo } }
  });
}

// Schedule cleanup daily
cron.schedule('0 2 * * *', cleanupExpiredData);
```

---

## Security Checklist

### Pre-Launch Security Audit

**âœ" Authentication & Authorization**
- [ ] Passwords hashed with bcrypt (cost factor 12)
- [ ] JWT secret is strong (>256 bits) and stored in env variable
- [ ] Email verification required before account access
- [ ] Password reset tokens expire after 1 hour
- [ ] OAuth implementation follows security best practices
- [ ] All API endpoints verify user authentication
- [ ] All data access verifies user authorization
- [ ] Brute force protection enabled (5 attempts / 15 min)

**âœ" Data Protection**
- [ ] HTTPS enforced (no HTTP access)
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Database encryption at rest enabled (Supabase default)
- [ ] API keys stored in environment variables (not code)
- [ ] No sensitive data in logs (passwords, API keys, tokens)
- [ ] Prisma ORM prevents SQL injection
- [ ] User input validated with Zod schemas

**âœ" API Security**
- [ ] Rate limiting configured per endpoint type
- [ ] CORS policy restricts allowed origins
- [ ] Input sanitization prevents XSS
- [ ] CSRF protection via SameSite cookies
- [ ] Error messages don't leak sensitive info

**âœ" Credit System**
- [ ] Credit deduction uses atomic transactions
- [ ] Audit trail captures all credit usage
- [ ] Refund policy implemented for system errors
- [ ] Fraud detection monitors suspicious patterns
- [ ] Credit snapshots survive review deletion

**âœ" Session Management**
- [ ] Session cookies are httpOnly, secure, sameSite
- [ ] Sessions expire after 30 days
- [ ] Sessions stored in database (not client-side)
- [ ] Expired sessions cleaned up daily
- [ ] New session ID generated on login

**âœ" Third-Party Services**
- [ ] Claude API key secured
- [ ] DeepSeek API key secured
- [ ] API rate limiting prevents overage costs
- [ ] API errors logged without exposing keys
- [ ] Key rotation process documented

**âœ" Privacy & GDPR**
- [ ] Data minimization principle applied
- [ ] Purpose limitation enforced
- [ ] User consent tracked for optional processing
- [ ] Data retention policies implemented
- [ ] User data export functionality working
- [ ] Account deletion with anonymization implemented
- [ ] Privacy policy published and accessible

**âœ" Monitoring & Logging**
- [ ] Security events logged (login, signup, unauthorized access)
- [ ] Performance monitoring tracks slow requests
- [ ] Alert thresholds configured
- [ ] Fraud detection alerts working
- [ ] Incident response plan documented

**âœ" Deployment & Infrastructure**
- [ ] Environment variables secured in Vercel
- [ ] Different secrets per environment (dev/prod)
- [ ] Database backups enabled (Supabase default)
- [ ] SSL certificate valid and auto-renewing
- [ ] DNS configured with CAA records

---

### Ongoing Security Practices

**Daily (2 minutes):**

- **Monitor security alerts**  
  Check your email for Vercel notifications about errors, downtime, or deployment failures.  
  Quick glance at Vercel dashboard (vercel.com/dashboard) to see if error rate is normal.

- **Review failed login attempts**  
  Check your security logs table in Supabase for any unusual patterns of failed logins.  
  If same IP has 10+ failed attempts, investigate or consider blocking.

- **Check API rate limit hits**  
  Review Vercel logs for 429 (rate limit) errors to ensure legitimate users aren't being blocked.  
  Also check Claude/DeepSeek API usage in their dashboards to avoid surprise bills.

---

**Weekly (10 minutes):**

- **Review security logs**  
  Query your database: `SELECT * FROM security_logs WHERE timestamp > NOW() - INTERVAL '7 days'`  
  Look for suspicious patterns: multiple failed logins, unauthorized access attempts, unusual times/locations.

- **Analyze fraud detection alerts**  
  Check CreditUsage table for users with high deletion rates (>50% responses deleted).  
  Review SentimentUsage for unusual patterns like analyzing then immediately deleting reviews.

- **Check for unusual credit usage patterns**  
  Query users who consumed >80% of credits in <24 hours or generated 10+ regenerations per review.  
  Flag accounts for manual review if patterns look like abuse rather than legitimate use.

---

**Monthly (30 minutes):**

- **Review user access patterns**  
  Export user login data to see geographic distribution and identify suspicious access (e.g., same account from US and Russia in same day).  
  Check for dormant accounts that suddenly became very active (possible account takeover).

- **Update dependencies (npm audit)**  
  Run `npm audit` in your project directory to check for vulnerable packages.  
  Update packages with `npm audit fix` or manually update critical vulnerabilities, then test and deploy.

- **Test backup restoration**  
  Go to Supabase dashboard → Backups → Download a backup.  
  Try restoring to a test database to ensure backups work and you know the process.

---

**Quarterly (1 hour):**

- **Rotate API keys**  
  Follow the rotation procedure in "Complete Manual Steps" section above.  
  Rotate Claude API key, DeepSeek API key, and optionally JWT_SECRET (every 90 days).

- **Security training for team**  
  If you hire team members, spend 30 minutes reviewing this security document with them.  
  Cover: password policies, API key handling, incident response procedures, and what NOT to commit to git.

- **Review and update security policies**  
  Re-read this document and check if any practices have changed or new threats emerged.  
  Update runbooks based on any incidents you experienced in the last quarter.

---

**Annually (2-4 hours):**

- **Full security audit**  
  Go through the entire Security Checklist section and verify each item is still implemented.  
  Review all environment variables, check all security headers are set, test rate limiting, verify HTTPS enforcement.

- **Penetration testing (consider third-party)**  
  Hire a security firm (e.g., Cobalt, HackerOne) to test your application for vulnerabilities (~$2,000-5,000).  
  Or do basic testing yourself: try SQL injection, XSS attacks, CSRF attacks, brute force login attempts.

- **Disaster recovery drill**  
  Simulate a complete failure: delete your production database (in staging!), then restore from backup.  
  Document how long it took and update your disaster recovery plan with learnings.

---

## Security Contacts

**Security Issues:**
- Email: security@reviewflow.com
- Response time: <24 hours for critical, <72 hours for non-critical

**Bug Bounty Program (Future):**
- Consider launching in Phase 2+ once user base grows
- Responsible disclosure policy

---

## Complete Manual Steps Reference

This section summarizes **ALL manual tasks** required for security implementation. Use this as your checklist.

### ONE-TIME SETUP (Before Launch)

#### 1. Generate and Store Secrets (30 minutes)

**Generate JWT Secret:**
```bash
# Run in terminal:
openssl rand -base64 32

# Copy output, add to:
# - .env.local: JWT_SECRET="output-here"
# - Vercel: Settings → Environment Variables → JWT_SECRET
```

**Generate different secrets for each environment:**
```bash
# Development
openssl rand -base64 32  # Add to .env.local

# Production  
openssl rand -base64 32  # Add to Vercel (Production)

# Staging (optional)
openssl rand -base64 32  # Add to Vercel (Preview)
```

**Add API Keys:**
```bash
# Get from providers:
# - Claude: https://console.anthropic.com/account/keys
# - DeepSeek: https://platform.deepseek.com/api_keys

# Add to .env.local and Vercel:
ANTHROPIC_API_KEY="sk-ant-..."
DEEPSEEK_API_KEY="sk-..."
```

---

#### 2. Create OAuth App (30 minutes)

**Google OAuth Setup:**

```
Step 1: Create Project
- Go to: https://console.cloud.google.com
- Create new project: "ReviewFlow"

Step 2: Enable APIs
- APIs & Services → Library
- Search "Google+ API" → Enable

Step 3: Configure Consent Screen
- OAuth consent screen
- User Type: External
- App Name: ReviewFlow
- User support email: your@email.com
- Developer contact: your@email.com
- Scopes: email, profile (default)
- Save

Step 4: Create OAuth Credentials
- Credentials → Create Credentials → OAuth 2.0 Client ID
- Application type: Web application
- Name: ReviewFlow Production
- Authorized redirect URIs:
  * http://localhost:3000/api/auth/callback/google (development)
  * https://reviewflow.com/api/auth/callback/google (production)
- Create

Step 5: Copy Credentials
- Copy Client ID
- Copy Client Secret
- Add to .env.local and Vercel:
  GOOGLE_CLIENT_ID="..."
  GOOGLE_CLIENT_SECRET="..."
  NEXTAUTH_URL="https://reviewflow.com"
```

---

#### 3. Configure Vercel Monitoring (5 minutes)

```
1. Go to Vercel project settings
2. Click "Notifications"
3. Enable:
   ✅ Deployment errors
   ✅ Runtime errors  
   ✅ Build failures
4. Add your email address
5. Save
```

---

#### 4. Security Pre-Launch Checklist (30 minutes)

**Review this checklist before deploying:**

```
Authentication & Authorization:
□ Passwords hashed with bcrypt (cost factor 12)
□ JWT_SECRET is strong (>256 bits) and in environment variables
□ Email verification required before account access
□ Password reset tokens expire after 1 hour
□ OAuth implementation configured
□ All API endpoints verify authentication
□ All data access verifies user ownership
□ Brute force protection enabled (5 attempts / 15 min)

Data Protection:
□ HTTPS enforced (no HTTP access)
□ Security headers configured
□ Database encryption at rest enabled (Supabase default)
□ API keys stored in environment variables
□ No sensitive data logged
□ Input validation with Zod schemas
□ .env.local added to .gitignore

API Security:
□ Rate limiting configured
□ CORS policy set
□ XSS prevention implemented
□ CSRF protection via SameSite cookies

Session Management:
□ Sessions use httpOnly, secure, sameSite cookies
□ Sessions expire after 30 days
□ Sessions stored in database
□ Expired sessions cleaned up automatically

Environment Variables:
□ All secrets in Vercel (not in code)
□ Different secrets per environment
□ .env.local not committed to git
```

---

### ONGOING MAINTENANCE

#### 1. API Key Rotation (Every 90 Days - 10 minutes)

**Calendar Reminder: Set quarterly reminder**

```bash
# Every 90 days, rotate API keys:

# 1. Generate new keys (5 min)
# - Go to anthropic.com/account/keys → Generate new key
# - Go to deepseek.com/api-keys → Generate new key

# 2. Update Vercel (3 min)
# Settings → Environment Variables
# - Rename ANTHROPIC_API_KEY to ANTHROPIC_API_KEY_DEPRECATED
# - Add new ANTHROPIC_API_KEY with new key
# - Same for DeepSeek

# 3. Deploy (1 min)
# - Trigger new deployment in Vercel

# 4. Set reminder (1 min)
# - Calendar: "Remove deprecated API keys" (7 days from now)

# [7 days later - 2 min]
# 5. Clean up
# - Remove ANTHROPIC_API_KEY_DEPRECATED
# - Remove DEEPSEEK_API_KEY_DEPRECATED
# - Deploy again
```

---

#### 2. Secret Rotation (Every 90 Days - 10 minutes)

**Calendar Reminder: Set quarterly reminder (optional but recommended)**

```bash
# Rotate JWT_SECRET:

# 1. Generate new secret
openssl rand -base64 32

# 2. Add to Vercel as JWT_SECRET_NEW
# (Keep old JWT_SECRET temporarily)

# 3. Update code to try both secrets during transition
# (For graceful key rotation)

# 4. Deploy

# 5. Wait 30 days (all JWTs expire)

# 6. Remove old JWT_SECRET
# 7. Rename JWT_SECRET_NEW to JWT_SECRET
# 8. Deploy again

# OAuth secrets (optional - every 12 months):
# Similar process, but can wait longer
```

---

#### 3. Monitoring & Log Review

**Daily (2 minutes):**
```
□ Check email for Vercel alerts
□ Glance at error dashboard
□ Quick scan for anomalies
```

**Weekly (10 minutes):**
```
□ Review error logs in Vercel dashboard
□ Check security event logs
□ Look for unusual patterns:
  - Failed login spikes
  - Unusual credit usage
  - High deletion rates
□ Review API usage costs
```

**Monthly (30 minutes):**
```
□ Detailed security log review
□ Check for fraud patterns
□ Review credit usage analytics
□ Update security runbook if needed
□ Check dependency updates (npm audit)
```

**Quarterly (1 hour):**
```
□ Rotate API keys (see above)
□ Rotate secrets (optional)
□ Review security policies
□ Test backup restoration
□ Update security documentation
```

---

#### 4. Incident Response (As Needed)

**When Vercel alerts you or you detect an issue:**

```
P0 - CRITICAL (Fix immediately):
□ Service completely down
□ Data breach detected
□ Payment system broken

Actions:
1. Check Vercel dashboard
2. Review recent deployments
3. Rollback if needed
4. Follow incident runbook (from document)
5. Document incident afterwards

P1 - HIGH (Fix within hours):
□ Fraud detected
□ Unauthorized access attempts
□ API keys potentially leaked

Actions:
1. Investigate logs
2. Suspend account if needed (fraud)
3. Rotate keys if compromised
4. Document findings

P2/P3 - MEDIUM/LOW (Fix within days):
□ Performance issues
□ Minor bugs
□ UI problems

Actions:
1. Add to backlog
2. Schedule fix
3. Deploy during normal cycle
```

---

### OPTIONAL SETUP

#### Consent Management (1 hour - Only if sending marketing emails)

**Skip this for Phase 1 MVP if you're not sending marketing!**

**If you decide to add later:**

```bash
# 1. Add database fields (5 min)
# Add to User model in schema.prisma:
marketingOptIn    Boolean  @default(false)
consentUpdatedAt  DateTime?

# Run migration:
npx prisma migrate dev --name add_consent

# 2. Add signup checkbox (15 min)
# Add to signup form:
<Checkbox>
  Send me product updates (optional)
</Checkbox>

# 3. Build settings page (30 min)
# Allow users to change consent:
Settings → Privacy → Toggle consent

# 4. Check before sending (10 min)
# Before marketing emails:
const users = await prisma.user.findMany({
  where: { marketingOptIn: true }
})
```

---

## Time Investment Summary

### One-Time Setup (Before Launch):
| Task | Time | When |
|------|------|------|
| Generate & store secrets | 30 min | Before first deployment |
| Create OAuth app | 30 min | Before adding Google login |
| Configure Vercel monitoring | 5 min | Before launch |
| Security checklist review | 30 min | Before production deploy |
| **TOTAL ONE-TIME** | **~2 hours** | **Before launch** |

### Ongoing Maintenance:
| Task | Time | Frequency |
|------|------|-----------|
| Check monitoring | 2 min | Daily |
| Review logs | 10 min | Weekly |
| Detailed review | 30 min | Monthly |
| API key rotation | 10 min | Every 90 days |
| Secret rotation | 10 min | Every 90 days (optional) |
| **TOTAL ONGOING** | **~30 min/week** | **+ 20 min/quarter for rotations** |

### Optional:
| Task | Time | When |
|------|------|------|
| Consent management | 1 hour | Only if sending marketing |

---

## Quick Reference Commands

**Generate Secrets:**
```bash
openssl rand -base64 32
```

**Check Logs:**
```bash
# Via Vercel dashboard:
vercel logs [deployment-url]
```

**Rotate Keys Process:**
```
1. Generate new → 2. Add as _NEW → 3. Deploy → 4. Wait 7 days → 5. Remove old → 6. Deploy
```

**Emergency Contacts:**
- Security issues: security@reviewflow.com
- Vercel support: vercel.com/support
- Anthropic support: support@anthropic.com

---

## Automation Status

**✅ Fully Automated (No Manual Work After Setup):**
- Password hashing
- JWT generation/verification
- Session management
- Rate limiting
- Input validation
- XSS/SQL injection prevention
- CSRF protection
- Error logging
- Security event logging
- OAuth flow
- Credit deduction transactions
- Audit trail creation

**✋ Requires Manual Work:**
- Secret generation (one-time)
- Environment variable setup (one-time)
- OAuth app creation (one-time)
- API key rotation (quarterly)
- Secret rotation (quarterly, optional)
- Log monitoring (weekly)
- Incident response (as needed)

---

**Next Steps After Reading This Document:**
1. ✅ Complete one-time setup (2 hours)
2. ✅ Set quarterly reminders for key rotation
3. ✅ Set up daily/weekly monitoring routine
4. ✅ Keep this document handy for reference

---

## Document Status

**Version:** 1.1  
**Status:** ✅ Ready for Development  
**Last Reviewed:** January 7, 2026  
**Last Updated:** January 7, 2026 (Added Complete Manual Steps Reference)  
**Next Review:** After MVP launch (Week 4)

**Related Documents:**
- See `08_GDPR_COMPLIANCE.md` for detailed GDPR implementation
- See `05_API_CONTRACTS.md` for endpoint-specific security requirements
- See `04_DATA_MODEL.md` for data access control patterns
- See `02_PRD_MVP_PHASE1.md` for feature-specific security notes

---

**This security document is comprehensive and production-ready for Phase 1 MVP.** 🔒
