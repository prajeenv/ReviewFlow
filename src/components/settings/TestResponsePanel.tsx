"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, RefreshCw, ThumbsUp, Copy, Check } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import { toast } from "sonner";

interface TestResponsePanelProps {
  disabled?: boolean;
}

interface TestResponse {
  responseText: string;
  model: string;
  detectedLanguage: string;
}

export function TestResponsePanel({ disabled }: TestResponsePanelProps) {
  const [reviewText, setReviewText] = useState("");
  const [platform, setPlatform] = useState<string>("Google");
  const [rating, setRating] = useState<string>("5");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!reviewText.trim()) {
      toast.error("Please enter a sample review");
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/brand-voice/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewText,
          platform,
          rating: parseInt(rating),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to generate response");
      }

      setResponse({
        responseText: data.data.response.responseText,
        model: data.data.response.model,
        detectedLanguage: data.data.review.detectedLanguage,
      });

      toast.success("Test response generated!");
    } catch (error) {
      console.error("Test error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate test response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response.responseText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleReviews = [
    {
      text: "Great product! Exactly what I needed. Fast shipping too.",
      platform: "Amazon",
      rating: "5",
    },
    {
      text: "The service was okay but I had to wait too long. Food was cold when it arrived.",
      platform: "Google",
      rating: "3",
    },
    {
      text: "Terrible experience. Product broke after one day. Will never buy again!",
      platform: "Trustpilot",
      rating: "1",
    },
  ];

  const loadSampleReview = (sample: typeof sampleReviews[0]) => {
    setReviewText(sample.text);
    setPlatform(sample.platform);
    setRating(sample.rating);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Test Your Brand Voice
        </CardTitle>
        <CardDescription>
          Enter a sample review to see how your AI responses will sound with your current settings.
          This test is free and won&apos;t use any credits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sample review shortcuts */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try a sample:</span>
          {sampleReviews.map((sample, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadSampleReview(sample)}
              disabled={disabled || isLoading}
            >
              {sample.rating}★ {sample.platform}
            </Button>
          ))}
        </div>

        {/* Review input */}
        <div className="space-y-2">
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Enter a sample customer review to test your brand voice..."
            rows={4}
            maxLength={2000}
            disabled={disabled || isLoading}
          />
          <p className="text-xs text-muted-foreground text-right">
            {reviewText.length} / 2000
          </p>
        </div>

        {/* Platform and rating */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Platform</label>
            <Select
              value={platform}
              onValueChange={setPlatform}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium mb-1 block">Rating</label>
            <Select
              value={rating}
              onValueChange={setRating}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} Star{r !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate button */}
        <Button
          type="button"
          onClick={handleTest}
          disabled={disabled || isLoading || !reviewText.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Test Response
            </>
          )}
        </Button>

        {/* Response display */}
        {response && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Generated Response</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{response.detectedLanguage}</Badge>
                <Badge variant="outline" className="text-xs">
                  {response.model}
                </Badge>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="whitespace-pre-wrap">{response.responseText}</p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={disabled}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={disabled || isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => toast.success("Looking good! Your brand voice is configured.")}
                disabled={disabled}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Looks Good!
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
