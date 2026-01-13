"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, CreditCard, Bell, ChevronRight } from "lucide-react";

const settingsSections = [
  {
    title: "Brand Voice",
    description: "Configure how AI generates responses to match your brand's unique voice and style.",
    href: "/dashboard/settings/brand-voice",
    icon: MessageSquare,
    available: true,
  },
  {
    title: "Profile",
    description: "Manage your personal information and account details.",
    href: "/dashboard/settings/profile",
    icon: User,
    available: false,
    comingSoon: true,
  },
  {
    title: "Billing & Credits",
    description: "View your subscription plan, credit usage, and billing history.",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    available: false,
    comingSoon: true,
  },
  {
    title: "Notifications",
    description: "Configure email notifications and alerts.",
    href: "/dashboard/settings/notifications",
    icon: Bell,
    available: false,
    comingSoon: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className={section.available ? "hover:bg-accent/50 transition-colors" : "opacity-60"}
            >
              {section.available ? (
                <Link href={section.href}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                </Link>
              ) : (
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {section.title}
                        {section.comingSoon && (
                          <span className="text-xs font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Coming Soon
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick access to Brand Voice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Configure Your Brand Voice</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your tone, key phrases, and style guidelines
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/settings/brand-voice">
                Get Started
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
