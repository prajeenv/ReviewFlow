import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken, isTokenValid } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validations";
import { loginRateLimit, getClientIP, checkRateLimit } from "@/lib/rate-limit";

// GET - Validate token is valid (for pre-flight check)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "Reset token is required",
          },
        },
        { status: 400 }
      );
    }

    const valid = await isTokenValid(token);

    return NextResponse.json(
      {
        success: true,
        data: { valid },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// POST - Reset password with token
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(
      loginRateLimit,
      `password-reset-confirm:${ip}`
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
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

    const { token, password } = validation.data;

    // Verify and consume token
    const result = await verifyPasswordResetToken(token);

    if (!result.success || !result.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: result.error || "Invalid or expired reset token",
          },
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: result.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404, headers: rateLimitResult.headers }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: result.email },
      data: {
        password: hashedPassword,
        // Also verify email if not already (password reset implies ownership)
        emailVerified: user.emailVerified || new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Password reset successfully. You can now log in with your new password.",
        },
      },
      { status: 200, headers: rateLimitResult.headers }
    );
  } catch (error) {
    console.error("Password reset confirmation error:", error);
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
