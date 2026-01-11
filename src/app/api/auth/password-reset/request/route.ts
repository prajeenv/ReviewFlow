import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/tokens";
import { loginRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      loginRateLimit,
      `password-reset:${ip}`
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email address",
          },
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists and has a password (not OAuth-only)
    if (user && user.password) {
      // Create password reset token
      const resetToken = await createPasswordResetToken(email.toLowerCase());

      // Send password reset email
      const emailResult = await sendPasswordResetEmail(
        email.toLowerCase(),
        resetToken
      );

      if (!emailResult.success) {
        console.error("Failed to send password reset email:", emailResult.error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "If an account exists with this email, a password reset link has been sent.",
        },
      },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
