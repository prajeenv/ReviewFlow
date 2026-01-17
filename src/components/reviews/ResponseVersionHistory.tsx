"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, History, Clock, Sparkles } from "lucide-react";

interface Version {
  id: string;
  responseText: string;
  toneUsed: string;
  creditsUsed: number;
  isEdited: boolean;
  createdAt: string;
}

interface ResponseVersionHistoryProps {
  versions: Version[];
  textDirection?: "ltr" | "rtl";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MAX_LINES = 3;

// Helper to check if text needs "show more" (more than MAX_LINES lines or > 150 chars)
function needsExpansion(text: string): boolean {
  const lineCount = (text.match(/\n/g) || []).length + 1;
  return lineCount > MAX_LINES || text.length > 150;
}

// Truncate text to MAX_LINES lines while preserving line breaks
function truncateText(text: string): string {
  const lines = text.split('\n');
  if (lines.length > MAX_LINES) {
    return lines.slice(0, MAX_LINES).join('\n') + '...';
  }
  if (text.length > 150) {
    return text.substring(0, 150) + '...';
  }
  return text;
}

export function ResponseVersionHistory({
  versions,
  textDirection = "ltr",
}: ResponseVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  if (versions.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between p-2 h-auto"
        >
          <span className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Version History ({versions.length})
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-2">
        {versions.map((version) => {
          const isExpanded = expandedVersionId === version.id;

          return (
            <div
              key={version.id}
              className="border rounded-lg p-3 bg-muted/30 space-y-2"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {version.isEdited ? (
                    /* Edited version: only show Edited badge */
                    <Badge variant="outline" className="text-xs">Edited</Badge>
                  ) : (
                    /* Generated version: show Generated badge, tone, and credit */
                    <>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Generated
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {version.toneUsed}
                      </Badge>
                      {version.creditsUsed > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {version.creditsUsed} credit{version.creditsUsed !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(version.createdAt)}
                </span>
              </div>

              {/* Content */}
              <div
                className="text-sm text-muted-foreground whitespace-pre-wrap"
                dir={textDirection}
              >
                {isExpanded ? version.responseText : truncateText(version.responseText)}
              </div>

              {/* Actions */}
              {needsExpansion(version.responseText) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    setExpandedVersionId(isExpanded ? null : version.id)
                  }
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
