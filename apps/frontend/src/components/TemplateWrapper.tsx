"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function TemplateWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

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
