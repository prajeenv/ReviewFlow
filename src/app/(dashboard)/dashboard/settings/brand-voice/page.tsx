"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandVoiceForm } from "@/components/settings";

export default function BrandVoiceSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Voice</h1>
          <p className="text-muted-foreground mt-2">
            Configure how AI generates responses to match your brand&apos;s unique voice and style.
          </p>
        </div>
      </div>

      <BrandVoiceForm />
    </div>
  );
}
