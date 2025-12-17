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
        className="w-full px-5 py-3.5 rounded-full text-left text-[15px] focus:outline-none transition-all duration-200 flex items-center justify-between"
        style={{
          background: isOpen
            ? "rgba(16, 185, 129, 0.05)"
            : "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isOpen
            ? "1px solid rgba(16, 185, 129, 0.5)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isOpen
            ? "0 0 20px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <span className={displayValue ? "text-white" : "text-gray-500"}>
          {displayValue || "Vyberte čas"}
        </span>
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${
            isOpen ? "text-emerald-400" : "text-gray-400"
          }`}
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
          className="absolute z-50 mt-2 rounded-2xl overflow-hidden animate-slide-down"
          style={{
            background: "rgba(2, 44, 34, 0.95)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex">
            {/* Hours column */}
            <div
              ref={hoursRef}
              className="h-64 overflow-y-auto scrollbar-thin"
              style={{ width: "80px" }}
            >
              <div className="py-2">
                {hoursList.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    data-hour={hour}
                    onClick={() => handleHourClick(hour)}
                    className="w-full py-3 px-4 text-center text-[15px] font-medium transition-all duration-150"
                    style={{
                      background:
                        hours === hour
                          ? "rgba(16, 185, 129, 0.2)"
                          : "transparent",
                      color: hours === hour ? "#6ee7b7" : "white",
                    }}
                    onMouseEnter={(e) => {
                      if (hours !== hour) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (hours !== hour) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div
              className="w-px"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            />

            {/* Minutes column */}
            <div
              ref={minutesRef}
              className="h-64 overflow-y-auto scrollbar-thin"
              style={{ width: "80px" }}
            >
              <div className="py-2">
                {minutesList.map((minute) => {
                  const isSelected =
                    minutes !== null &&
                    Math.round(minutes / minuteStep) * minuteStep === minute;
                  return (
                    <button
                      key={minute}
                      type="button"
                      data-minute={minute}
                      onClick={() => handleMinuteClick(minute)}
                      className="w-full py-3 px-4 text-center text-[15px] font-medium transition-all duration-150"
                      style={{
                        background: isSelected
                          ? "rgba(16, 185, 129, 0.2)"
                          : "transparent",
                        color: isSelected ? "#6ee7b7" : "white",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick options */}
          <div
            className="p-3 flex gap-2"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
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
                className="flex-1 py-2.5 text-xs font-semibold text-emerald-400 rounded-xl transition-all duration-200"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                  e.currentTarget.style.color = "#6ee7b7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
                  e.currentTarget.style.color = "#34d399";
                }}
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
