"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Sprout, TrendingUp, Dumbbell, Medal, Crown } from "lucide-react";

interface SkillSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const LABELS: Record<number, string> = {
  1: "Začiatočník",
  2: "Mierne pokr.",
  3: "Pokročilý",
  4: "Expert",
  5: "Profesionál",
};

const ICONS = {
  1: Sprout,
  2: TrendingUp,
  3: Dumbbell,
  4: Medal,
  5: Crown,
};

// Spring konfigurácia
const SPRING = {
  overshoot: 0.35,
  stiffness: 0.06, // Pomalší návrat (bolo 0.08)
  damping: 0.75, // Jemne viac tlmenia (bolo 0.7)
};

export function SkillSlider({ value, onChange, disabled }: SkillSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPosition, setDisplayPosition] = useState(value - 1);

  const animationRef = useRef<number | undefined>(undefined);
  const positionRef = useRef(value - 1);
  const targetRef = useRef(value - 1);
  const velocityRef = useRef(0);
  const dragStartRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const phaseRef = useRef<"linear" | "spring">("linear");

  // Tracking pre drag velocity
  const lastPosRef = useRef(value - 1);
  const lastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);

  // Sync s externou hodnotou
  useEffect(() => {
    if (!isDragging && !isAnimating) {
      positionRef.current = value - 1;
      targetRef.current = value - 1;
      setDisplayPosition(value - 1);
    }
  }, [value, isDragging, isAnimating]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Spring animácia s overshootom
  const springAnimate = useCallback(() => {
    const pos = positionRef.current;
    const target = targetRef.current;
    const vel = velocityRef.current;
    const diff = target - pos;
    const absDiff = Math.abs(diff);

    const springForce = diff * SPRING.stiffness;
    velocityRef.current = (vel + springForce) * SPRING.damping;
    positionRef.current += velocityRef.current;
    setDisplayPosition(positionRef.current);

    // Koniec animácie
    if (absDiff < 0.001 && Math.abs(velocityRef.current) < 0.001) {
      positionRef.current = target;
      velocityRef.current = 0;
      setDisplayPosition(target);
      setIsAnimating(false);
      phaseRef.current = "linear";
      animationRef.current = undefined;
      return;
    }

    animationRef.current = requestAnimationFrame(springAnimate);
  }, []);

  // Animácia pre kliknutie - lineárna + spring bounce
  const animateToTarget = useCallback(() => {
    const pos = positionRef.current;
    const target = targetRef.current;
    const diff = target - pos;
    const absDiff = Math.abs(diff);
    const direction = Math.sign(diff);

    // Fáza 1: Lineárny pohyb - jemne rýchlejší
    if (phaseRef.current === "linear" && absDiff > 0.25) {
      const speed = 0.07; // Rýchlejšie (bolo 0.055)
      const step = direction * Math.min(speed, absDiff);
      positionRef.current += step;
      setDisplayPosition(positionRef.current);
      animationRef.current = requestAnimationFrame(animateToTarget);
      return;
    }

    // Prechod do spring fázy
    if (phaseRef.current === "linear") {
      phaseRef.current = "spring";
      velocityRef.current = direction * SPRING.overshoot;
    }

    springAnimate();
  }, [springAnimate]);

  // Spusti animáciu na cieľ
  const startAnimation = useCallback(
    (targetLevel: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      targetRef.current = targetLevel;
      velocityRef.current = 0;
      phaseRef.current = "linear";
      setIsAnimating(true);
      animationRef.current = requestAnimationFrame(animateToTarget);
    },
    [animateToTarget]
  );

  // Mouse/Touch handling
  const getPositionFromEvent = useCallback((clientX: number): number => {
    if (!containerRef.current) return positionRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const raw = (x / rect.width) * 5 - 0.5;
    return Math.max(0, Math.min(4, raw));
  }, []);

  const handlePointerDown = useCallback(
    (clientX: number) => {
      if (disabled) return;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }

      dragStartRef.current = clientX;
      hasDraggedRef.current = false;
      lastPosRef.current = positionRef.current;
      lastTimeRef.current = performance.now();
      dragVelocityRef.current = 0;
      setIsAnimating(false);
      setIsDragging(true);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging || disabled) return;

      if (dragStartRef.current !== null) {
        if (Math.abs(clientX - dragStartRef.current) > 5) {
          hasDraggedRef.current = true;
        }
      }

      if (hasDraggedRef.current) {
        const newPos = getPositionFromEvent(clientX);
        const now = performance.now();
        const dt = now - lastTimeRef.current;

        if (dt > 0) {
          const instantVelocity = ((newPos - lastPosRef.current) / dt) * 16;
          dragVelocityRef.current =
            dragVelocityRef.current * 0.7 + instantVelocity * 0.3;
        }

        lastPosRef.current = newPos;
        lastTimeRef.current = now;

        positionRef.current = newPos;
        setDisplayPosition(newPos);

        const newValue = Math.round(newPos) + 1;
        if (newValue !== value) {
          onChange(newValue);
        }
      }
    },
    [isDragging, disabled, getPositionFromEvent, onChange, value]
  );

  const handlePointerUp = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      setIsDragging(false);

      if (!hasDraggedRef.current) {
        const clickPos = getPositionFromEvent(clientX);
        const targetLevel = Math.round(clickPos);

        const newValue = targetLevel + 1;
        if (newValue !== value) {
          onChange(newValue);
        }

        startAnimation(targetLevel);
      } else {
        const currentPos = positionRef.current;
        const snapped = Math.round(currentPos);
        const dragVel = dragVelocityRef.current;

        const newValue = snapped + 1;
        if (newValue !== value) {
          onChange(newValue);
        }

        targetRef.current = snapped;

        const clampedVel = Math.max(-1, Math.min(1, dragVel * 3));
        const overshootStrength =
          Math.abs(clampedVel) > 0.1
            ? Math.sign(clampedVel) * SPRING.overshoot
            : 0;

        velocityRef.current = overshootStrength;
        phaseRef.current = "spring";
        setIsAnimating(true);
        animationRef.current = requestAnimationFrame(springAnimate);
      }

      dragStartRef.current = null;
      hasDraggedRef.current = false;
      dragVelocityRef.current = 0;
    },
    [
      isDragging,
      getPositionFromEvent,
      value,
      onChange,
      startAnimation,
      springAnimate,
    ]
  );

  // Event listeners
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handlePointerMove(e.clientX);
    };

    const onMouseUp = (e: MouseEvent) => {
      handlePointerUp(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      const clientX = dragStartRef.current ?? 0;
      handlePointerUp(clientX);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Rendering
  const pillLeftPercent = displayPosition * 20;
  const pillWidth = 25;
  const pillOffset = (pillWidth - 20) / 2; // 2.5

  const clipLeft = Math.max(0, pillLeftPercent - pillOffset);
  const clipRight = Math.max(0, 100 - (pillLeftPercent + 20 + pillOffset));

  const activeClipPath = `inset(0% ${clipRight}% 0% ${clipLeft}% round 9999px)`;
  const inactiveClipPath = `polygon(
    0% 0%, ${clipLeft}% 0%, ${clipLeft}% 100%, 0% 100%, 0% 0%,
    100% 0%, 100% 100%, ${100 - clipRight}% 100%, ${
    100 - clipRight
  }% 0%, 100% 0%
  )`;

  const isActive = isDragging || isAnimating;

  return (
    <div className="w-full select-none touch-none">
      {/* Glassy kontajner */}
      <div
        className="py-[2px] px-3.5 rounded-full border shadow-2xl"
        style={{
          background: "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          ref={containerRef}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          className={`relative w-full cursor-pointer ${
            disabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* Sivé ikony (neaktívne) */}
          <div
            className="relative w-full grid grid-cols-5 select-none"
            style={{ clipPath: inactiveClipPath }}
          >
            {[1, 2, 3, 4, 5].map((level) => {
              const Icon = ICONS[level as keyof typeof ICONS];
              return (
                <div
                  key={level}
                  className="flex flex-col items-center justify-center py-4 relative z-10"
                >
                  <div className="mb-1.5">
                    <Icon
                      size={26}
                      strokeWidth={2}
                      style={{ color: "rgba(255, 255, 255, 0.35)" }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-tighter text-center w-full truncate px-1"
                    style={{ color: "rgba(255, 255, 255, 0.35)" }}
                  >
                    {LABELS[level]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Zelené ikony (aktívne) */}
          <div
            className="absolute inset-0 w-full grid grid-cols-5 select-none z-20 pointer-events-none"
            style={{ clipPath: activeClipPath }}
          >
            {[1, 2, 3, 4, 5].map((level) => {
              const Icon = ICONS[level as keyof typeof ICONS];
              return (
                <div
                  key={level}
                  className="flex flex-col items-center justify-center py-4"
                >
                  <div className="mb-1.5">
                    <Icon
                      size={28}
                      strokeWidth={2.5}
                      className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] text-center w-full truncate px-1">
                    {LABELS[level]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Glass Indicator */}
          <div
            className="absolute top-[2px] bottom-[2px] rounded-full pointer-events-none z-0"
            style={{
              left: `calc(${pillLeftPercent}% - 2.5%)`,
              width: "25%",
              background: isActive
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: isActive
                ? "1px solid rgba(16, 185, 129, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: isActive
                ? "0 0 20px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              transform: isActive ? "scale(1.02)" : "scale(1)",
              transition:
                "background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
