import type { Metadata, Viewport } from "next";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { ToastProvider } from "@/components/ui/Toast";
import TemplateWrapper from "@/components/TemplateWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportBuddy - Nájdi si spoluhráčov",
  description:
    "Aplikácia pre športových nadšencov na hľadanie spoluhráčov a organizáciu športových aktivít",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SportBuddy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-144x144.png" />
      </head>
      <body className="antialiased">
        <GoogleMapsProvider>
          <ToastProvider>
            <TemplateWrapper>{children}</TemplateWrapper>
          </ToastProvider>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
