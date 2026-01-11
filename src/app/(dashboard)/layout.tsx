import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dashboard layout - placeholder for Prompt 4
 * Will include sidebar navigation and header
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Temporary header with logout - will be replaced in Prompt 4 */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="font-semibold">ReviewFlow</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
