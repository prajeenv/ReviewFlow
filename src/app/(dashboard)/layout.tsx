"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar, DashboardHeader } from "@/components/dashboard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LoadingPage } from "@/components/shared";

interface DashboardData {
  credits: number;
  tier: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch dashboard data (credits, tier)
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDashboardData({
              credits: data.data.credits.remaining,
              tier: data.data.tier,
            });
          }
        })
        .catch(() => {
          // Use session data as fallback
          setDashboardData({
            credits: 0,
            tier: session?.user?.tier || "FREE",
          });
        });
    }
  }, [status, session]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <LoadingPage message="Loading dashboard..." />
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            isMobile
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          credits={dashboardData?.credits ?? 0}
          tier={dashboardData?.tier ?? "FREE"}
        />

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
