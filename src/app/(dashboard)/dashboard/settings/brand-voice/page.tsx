"use client";

import { BrandVoiceForm } from "@/components/settings";

export default function BrandVoiceSettingsPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand Voice</h1>
        <p className="text-muted-foreground mt-2">
          Configure how AI generates responses to match your brand&apos;s unique voice and style.
        </p>
      </div>

      <BrandVoiceForm />
    </div>
  );
}
