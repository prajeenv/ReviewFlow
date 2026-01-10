import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sign Up page - placeholder for Prompt 3
 */
export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500 text-white text-xl font-bold">
            R
          </div>
        </div>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Get started with ReviewFlow for free
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p className="mb-4">Registration will be implemented in Prompt 3.</p>
        <Link href="/" className="text-brand-500 hover:underline">
          Return to home
        </Link>
      </CardContent>
    </Card>
  );
}
