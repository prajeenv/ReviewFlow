"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VerificationStatus = "loading" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setStatus("success");
          setMessage(result.data.message);
        } else {
          setStatus("error");
          setMessage(result.error?.message || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage(result.data.message);
      } else {
        setResendMessage(result.error?.message || "Failed to resend email");
      }
    } catch {
      setResendMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push("/auth/signin")}>
            Sign in to your account
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Enter your email to receive a new verification link:
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleResendVerification} disabled={isResending}>
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Resend"
              )}
            </Button>
          </div>
          {resendMessage && (
            <p className="text-sm text-center text-muted-foreground">
              {resendMessage}
            </p>
          )}
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // no-token state
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Enter your email address to receive a verification link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleResendVerification} disabled={isResending}>
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
        {resendMessage && (
          <p className="text-sm text-center text-muted-foreground">
            {resendMessage}
          </p>
        )}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-sm text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
