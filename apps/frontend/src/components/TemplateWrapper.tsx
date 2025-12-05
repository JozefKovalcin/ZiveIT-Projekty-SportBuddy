"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function TemplateWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registered: ", registration.scope))
        .catch((err) => console.log("SW registration failed: ", err));
    }
  }, []);

  // For auth pages, no navigation needed
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For all other pages, show full Navigation
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
