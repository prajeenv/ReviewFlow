import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/tokens";
import { loginRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      loginRateLimit,
      `resend-verification:${ip}`
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = resendSchema.safeParse(body);
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
    if (!user || user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          data: {
            message:
              "If an unverified account exists with this email, a verification link has been sent.",
          },
        },
        { status: 200, headers: rateLimitResult.headers }
      );
    }

    // Create new verification token
    const verificationToken = await createVerificationToken(email.toLowerCase());

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email.toLowerCase(),
      verificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "If an unverified account exists with this email, a verification link has been sent.",
        },
      },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
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
