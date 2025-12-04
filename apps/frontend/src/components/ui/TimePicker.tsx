"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  name?: string;
  className?: string;
  minuteStep?: number;
}

export function TimePicker({
  value,
  onChange,
  required,
  name,
  className = "",
  minuteStep = 15,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [hours, minutes] = value ? value.split(":").map(Number) : [null, null];

  const hoursList = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutesList = useMemo(
    () => Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected time when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hours !== null && hoursRef.current) {
          const selectedHour = hoursRef.current.querySelector(
            `[data-hour="${hours}"]`
          );
          if (selectedHour) {
            selectedHour.scrollIntoView({ block: "center" });
          }
        }
        if (minutes !== null && minutesRef.current) {
          const nearestMinute = Math.round(minutes / minuteStep) * minuteStep;
          const selectedMinute = minutesRef.current.querySelector(
            `[data-minute="${nearestMinute}"]`
          );
          if (selectedMinute) {
            selectedMinute.scrollIntoView({ block: "center" });
          }
        }
      }, 50);
    }
  }, [isOpen, hours, minutes, minuteStep]);

  const formatTime = (h: number, m: number): string => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleHourClick = (hour: number) => {
    const currentMinutes = minutes ?? 0;
    onChange(formatTime(hour, currentMinutes));
  };

  const handleMinuteClick = (minute: number) => {
    const currentHours = hours ?? 12;
    onChange(formatTime(currentHours, minute));
    setIsOpen(false);
  };

  const displayValue = value ? formatTime(hours ?? 0, minutes ?? 0) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for form validation */}
      {required && <input type="hidden" name={name} value={value} required />}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg 
          text-left text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
          transition-all duration-150 flex items-center justify-between
          ${
            isOpen
              ? "ring-2 ring-emerald-500 border-emerald-500/50"
              : "hover:border-white/20"
          }
        `}
      >
        <span className={displayValue ? "text-white" : "text-gray-500"}>
          {displayValue || "Vyberte čas"}
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-1
            bg-[rgba(2,44,34,0.95)] border border-white/10 rounded-xl
            shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
            animate-in fade-in-0 zoom-in-95 duration-150
            overflow-hidden
          "
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex">
            {/* Hours column */}
            <div
              ref={hoursRef}
              className="h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              style={{ width: "70px" }}
            >
              <div className="py-2">
                {hoursList.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    data-hour={hour}
                    onClick={() => handleHourClick(hour)}
                    className={`
                      w-full py-3 px-4 text-center text-sm font-medium transition-colors
                      ${
                        hours === hour
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="w-px bg-white/10" />

            {/* Minutes column */}
            <div
              ref={minutesRef}
              className="h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              style={{ width: "70px" }}
            >
              <div className="py-2">
                {minutesList.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    data-minute={minute}
                    onClick={() => handleMinuteClick(minute)}
                    className={`
                      w-full py-3 px-4 text-center text-sm font-medium transition-colors
                      ${
                        minutes !== null &&
                        Math.round(minutes / minuteStep) * minuteStep === minute
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick options */}
          <div className="border-t border-white/10 p-2 flex gap-2">
            {[
              {
                label: "Teraz",
                h: new Date().getHours(),
                m:
                  Math.round(new Date().getMinutes() / minuteStep) * minuteStep,
              },
              { label: "08:00", h: 8, m: 0 },
              { label: "12:00", h: 12, m: 0 },
              { label: "18:00", h: 18, m: 0 },
            ].map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => {
                  onChange(formatTime(quick.h, quick.m >= 60 ? 0 : quick.m));
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
