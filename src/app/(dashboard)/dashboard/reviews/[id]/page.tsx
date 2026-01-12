"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  Globe,
  Clock,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTextDirection } from "@/lib/language-detection";

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

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
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
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{review.platform}</Badge>
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
              <CardTitle className="text-xl">Review Details</CardTitle>
            </div>
            <div className="flex items-center gap-2">
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
        <CardContent className="space-y-6">
          {/* Rating */}
          {review.rating && (
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < review.rating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground">
                ({review.rating}/5)
              </span>
            </div>
          )}

          {/* Review text */}
          <div className="space-y-2">
            <h3 className="font-medium">Review</h3>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              dir={textDirection}
            >
              {review.reviewText}
            </p>
          </div>

          {/* Reviewer info */}
          {review.reviewerName && (
            <p className="text-sm text-muted-foreground">
              - {review.reviewerName}
            </p>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Added</p>
              <p className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(review.createdAt)}
              </p>
            </div>
            {review.reviewDate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Review Date</p>
                <p className="text-sm">
                  {new Date(review.reviewDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {review.externalUrl && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">External Link</p>
                <a
                  href={review.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View original <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Response
            </CardTitle>
            {!review.response && (
              <Button asChild>
                <Link href={`/dashboard/reviews/${review.id}/generate`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Response
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {review.response ? (
            <div className="space-y-4">
              {/* Response status badges */}
              <div className="flex flex-wrap items-center gap-2">
                {review.response.isPublished && (
                  <Badge variant="secondary">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Published
                  </Badge>
                )}
                {review.response.isEdited && (
                  <Badge variant="outline">Edited</Badge>
                )}
                <Badge variant="outline">{review.response.toneUsed} tone</Badge>
              </div>

              {/* Response text */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dir={textDirection}
                >
                  {review.response.responseText}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(review.response!.responseText)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate (Coming Soon)
                </Button>
              </div>

              <Separator />

              {/* Response metadata */}
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p>{formatDate(review.response.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credits Used</p>
                  <p>{review.response.creditsUsed}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="truncate">{review.response.generationModel}</p>
                </div>
              </div>

              {/* Version history */}
              {review.response.versions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Version History</h4>
                    <div className="space-y-2">
                      {review.response.versions.map((version) => (
                        <div
                          key={version.id}
                          className="text-xs p-2 rounded border"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {version.toneUsed}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                          <p className="line-clamp-2" dir={textDirection}>
                            {version.responseText}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No response generated yet. Click the button above to create an
                AI-powered response.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
