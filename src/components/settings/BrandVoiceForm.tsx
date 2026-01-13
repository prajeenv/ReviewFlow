"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToneSelector } from "./ToneSelector";
import { FormalitySlider } from "./FormalitySlider";
import { KeyPhrasesInput } from "./KeyPhrasesInput";
import { SampleResponsesInput } from "./SampleResponsesInput";
import { TestResponsePanel } from "./TestResponsePanel";
import { Loader2, Save, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import type { BrandVoiceTone } from "@/lib/constants";
import { BRAND_VOICE_LIMITS } from "@/lib/constants";

interface BrandVoiceData {
  id: string;
  tone: BrandVoiceTone;
  formality: number;
  keyPhrases: string[];
  styleNotes: string | null;
  sampleResponses: string[];
}

const DEFAULT_BRAND_VOICE: Omit<BrandVoiceData, "id"> = {
  tone: "professional",
  formality: 3,
  keyPhrases: ["Thank you", "We appreciate your feedback"],
  styleNotes: "Be genuine and empathetic",
  sampleResponses: [],
};

export function BrandVoiceForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData | null>(null);

  // Form state
  const [tone, setTone] = useState<BrandVoiceTone>("professional");
  const [formality, setFormality] = useState(3);
  const [keyPhrases, setKeyPhrases] = useState<string[]>([]);
  const [styleNotes, setStyleNotes] = useState("");
  const [sampleResponses, setSampleResponses] = useState<string[]>([]);

  // Load brand voice on mount
  useEffect(() => {
    fetchBrandVoice();
  }, []);

  // Track changes
  useEffect(() => {
    if (brandVoice) {
      const changed =
        tone !== brandVoice.tone ||
        formality !== brandVoice.formality ||
        JSON.stringify(keyPhrases) !== JSON.stringify(brandVoice.keyPhrases) ||
        styleNotes !== (brandVoice.styleNotes || "") ||
        JSON.stringify(sampleResponses) !== JSON.stringify(brandVoice.sampleResponses);
      setHasChanges(changed);
    }
  }, [brandVoice, tone, formality, keyPhrases, styleNotes, sampleResponses]);

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
      setStyleNotes(bv.styleNotes || "");
      setSampleResponses(bv.sampleResponses);
    } catch (error) {
      console.error("Error fetching brand voice:", error);
      toast.error("Failed to load brand voice settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await fetch("/api/brand-voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          formality,
          keyPhrases,
          styleNotes: styleNotes || null,
          sampleResponses,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to save brand voice");
      }

      const bv = data.data.brandVoice;
      setBrandVoice(bv);
      setHasChanges(false);
      toast.success("Brand voice settings saved!");
    } catch (error) {
      console.error("Error saving brand voice:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTone(DEFAULT_BRAND_VOICE.tone);
    setFormality(DEFAULT_BRAND_VOICE.formality);
    setKeyPhrases([...DEFAULT_BRAND_VOICE.keyPhrases]);
    setStyleNotes(DEFAULT_BRAND_VOICE.styleNotes || "");
    setSampleResponses([...DEFAULT_BRAND_VOICE.sampleResponses]);
    toast.info("Reset to default values. Click Save to apply.");
  };

  const handleDiscard = () => {
    if (brandVoice) {
      setTone(brandVoice.tone);
      setFormality(brandVoice.formality);
      setKeyPhrases([...brandVoice.keyPhrases]);
      setStyleNotes(brandVoice.styleNotes || "");
      setSampleResponses([...brandVoice.sampleResponses]);
      setHasChanges(false);
      toast.info("Changes discarded");
    }
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
          <CardTitle>Brand Voice Configuration</CardTitle>
          <CardDescription>
            Customize how AI generates responses for your reviews. These settings will be applied
            to all generated responses.
          </CardDescription>
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

          {/* Style Notes */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Style Guidelines</Label>
            <p className="text-sm text-muted-foreground">
              Add any specific guidelines or notes about your brand voice.
              For example: &quot;Always mention our 30-day return policy&quot; or &quot;Avoid using exclamation marks.&quot;
            </p>
            <Textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              placeholder="Enter any specific style guidelines..."
              rows={3}
              maxLength={BRAND_VOICE_LIMITS.STYLE_NOTES_MAX}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground text-right">
              {styleNotes.length} / {BRAND_VOICE_LIMITS.STYLE_NOTES_MAX}
            </p>
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
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              {hasChanges && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDiscard}
                  disabled={isSaving}
                >
                  Discard Changes
                </Button>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Panel */}
      <TestResponsePanel disabled={isSaving} />
    </div>
  );
}
