import { prisma } from "./prisma";
import { EMAIL_CONFIG } from "./constants";
import crypto from "crypto";

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a verification token for email verification
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(
    Date.now() + EMAIL_CONFIG.VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
  );

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(
    Date.now() + EMAIL_CONFIG.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000
  );

  // Use identifier with prefix to distinguish from verification tokens
  const identifier = `password-reset:${email}`;

  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify and consume a verification token
 */
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    return { success: false, error: "Invalid verification token" };
  }

  // Check if it's an email verification token (not password reset)
  if (tokenRecord.identifier.startsWith("password-reset:")) {
    return { success: false, error: "Invalid verification token" };
  }

  if (tokenRecord.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false, error: "Verification token has expired" };
  }

  // Delete the token (single use)
  await prisma.verificationToken.delete({
    where: { token },
  });

  return { success: true, email: tokenRecord.identifier };
}

/**
 * Verify and consume a password reset token
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    return { success: false, error: "Invalid reset token" };
  }

  // Check if it's a password reset token
  if (!tokenRecord.identifier.startsWith("password-reset:")) {
    return { success: false, error: "Invalid reset token" };
  }

  if (tokenRecord.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false, error: "Reset token has expired" };
  }

  // Delete the token (single use)
  await prisma.verificationToken.delete({
    where: { token },
  });

  // Extract email from identifier
  const email = tokenRecord.identifier.replace("password-reset:", "");

  return { success: true, email };
}

/**
 * Check if a token exists and is valid (without consuming it)
 */
export async function isTokenValid(token: string): Promise<boolean> {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord) {
    return false;
  }

  return tokenRecord.expires > new Date();
}
