'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TemplateWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  // For auth pages, just show ThemeToggle in corner
  if (isAuthPage) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </>
    );
  }

  // For all other pages, show full Navigation
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
