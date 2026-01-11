import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign Up - ReviewFlow",
  description: "Create your ReviewFlow account",
};

function SignupFormWrapper() {
  return <SignupForm />;
}

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
            R
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Get started with ReviewFlow for free
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SignupFormWrapper />
        </Suspense>
      </CardContent>
    </Card>
  );
}
