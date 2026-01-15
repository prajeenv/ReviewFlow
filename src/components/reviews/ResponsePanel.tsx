"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sparkles,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Clock,
} from "lucide-react";
import { ResponseEditor } from "./ResponseEditor";
import { ToneModifier } from "./ToneModifier";
import { ResponseVersionHistory } from "./ResponseVersionHistory";
import { CREDIT_COSTS } from "@/lib/constants";

interface ResponseVersion {
  id: string;
  responseText: string;
  toneUsed: string;
  creditsUsed: number;
  createdAt: string;
}

interface Response {
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
  versions: ResponseVersion[];
}

interface ResponsePanelProps {
  reviewId: string;
  response: Response | null;
  textDirection?: "ltr" | "rtl";
  onResponseUpdate?: () => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResponsePanel({
  reviewId,
  response,
  textDirection = "ltr",
  onResponseUpdate,
}: ResponsePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localResponse, setLocalResponse] = useState<Response | null>(response);

  // Update local response when prop changes
  if (response?.responseText !== localResponse?.responseText && !isEditing) {
    setLocalResponse(response);
  }

  const handleCopy = async () => {
    if (!localResponse) return;
    try {
      await navigator.clipboard.writeText(localResponse.responseText);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSaveEdit = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: text }),
      });

      const result = await res.json();

      if (result.success) {
        setLocalResponse((prev) =>
          prev
            ? {
                ...prev,
                responseText: result.data.response.responseText,
                isEdited: result.data.response.isEdited,
                editedAt: result.data.response.editedAt,
              }
            : null
        );
        setIsEditing(false);
        toast.success("Response updated!");
        onResponseUpdate?.();
      } else {
        toast.error(result.error?.message || "Failed to update response");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (tone: "professional" | "friendly" | "empathetic") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      });

      const result = await res.json();

      if (result.success) {
        setLocalResponse((prev) =>
          prev
            ? {
                ...prev,
                responseText: result.data.response.responseText,
                toneUsed: result.data.response.toneUsed,
                isEdited: false,
                editedAt: null,
                versions: [
                  {
                    id: `new-${Date.now()}`,
                    responseText: result.data.response.responseText,
                    toneUsed: result.data.response.toneUsed,
                    creditsUsed: CREDIT_COSTS.REGENERATE_RESPONSE,
                    createdAt: new Date().toISOString(),
                  },
                  ...prev.versions,
                ],
              }
            : null
        );
        toast.success(`Response regenerated with ${tone} tone!`);
        onResponseUpdate?.();
      } else {
        toast.error(result.error?.message || "Failed to regenerate response");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/publish`, {
        method: "POST",
      });

      const result = await res.json();

      if (result.success) {
        setLocalResponse((prev) =>
          prev
            ? {
                ...prev,
                isPublished: true,
                publishedAt: result.data.response.publishedAt,
              }
            : null
        );
        toast.success("Response marked as approved!");
        onResponseUpdate?.();
      } else {
        toast.error(result.error?.message || "Failed to approve response");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        setLocalResponse(null);
        setShowDeleteDialog(false);
        toast.success("Response deleted");
        onResponseUpdate?.();
      } else {
        toast.error(result.error?.message || "Failed to delete response");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (version: ResponseVersion) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: version.responseText }),
      });

      const result = await res.json();

      if (result.success) {
        setLocalResponse((prev) =>
          prev
            ? {
                ...prev,
                responseText: result.data.response.responseText,
                isEdited: result.data.response.isEdited,
                editedAt: result.data.response.editedAt,
              }
            : null
        );
        toast.success("Version restored!");
        onResponseUpdate?.();
      } else {
        toast.error(result.error?.message || "Failed to restore version");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state - no response
  if (!localResponse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No response generated yet.
            </p>
            <Button asChild className="mt-4">
              <a href={`/dashboard/reviews/${reviewId}/generate`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Response
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Response
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          {localResponse.isPublished && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Approved
            </Badge>
          )}
          {localResponse.isEdited && (
            <Badge variant="outline">Edited</Badge>
          )}
          <Badge variant="outline">{localResponse.toneUsed} tone</Badge>
        </div>

        {/* Response content or editor */}
        {isEditing ? (
          <ResponseEditor
            initialText={localResponse.responseText}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
            textDirection={textDirection}
          />
        ) : (
          <>
            {/* Response text */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                dir={textDirection}
              >
                {localResponse.responseText}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isLoading}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <ToneModifier
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
                currentTone={localResponse.toneUsed}
                creditsNeeded={CREDIT_COSTS.REGENERATE_RESPONSE}
              />
              {!localResponse.isPublished && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive ml-auto"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </>
        )}

        <Separator />

        {/* Metadata */}
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Generated</p>
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(localResponse.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits Used</p>
            <p>{localResponse.creditsUsed}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Model</p>
            <p className="truncate">{localResponse.generationModel}</p>
          </div>
        </div>

        {/* Version history */}
        {localResponse.versions.length > 0 && (
          <>
            <Separator />
            <ResponseVersionHistory
              versions={localResponse.versions}
              currentResponseText={localResponse.responseText}
              textDirection={textDirection}
              onRestoreVersion={handleRestoreVersion}
            />
          </>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this response? This action cannot
              be undone. All version history will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
