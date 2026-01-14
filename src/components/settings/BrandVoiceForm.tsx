"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToneSelector } from "./ToneSelector";
import { FormalitySlider } from "./FormalitySlider";
import { KeyPhrasesInput } from "./KeyPhrasesInput";
import { StyleGuidelinesInput } from "./StyleGuidelinesInput";
import { SampleResponsesInput } from "./SampleResponsesInput";
import { TestResponsePanel } from "./TestResponsePanel";
import { Loader2, RotateCcw, Check, Cloud, CloudOff } from "lucide-react";
import { toast } from "sonner";
import type { BrandVoiceTone } from "@/lib/constants";

interface BrandVoiceData {
  id: string;
  tone: BrandVoiceTone;
  formality: number;
  keyPhrases: string[];
  styleNotes: string | null;
  sampleResponses: string[];
}

const DEFAULT_STYLE_GUIDELINES = ["Be genuine and empathetic"];

const DEFAULT_BRAND_VOICE: Omit<BrandVoiceData, "id"> = {
  tone: "professional",
  formality: 3,
  keyPhrases: ["Thank you", "We appreciate your feedback"],
  styleNotes: DEFAULT_STYLE_GUIDELINES.join("\n"),
  sampleResponses: [],
};

// Helper functions to convert between string (DB) and array (UI)
// Uses JSON for safe serialization (handles newlines/special chars in guidelines)
const styleNotesToArray = (notes: string | null): string[] => {
  if (!notes) return [];
  // Try parsing as JSON first (new format)
  try {
    const parsed = JSON.parse(notes);
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    }
  } catch {
    // Fall back to newline-separated (legacy format)
  }
  return notes.split("\n").map(s => s.trim()).filter(s => s.length > 0);
};

const styleNotesToString = (guidelines: string[]): string => {
  const filtered = guidelines.filter(s => s.trim().length > 0);
  // Store as JSON for safe serialization
  return filtered.length > 0 ? JSON.stringify(filtered) : "";
};

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 1500;

export function BrandVoiceForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Form state
  const [tone, setTone] = useState<BrandVoiceTone>("professional");
  const [formality, setFormality] = useState(3);
  const [keyPhrases, setKeyPhrases] = useState<string[]>([]);
  const [styleGuidelines, setStyleGuidelines] = useState<string[]>([]);
  const [sampleResponses, setSampleResponses] = useState<string[]>([]);

  // Ref for debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load brand voice on mount
  useEffect(() => {
    fetchBrandVoice();
  }, []);

  // Auto-save function
  const performSave = useCallback(async () => {
    if (!brandVoice) return;

    setIsSaving(true);
    setSaveStatus("saving");

    const styleNotesString = styleNotesToString(styleGuidelines);

    try {
      const res = await fetch("/api/brand-voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          formality,
          keyPhrases,
          styleNotes: styleNotesString || null,
          sampleResponses,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to save brand voice");
      }

      const bv = data.data.brandVoice;
      setBrandVoice(bv);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Error saving brand voice:", error);
      setSaveStatus("unsaved");
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [brandVoice, tone, formality, keyPhrases, styleGuidelines, sampleResponses]);

  // Auto-save effect with debounce
  useEffect(() => {
    if (!isInitialized || !brandVoice) return;

    // Check if there are actual changes
    const currentStyleNotes = styleNotesToString(styleGuidelines);
    const hasChanges =
      tone !== brandVoice.tone ||
      formality !== brandVoice.formality ||
      JSON.stringify(keyPhrases) !== JSON.stringify(brandVoice.keyPhrases) ||
      currentStyleNotes !== (brandVoice.styleNotes || "") ||
      JSON.stringify(sampleResponses) !== JSON.stringify(brandVoice.sampleResponses);

    if (!hasChanges) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("unsaved");

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, AUTO_SAVE_DELAY);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isInitialized, brandVoice, tone, formality, keyPhrases, styleGuidelines, sampleResponses, performSave]);

  const fetchBrandVoice = async () => {
    try {
      const res = await fetch("/api/brand-voice");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch brand voice");
      }

      const bv = data.data.brandVoice;
      setBrandVoice(bv);
      setTone(bv.tone);
      setFormality(bv.formality);
      setKeyPhrases(bv.keyPhrases);
      setStyleGuidelines(styleNotesToArray(bv.styleNotes));
      setSampleResponses(bv.sampleResponses);
      // Mark as initialized after loading to prevent immediate auto-save
      setTimeout(() => setIsInitialized(true), 100);
    } catch (error) {
      console.error("Error fetching brand voice:", error);
      toast.error("Failed to load brand voice settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTone(DEFAULT_BRAND_VOICE.tone);
    setFormality(DEFAULT_BRAND_VOICE.formality);
    setKeyPhrases([...DEFAULT_BRAND_VOICE.keyPhrases]);
    setStyleGuidelines([...DEFAULT_STYLE_GUIDELINES]);
    setSampleResponses([...DEFAULT_BRAND_VOICE.sampleResponses]);
    toast.info("Reset to default values. Changes will auto-save.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brand Voice Configuration</CardTitle>
              <CardDescription>
                Customize how AI generates responses for your reviews. Changes are saved automatically.
              </CardDescription>
            </div>
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Saved</span>
                </>
              )}
              {saveStatus === "unsaved" && (
                <>
                  <CloudOff className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-500">Unsaved</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Tone Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Response Tone</Label>
            <p className="text-sm text-muted-foreground">
              Select the overall tone for your AI-generated responses.
            </p>
            <ToneSelector
              value={tone}
              onChange={setTone}
              disabled={isSaving}
            />
          </div>

          <Separator />

          {/* Formality Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Formality Level</Label>
            <p className="text-sm text-muted-foreground">
              Adjust how formal or casual your responses should be.
            </p>
            <FormalitySlider
              value={formality}
              onChange={setFormality}
              disabled={isSaving}
            />
          </div>

          <Separator />

          {/* Key Phrases */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Key Phrases</Label>
            <p className="text-sm text-muted-foreground">
              Add phrases that should be included in your responses when appropriate.
              These help maintain consistency with your brand messaging.
            </p>
            <KeyPhrasesInput
              value={keyPhrases}
              onChange={setKeyPhrases}
              disabled={isSaving}
            />
          </div>

          <Separator />

          {/* Style Guidelines */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Style Guidelines</Label>
            <p className="text-sm text-muted-foreground">
              Add specific instructions for how responses should be written.
              Each guideline will be followed by the AI when generating responses.
            </p>
            <StyleGuidelinesInput
              value={styleGuidelines}
              onChange={setStyleGuidelines}
              disabled={isSaving}
              maxGuidelines={5}
              maxLength={200}
            />
          </div>

          <Separator />

          {/* Sample Responses */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sample Responses</Label>
            <p className="text-sm text-muted-foreground">
              Add examples of ideal responses. The AI will use these as references to match your
              preferred style and tone.
            </p>
            <SampleResponsesInput
              value={sampleResponses}
              onChange={setSampleResponses}
              disabled={isSaving}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4" />
              <span>Auto-save enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Panel */}
      <TestResponsePanel disabled={isSaving} />
    </div>
  );
}
