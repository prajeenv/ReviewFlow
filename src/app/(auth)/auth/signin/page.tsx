import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sign In page - placeholder for Prompt 3
 */
export default function SignInPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500 text-white text-xl font-bold">
            R
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your ReviewFlow account
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p className="mb-4">Authentication will be implemented in Prompt 3.</p>
        <Link href="/" className="text-brand-500 hover:underline">
          Return to home
        </Link>
      </CardContent>
    </Card>
  );
}
