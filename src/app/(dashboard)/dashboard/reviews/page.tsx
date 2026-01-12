"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewList } from "@/components/reviews";

function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Cards skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Reviews
          </h1>
          <p className="text-muted-foreground">
            Manage your customer reviews and AI-generated responses.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reviews/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Review
          </Link>
        </Button>
      </div>

      {/* Reviews list with suspense */}
      <Suspense fallback={<ReviewListSkeleton />}>
        <ReviewList />
      </Suspense>
    </div>
  );
}
