"use client";

import { Slider } from "@/components/ui/slider";
import { FORMALITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FormalitySliderProps {
  value: number;
  onChange: (_value: number) => void;
  disabled?: boolean;
}

export function FormalitySlider({ value, onChange, disabled }: FormalitySliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={1}
          max={5}
          step={1}
          disabled={disabled}
          className="flex-1"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between px-1">
        {FORMALITY_LABELS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "text-xs transition-colors",
              value === index + 1
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Current value indicator */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          Level {value}: {FORMALITY_LABELS[value - 1]}
        </span>
      </div>
    </div>
  );
}
