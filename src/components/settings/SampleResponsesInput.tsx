"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, GripVertical } from "lucide-react";
import { BRAND_VOICE_LIMITS } from "@/lib/constants";

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

  const canAddMore = value.length < BRAND_VOICE_LIMITS.SAMPLE_RESPONSES_MAX;

  return (
    <div className="space-y-4">
      {/* Existing responses */}
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((response, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <Textarea
                    value={response}
                    onChange={(e) => updateResponse(index, e.target.value)}
                    disabled={disabled}
                    maxLength={BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
                    rows={2}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {response.length} / {BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Sample #{index + 1}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResponse(index)}
                  disabled={disabled}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new response */}
      {canAddMore && (
        <div className="space-y-2">
          <Textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            disabled={disabled}
            placeholder="Add a sample response that represents your ideal tone and style..."
            maxLength={BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {newResponse.length} / {BRAND_VOICE_LIMITS.SAMPLE_RESPONSE_MAX_LENGTH}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResponse}
              disabled={disabled || !newResponse.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sample
            </Button>
          </div>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground">
        {value.length} / {BRAND_VOICE_LIMITS.SAMPLE_RESPONSES_MAX} sample responses
        {!canAddMore && " (maximum reached)"}
      </p>
    </div>
  );
}
