'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg acrylic w-9 h-9" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg acrylic hover-glow reveal-effect transition-all cursor-pointer"
      aria-label="Prepnúť tému"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[color:var(--fluent-text)]" />
      ) : (
        <Sun className="w-5 h-5 text-[color:var(--fluent-text)]" />
      )}
    </button>
  );
}
