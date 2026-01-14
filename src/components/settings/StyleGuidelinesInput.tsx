"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, GripVertical } from "lucide-react";

interface StyleGuidelinesInputProps {
  value: string[];
  onChange: (_guidelines: string[]) => void;
  disabled?: boolean;
  maxGuidelines?: number;
  maxLength?: number;
}

export function StyleGuidelinesInput({
  value,
  onChange,
  disabled,
  maxGuidelines = 10,
  maxLength = 200,
}: StyleGuidelinesInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addGuideline = () => {
    const trimmed = inputValue.trim();
    if (trimmed && value.length < maxGuidelines && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeGuideline = (index: number) => {
    const newGuidelines = [...value];
    newGuidelines.splice(index, 1);
    onChange(newGuidelines);
  };

  const updateGuideline = (index: number, newValue: string) => {
    const newGuidelines = [...value];
    newGuidelines[index] = newValue;
    onChange(newGuidelines);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGuideline();
    }
  };

  const canAddMore = value.length < maxGuidelines;

  return (
    <div className="space-y-3">
      {/* Existing guidelines list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((guideline, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
              <Input
                value={guideline}
                onChange={(e) => updateGuideline(index, e.target.value)}
                disabled={disabled}
                maxLength={maxLength}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGuideline(index)}
                disabled={disabled}
                className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new guideline */}
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a style guideline..."
            disabled={disabled}
            maxLength={maxLength}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addGuideline}
            disabled={disabled || !inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Counter and hint */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {value.length === 0
            ? "Examples: \"Always thank customers\", \"Mention our warranty\""
            : `${value.length} / ${maxGuidelines} guidelines`}
        </span>
        {!canAddMore && <span className="text-yellow-600">Maximum reached</span>}
      </div>
    </div>
  );
}
