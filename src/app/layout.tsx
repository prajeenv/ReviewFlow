import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ReviewFlow - AI-Powered Review Response Management",
    template: "%s | ReviewFlow",
  },
  description:
    "Save 10+ hours per week responding to customer reviews with AI-powered, brand-aligned responses in 40+ languages.",
  keywords: [
    "review management",
    "AI responses",
    "customer reviews",
    "brand voice",
    "multi-language",
  ],
  authors: [{ name: "ReviewFlow" }],
  creator: "ReviewFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "ReviewFlow - AI-Powered Review Response Management",
    description:
      "Save 10+ hours per week responding to customer reviews with AI-powered, brand-aligned responses in 40+ languages.",
    siteName: "ReviewFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewFlow - AI-Powered Review Response Management",
    description:
      "Save 10+ hours per week responding to customer reviews with AI-powered, brand-aligned responses in 40+ languages.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
