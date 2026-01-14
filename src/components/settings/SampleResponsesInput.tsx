"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BRAND_VOICE_LIMITS } from "@/lib/constants";
import { CollapsibleTextItem } from "./CollapsibleTextItem";

interface SampleResponsesInputProps {
  value: string[];
  onChange: (_responses: string[]) => void;
  disabled?: boolean;
}

export function SampleResponsesInput({ value, onChange, disabled }: SampleResponsesInputProps) {
  const [newResponse, setNewResponse] = useState("");

  const addResponse = () => {
    const trimmed = newResponse.trim();
    if (
      trimmed &&
      trimmed.length <= BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH &&
      value.length < BRAND_VOICE_LIMITS.SAMPLE_RESPONSES_MAX
    ) {
      onChange([...value, trimmed]);
      setNewResponse("");
    }
  };

  const removeResponse = (index: number) => {
    const newResponses = [...value];
    newResponses.splice(index, 1);
    onChange(newResponses);
  };

  const updateResponse = (index: number, text: string) => {
    const newResponses = [...value];
    newResponses[index] = text;
    onChange(newResponses);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter or Cmd+Enter to add
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addResponse();
    }
  };

  const canAddMore = value.length < BRAND_VOICE_LIMITS.SAMPLE_RESPONSES_MAX;

  // Calculate dynamic rows: min 3, max 10
  const calculateRows = (text: string): number => {
    const lineCount = text.split("\n").length;
    return Math.max(3, Math.min(10, lineCount));
  };

  return (
    <div className="space-y-4">
      {/* Existing responses */}
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((response, index) => (
            <CollapsibleTextItem
              key={index}
              value={response}
              onChange={(newValue) => updateResponse(index, newValue)}
              onRemove={() => removeResponse(index)}
              disabled={disabled}
              maxLength={BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
              index={index}
              totalCount={value.length}
              placeholder="Enter a sample response..."
              maxCollapsedLines={3}
              itemLabel="sample"
            />
          ))}
        </div>
      )}

      {/* Add new response - distinct card with dashed border */}
      {canAddMore && (
        <Card className="p-4 border-dashed border-2 border-muted-foreground/30 bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span>Add New Sample Response</span>
            </div>
            <Textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Add a sample response that represents your ideal tone and style..."
              maxLength={BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
              rows={calculateRows(newResponse)}
              className="resize-none bg-background"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newResponse.length} / {BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH} • Ctrl+Enter to add
              </span>
              <Button
                type="button"
                onClick={addResponse}
                disabled={disabled || !newResponse.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Sample
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground">
        {value.length} / {BRAND_VOICE_LIMITS.SAMPLE_RESPONSES_MAX} sample responses
        {!canAddMore && " (maximum reached)"}
      </p>
    </div>
  );
}
