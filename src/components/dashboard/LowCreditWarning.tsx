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
  // Sentiment credit props (optional for backward compatibility)
  sentimentRemaining?: number;
  sentimentTotal?: number;
  sentimentResetDate?: string;
}

type WarningType =
  | "none"
  | "response_low"
  | "response_out"
  | "sentiment_low"
  | "sentiment_out"
  | "both_low"
  | "response_out_sentiment_low"
  | "response_low_sentiment_out"
  | "both_out";

function getWarningState(
  responseCredits: number,
  sentimentCredits: number | undefined
): { type: WarningType; isRed: boolean } {
  const responseOk = responseCredits >= 3;
  const responseLow = responseCredits > 0 && responseCredits < 3;
  const responseOut = responseCredits === 0;

  const sentimentOk = sentimentCredits === undefined || sentimentCredits >= 3;
  const sentimentLow =
    sentimentCredits !== undefined && sentimentCredits > 0 && sentimentCredits < 3;
  const sentimentOut = sentimentCredits !== undefined && sentimentCredits === 0;

  // Priority-based determination - Red when response credits = 0
  if (responseOk && sentimentOk) return { type: "none", isRed: false };
  if (responseOut && sentimentOut) return { type: "both_out", isRed: true };
  if (responseOut && sentimentLow)
    return { type: "response_out_sentiment_low", isRed: true };
  if (responseOut) return { type: "response_out", isRed: true };
  if (responseLow && sentimentOut)
    return { type: "response_low_sentiment_out", isRed: true };
  if (sentimentOut) return { type: "sentiment_out", isRed: false };
  if (responseLow && sentimentLow) return { type: "both_low", isRed: false };
  if (responseLow) return { type: "response_low", isRed: false };
  if (sentimentLow) return { type: "sentiment_low", isRed: false };

  return { type: "none", isRed: false };
}

function getWarningTitle(type: WarningType): string {
  switch (type) {
    case "response_low":
      return "Running Low on Response Credits";
    case "response_out":
      return "Out of Response Credits";
    case "sentiment_low":
      return "Running Low on Sentiment Credits";
    case "sentiment_out":
      return "Out of Sentiment Credits";
    case "both_low":
      return "Running Low on Credits";
    case "response_out_sentiment_low":
      return "Out of Response Credits";
    case "response_low_sentiment_out":
      return "Out of Sentiment Credits";
    case "both_out":
      return "Out of Credits";
    default:
      return "";
  }
}

export function LowCreditWarning({
  creditsRemaining,
  creditsTotal,
  tier,
  resetDate,
  sentimentRemaining,
  sentimentTotal,
  sentimentResetDate,
}: LowCreditWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { type: warningType, isRed } = getWarningState(
    creditsRemaining,
    sentimentRemaining
  );

  // Don't show if no warning or dismissed
  if (isDismissed || warningType === "none") {
    return null;
  }

  const title = getWarningTitle(warningType);

  // Use the earlier reset date when both types have issues
  const responseResetDate = getNextResetDate(resetDate);
  const sentimentReset = getNextResetDate(sentimentResetDate);

  let nextResetDate: Date | null = null;
  if (responseResetDate && sentimentReset) {
    nextResetDate =
      responseResetDate < sentimentReset ? responseResetDate : sentimentReset;
  } else {
    nextResetDate = responseResetDate || sentimentReset;
  }

  const formattedResetDate = nextResetDate
    ? nextResetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Render message based on warning type
  const renderMessage = () => {
    switch (warningType) {
      case "response_out":
        return (
          <p>
            You&apos;ve used all your response credits.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "response_low":
        return (
          <p>
            You have only <strong>{creditsRemaining}</strong> of{" "}
            <strong>{creditsTotal}</strong> response credits remaining.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "sentiment_out":
        return (
          <p>
            You&apos;ve used all your sentiment analysis credits.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "sentiment_low":
        return (
          <p>
            You have only <strong>{sentimentRemaining}</strong> of{" "}
            <strong>{sentimentTotal}</strong> sentiment credits remaining.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "both_low":
        return (
          <p>
            Response credits: <strong>{creditsRemaining}</strong> of{" "}
            <strong>{creditsTotal}</strong>. Sentiment credits:{" "}
            <strong>{sentimentRemaining}</strong> of{" "}
            <strong>{sentimentTotal}</strong>.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "response_out_sentiment_low":
        return (
          <p>
            You&apos;ve used all response credits. Sentiment credits also running
            low ({sentimentRemaining} remaining).{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "response_low_sentiment_out":
        return (
          <p>
            Sentiment credits exhausted. Response credits also running low (
            {creditsRemaining} remaining).{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      case "both_out":
        return (
          <p>
            You&apos;ve used all your credits.{" "}
            {formattedResetDate && <span>Resets on {formattedResetDate}.</span>}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <Alert
      variant="destructive"
      className={`relative ${isRed ? "border-red-500 bg-red-50 dark:bg-red-950/50" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50"}`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${isRed ? "text-red-600" : "text-yellow-600"}`}
      />
      <AlertTitle
        className={`${isRed ? "text-red-800 dark:text-red-200" : "text-yellow-800 dark:text-yellow-200"}`}
      >
        {title}
      </AlertTitle>
      <AlertDescription
        className={`${isRed ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300"}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {renderMessage()}
            {tier === "FREE" && (
              <p className="mt-1 text-sm">
                Upgrade to get more credits and unlock additional features.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isRed ? "default" : "outline"}
              asChild
              className={
                isRed
                  ? ""
                  : "border-yellow-600 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-200 dark:hover:bg-yellow-950"
              }
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
