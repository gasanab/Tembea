import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AppChrome } from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  title: {
    default: "Tembea | Rwanda Tourism & Travel Marketplace",
    template: "%s | Tembea",
  },
  description:
    "Discover and book Rwanda's best hotels, apartments, restaurants, events, national parks, tours, transport, and Made in Rwanda products. Your all-in-one tourism marketplace.",
  keywords: [
    "Rwanda tourism", "Tembea", "Kigali hotels", "Akagera safari",
    "Nyungwe", "Volcanoes National Park", "Rwanda travel",
    "Made in Rwanda", "Rwanda events", "Rwanda tours",
  ],
  openGraph: {
    title: "Tembea | Rwanda Tourism & Travel Marketplace",
    description:
      "Your all-in-one platform for exploring and booking Rwanda travel services.",
    type: "website",
    locale: "en_RW",
    siteName: "Tembea",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tembea | Rwanda Tourism",
    description: "Discover and book Rwanda travel experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#FAFAFA]">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <AppChrome>{children}</AppChrome>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
