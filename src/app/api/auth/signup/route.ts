import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/tokens";
import { loginRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(loginRateLimit, `signup:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Don't reveal if email exists for security
      // But we still need to prevent duplicate accounts
      if (existingUser.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "EMAIL_EXISTS",
              message: "An account with this email already exists",
            },
          },
          { status: 409, headers: rateLimitResult.headers }
        );
      }

      // User exists but not verified - allow re-registration
      // Delete the old unverified user
      await prisma.user.delete({
        where: { id: existingUser.id },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calculate reset date as 30 days from now (anniversary-based billing)
    const resetDate = new Date();
    resetDate.setUTCDate(resetDate.getUTCDate() + 30);
    resetDate.setUTCHours(0, 0, 0, 0);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        credits: 15,
        tier: "FREE",
        sentimentCredits: 35,
        creditsResetDate: resetDate,
        sentimentResetDate: resetDate,
      },
    });

    // Create default brand voice
    await prisma.brandVoice.create({
      data: {
        userId: user.id,
        tone: "professional",
        formality: 3,
        keyPhrases: ["Thank you", "We appreciate your feedback"],
        styleNotes: "Be genuine and empathetic",
      },
    });

    // Create verification token
    const verificationToken = await createVerificationToken(email.toLowerCase());

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email.toLowerCase(),
      verificationToken
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Don't fail the signup, but log the error
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "Account created successfully. Please check your email to verify your account.",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      },
      { status: 201, headers: rateLimitResult.headers }
    );
  } catch (error) {
    console.error("Signup error:", error);
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
