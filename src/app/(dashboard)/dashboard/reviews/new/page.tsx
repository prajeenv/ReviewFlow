import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews";

export default function NewReviewPage() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/reviews">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reviews
        </Link>
      </Button>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Add New Review
        </h1>
        <p className="text-muted-foreground">
          Add a customer review to generate an AI-powered response.
        </p>
      </div>

      {/* Review form */}
      <div className="max-w-2xl">
        <ReviewForm mode="create" />
      </div>
    </div>
  );
}
