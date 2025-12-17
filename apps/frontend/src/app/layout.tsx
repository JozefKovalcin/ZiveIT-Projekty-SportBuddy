import type { Metadata, Viewport } from "next";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsProvider";
import { ToastProvider } from "@/components/ui/Toast";
import TemplateWrapper from "@/components/TemplateWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "SportBuddy - Nájdi si spoluhráčov",
  description:
    "Aplikácia pre športových nadšencov na hľadanie spoluhráčov a organizáciu športových aktivít",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-144x144.png",
  },
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
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <html lang="sk" className="dark">
      <body className="antialiased">
        <GoogleMapsProvider apiKey={googleMapsApiKey}>
          <ToastProvider>
            <TemplateWrapper>{children}</TemplateWrapper>
          </ToastProvider>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
