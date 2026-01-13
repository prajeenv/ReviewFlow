"use client";

import { cn } from "@/lib/utils";
import { BRAND_VOICE_TONES, BRAND_VOICE_TONE_INFO, type BrandVoiceTone } from "@/lib/constants";
import { Briefcase, Smile, Coffee, Heart } from "lucide-react";

interface ToneSelectorProps {
  value: BrandVoiceTone;
  onChange: (_tone: BrandVoiceTone) => void;
  disabled?: boolean;
}

const iconMap = {
  briefcase: Briefcase,
  smile: Smile,
  coffee: Coffee,
  heart: Heart,
};

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BRAND_VOICE_TONES.map((tone) => {
        const info = BRAND_VOICE_TONE_INFO[tone];
        const Icon = iconMap[info.icon as keyof typeof iconMap];
        const isSelected = value === tone;

        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-muted bg-background",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div className="text-center">
              <p
                className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {info.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {info.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
