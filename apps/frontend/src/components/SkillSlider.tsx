"use client";

import React, { useRef, useEffect, useState } from "react";

interface SkillSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const LABELS: Record<number, string> = {
  1: "Začiatočník",
  2: "Mierne pokročilý",
  3: "Pokročilý",
  4: "Expert",
  5: "Profesionál",
};

export function SkillSlider({ value, onChange, disabled }: SkillSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate position relative to the track (accounting for padding)
    // Padding is 1rem (16px) on both sides
    const padding = 16;
    const trackWidth = rect.width - padding * 2;

    // Clamp x between 0 and trackWidth
    const x = Math.max(0, Math.min(clientX - rect.left - padding, trackWidth));

    const percentage = x / trackWidth;

    // Map 0-1 to 1-5
    let newValue = Math.round(percentage * 4) + 1;

    if (newValue < 1) newValue = 1;
    if (newValue > 5) newValue = 5;

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX);
      }
    };
    const handleGlobalUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalUp);
      window.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleGlobalUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [isDragging, value, disabled]);

  return (
    <div className="w-full select-none touch-none">
      <div
        ref={containerRef}
        className={`relative h-16 bg-black/40 rounded-2xl cursor-pointer border border-white/5 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Track Lines */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full" />

        {/* Active Track (Optional, maybe just dots are enough, but let's keep it subtle) */}
        {/* <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-500/50 rounded-full transition-all duration-150"
          style={{ width: `calc(${((value - 1) / 4) * 100}% - 2rem)` }} 
        /> */}

        {/* Steps Dots */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                step <= value
                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white font-bold text-2xl border-2 border-emerald-300 transition-all duration-150 ease-out z-10"
          style={{
            left: `calc(1rem + ((100% - 2rem) * ${(value - 1) / 4}) - 1.75rem)`,
          }}
        >
          {value}
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-center h-8">
        <span className="text-emerald-400 font-bold text-lg uppercase tracking-wider animate-in fade-in slide-in-from-bottom-1 duration-200 key={value}">
          {LABELS[value]}
        </span>
      </div>
    </div>
  );
}
