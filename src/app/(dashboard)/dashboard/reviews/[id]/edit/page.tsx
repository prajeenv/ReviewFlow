"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewForm } from "@/components/reviews";

interface ReviewData {
  id: string;
  platform: string;
  reviewText: string;
  rating: number | null;
  reviewerName: string | null;
  reviewDate: string | null;
  detectedLanguage: string;
}

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(`/api/reviews/${id}`);
        const result = await response.json();

        if (result.success) {
          setReview(result.data.review);
        } else {
          toast.error(result.error?.message || "Failed to load review");
          if (result.error?.code === "NOT_FOUND") {
            router.push("/dashboard/reviews");
          }
        }
      } catch {
        toast.error("Failed to load review");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReview();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Review not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/reviews">Back to Reviews</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/reviews/${review.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Review
        </Link>
      </Button>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Edit Review
        </h1>
        <p className="text-muted-foreground">
          Update the review details below.
        </p>
      </div>

      {/* Review form */}
      <div className="max-w-2xl">
        <ReviewForm mode="edit" initialData={review} />
      </div>
    </div>
  );
}
