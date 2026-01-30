"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getNextResetDate } from "@/lib/utils";

interface LowCreditWarningProps {
  creditsRemaining: number;
  creditsTotal: number;
  tier: string;
  resetDate?: string;
}

export function LowCreditWarning({
  creditsRemaining,
  creditsTotal,
  tier,
  resetDate,
}: LowCreditWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show warning if credits are low (< 3) and not dismissed
  if (isDismissed || creditsRemaining >= 3) {
    return null;
  }

  const isOutOfCredits = creditsRemaining === 0;

  const nextResetDate = getNextResetDate(resetDate);
  const formattedResetDate = nextResetDate
    ? nextResetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Alert
      variant="destructive"
      className={`relative ${isOutOfCredits ? "border-red-500 bg-red-50 dark:bg-red-950/50" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"}`}
    >
      <AlertTriangle className={`h-4 w-4 ${isOutOfCredits ? "text-red-600" : "text-yellow-600"}`} />
      <AlertTitle className={`${isOutOfCredits ? "text-red-800 dark:text-red-200" : "text-yellow-800 dark:text-yellow-200"}`}>
        {isOutOfCredits ? "Out of Credits" : "Running Low on Credits"}
      </AlertTitle>
      <AlertDescription className={`${isOutOfCredits ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {isOutOfCredits ? (
              <p>
                You&apos;ve used all your credits.{" "}
                {formattedResetDate && (
                  <span>Resets on {formattedResetDate}.</span>
                )}
              </p>
            ) : (
              <p>
                You have only <strong>{creditsRemaining}</strong> of{" "}
                <strong>{creditsTotal}</strong> credits remaining.{" "}
                {formattedResetDate && (
                  <span>Resets on {formattedResetDate}.</span>
                )}
              </p>
            )}
            {tier === "FREE" && (
              <p className="mt-1 text-sm">
                Upgrade to get more credits and unlock additional features.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isOutOfCredits ? "default" : "outline"}
              asChild
              className={isOutOfCredits ? "" : "border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-200 dark:hover:bg-yellow-950"}
            >
              <Link href="/pricing">
                Upgrade Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-70 hover:opacity-100"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}
