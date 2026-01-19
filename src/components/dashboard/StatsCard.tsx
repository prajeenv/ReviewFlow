"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    trend?.value && trend.value > 0
      ? TrendingUp
      : trend?.value && trend.value < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.value && trend.value > 0
      ? "text-green-600"
      : trend?.value && trend.value < 0
      ? "text-red-600"
      : "text-muted-foreground";

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn("flex items-center text-xs font-medium", trendColor)}>
                <TrendIcon className="mr-1 h-3 w-3" />
                {Math.abs(trend.value)}%
                {trend.label && <span className="ml-1">{trend.label}</span>}
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuotaCardProps {
  title: string;
  used: number;
  total: number;
  resetDate?: Date | string;
  icon?: LucideIcon;
  className?: string;
  isLoading?: boolean;
}

interface SentimentDistributionProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  className?: string;
  isLoading?: boolean;
}

export function SentimentDistributionCard({
  positive,
  neutral,
  negative,
  total,
  className,
  isLoading = false,
}: SentimentDistributionProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = total > 0;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Sentiment Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            {/* Stacked bar chart */}
            <div className="flex h-6 w-full overflow-hidden rounded-full bg-secondary">
              {positive > 0 && (
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${positive}%` }}
                  title={`Positive: ${positive}%`}
                />
              )}
              {neutral > 0 && (
                <div
                  className="bg-gray-400 transition-all duration-300"
                  style={{ width: `${neutral}%` }}
                  title={`Neutral: ${neutral}%`}
                />
              )}
              {negative > 0 && (
                <div
                  className="bg-red-500 transition-all duration-300"
                  style={{ width: `${negative}%` }}
                  title={`Negative: ${negative}%`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Positive</span>
                <span className="font-medium">{positive}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span className="text-muted-foreground">Neutral</span>
                <span className="font-medium">{neutral}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Negative</span>
                <span className="font-medium">{negative}%</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Based on {total} analyzed review{total !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No sentiment data yet. Add reviews to see distribution.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function QuotaCard({
  title,
  used,
  total,
  resetDate,
  icon: Icon,
  className,
  isLoading = false,
}: QuotaCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const remaining = total - used;
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const isLow = percentage >= 80;
  const isEmpty = remaining <= 0;

  const formattedResetDate = resetDate
    ? new Date(resetDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-2xl font-bold",
              isEmpty && "text-destructive",
              isLow && !isEmpty && "text-yellow-600"
            )}
          >
            {remaining}
          </span>
          <span className="text-sm text-muted-foreground">/ {total}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full transition-all duration-300",
              isEmpty
                ? "bg-destructive"
                : isLow
                ? "bg-yellow-500"
                : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {formattedResetDate && (
          <p className="mt-2 text-xs text-muted-foreground">
            Resets on {formattedResetDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
