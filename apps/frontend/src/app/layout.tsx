import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
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
  themeColor: "#0078d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <GoogleMapsProvider>
            <TemplateWrapper>{children}</TemplateWrapper>
          </GoogleMapsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
