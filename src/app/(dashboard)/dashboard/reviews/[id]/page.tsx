"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  Globe,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTextDirection } from "@/lib/language-detection";
import { ResponsePanel } from "@/components/reviews/ResponsePanel";
import { useCredits } from "@/components/providers/CreditsProvider";
import { CREDIT_COSTS } from "@/lib/constants";

interface ReviewDetail {
  id: string;
  platform: string;
  reviewText: string;
  rating: number | null;
  reviewerName: string | null;
  reviewDate: string | null;
  detectedLanguage: string;
  sentiment: string | null;
  externalId: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  response: {
    id: string;
    responseText: string;
    isEdited: boolean;
    editedAt: string | null;
    creditsUsed: number;
    toneUsed: string;
    generationModel: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    versions: Array<{
      id: string;
      responseText: string;
      toneUsed: string;
      creditsUsed: number;
      createdAt: string;
    }>;
  } | null;
}

function getSentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case "positive":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "negative":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "neutral":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { refreshCredits } = useCredits();

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Review deleted successfully");
        router.push("/dashboard/reviews");
      } else {
        toast.error(result.error?.message || "Failed to delete review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/reviews/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await res.json();

      if (result.success) {
        // Refresh the review data to get the new response
        const reviewRes = await fetch(`/api/reviews/${id}`);
        const reviewResult = await reviewRes.json();
        if (reviewResult.success) {
          setReview(reviewResult.data.review);
        }
        toast.success("Response generated successfully!");
        refreshCredits();
      } else {
        if (result.error?.code === "INSUFFICIENT_CREDITS") {
          toast.error(
            `Not enough credits. You have ${result.error.details?.creditsAvailable || 0} credits remaining.`
          );
        } else if (result.error?.code === "AI_SERVICE_UNAVAILABLE") {
          toast.error("AI service is temporarily unavailable. Please try again.");
        } else {
          toast.error(result.error?.message || "Failed to generate response");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-48 w-full" />
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

  const textDirection = getTextDirection(review.detectedLanguage);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/reviews">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reviews
        </Link>
      </Button>

      {/* Review card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{review.platform}</Badge>
              {review.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
              {review.sentiment && (
                <Badge className={getSentimentColor(review.sentiment)}>
                  {review.sentiment}
                </Badge>
              )}
              {review.detectedLanguage !== "English" && (
                <Badge variant="outline">
                  <Globe className="mr-1 h-3 w-3" />
                  {review.detectedLanguage}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!review.response && (
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Response
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/reviews/${review.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Review text */}
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dir={textDirection}
          >
            {review.reviewText}
          </p>

          {/* Reviewer and metadata inline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {review.reviewerName && (
              <span>By {review.reviewerName}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Added {new Date(review.createdAt).toLocaleDateString()}
            </span>
            {review.reviewDate && (
              <span>
                Review Date {new Date(review.reviewDate).toLocaleDateString()}
              </span>
            )}
            {review.externalUrl && (
              <a
                href={review.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View original <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response section */}
      <ResponsePanel
        reviewId={review.id}
        response={review.response}
        textDirection={textDirection}
        onResponseUpdate={() => {
          // Refresh review data
          fetch(`/api/reviews/${id}`)
            .then((res) => res.json())
            .then((result) => {
              if (result.success) {
                setReview(result.data.review);
              }
            });
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone. Any associated response and version history will also be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
