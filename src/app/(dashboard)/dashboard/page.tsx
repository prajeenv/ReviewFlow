import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dashboard page - placeholder for Prompt 4
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ReviewFlow. This dashboard will be implemented in Prompt 4.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>Manage your customer reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Total reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
            <CardDescription>Available response credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5.0</p>
            <p className="text-sm text-muted-foreground">Credits remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
            <CardDescription>AI-generated responses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Responses created</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/" className="text-brand-500 hover:underline">
          Return to home
        </Link>
      </div>
    </div>
  );
}
