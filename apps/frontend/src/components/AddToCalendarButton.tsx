"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Download } from "lucide-react";
import {
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  generateOffice365CalendarLink,
  downloadICSFile,
  downloadICSFileFromEvent,
  openCalendarLink,
  CalendarEvent,
} from "@/lib/calendar-utils";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  sportType: string;
  skillLevel: string;
  datetime: string;
  duration: number;
  location: string;
  price: number | null;
  venue?: {
    name: string;
  } | null;
}

interface AddToCalendarButtonProps {
  activity: Activity;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

// Sport type labels in Slovak
const sportTypeLabels: Record<string, string> = {
  FOOTBALL: "Futbal",
  BASKETBALL: "Basketbal",
  TENNIS: "Tenis",
  VOLLEYBALL: "Volejbal",
  BADMINTON: "Bedminton",
  TABLE_TENNIS: "Stolný tenis",
  RUNNING: "Beh",
  CYCLING: "Cyklistika",
  SWIMMING: "Plávanie",
  GYM: "Posilňovňa",
  OTHER: "Iné",
};

// Skill level labels in Slovak
const skillLevelLabels: Record<string, string> = {
  BEGINNER: "Začiatočník",
  INTERMEDIATE: "Mierne pokročilý",
  ADVANCED: "Pokročilý",
  EXPERT: "Expert",
  PROFESSIONAL: "Profesionál",
};

export default function AddToCalendarButton({
  activity,
  variant = "default",
  size = "md",
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  // Prepare calendar event data
  const startTime = new Date(activity.datetime);
  const endTime = new Date(startTime.getTime() + activity.duration * 60000);

  const calendarEvent: CalendarEvent = {
    title: activity.title,
    description: `${activity.description || "SportBuddy aktivita"}\n\nŠport: ${
      sportTypeLabels[activity.sportType] || activity.sportType
    }\nÚroveň: ${
      skillLevelLabels[activity.skillLevel] || activity.skillLevel
    }\nCena: ${activity.price ? `${activity.price}€` : "Zdarma"}`,
    location: activity.venue?.name || activity.location,
    startTime,
    endTime,
  };

  // Handle calendar option selection
  const handleCalendarOption = async (option: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // On mobile, always download ICS file for better compatibility
      if (isMobile) {
        await downloadICSFileFromEvent(calendarEvent, `sportbuddy-${activity.id}.ics`);
      } else {
        // On desktop, use web links
        switch (option) {
          case "google":
            openCalendarLink(generateGoogleCalendarLink(calendarEvent));
            break;
          case "outlook":
            openCalendarLink(generateOutlookCalendarLink(calendarEvent));
            break;
          case "office365":
            openCalendarLink(generateOffice365CalendarLink(calendarEvent));
            break;
          case "apple":
          case "download":
            await downloadICSFileFromEvent(calendarEvent, `sportbuddy-${activity.id}.ics`);
            break;
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Calendar add error:", error);
      setErrorMessage("Nepodarilo sa pridať do kalendára. Skúste to znova.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950",
    ghost: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950",
  };

  return (
    <div className="relative">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border text-white shadow-lg bg-red-600 border-red-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="text-sm font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-2 hover:opacity-70"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 rounded-lg font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]} ${variantClasses[variant]}
        `}
      >
        <Calendar className="w-5 h-5" />
        <span>Pridať do kalendára</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu - Emerald Night style */}
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
            <div className="py-2">
              {/* Google Calendar */}
              <button
                onClick={() => handleCalendarOption("google")}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-200">Google Calendar</span>
              </button>

              {/* Apple Calendar */}
              <button
                onClick={() => handleCalendarOption("apple")}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-gray-200">Apple Calendar</span>
              </button>

              {/* Outlook */}
              <button
                onClick={() => handleCalendarOption("outlook")}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#0078D4"
                    d="M7 12.5C7 10.57 8.57 9 10.5 9h7c1.93 0 3.5 1.57 3.5 3.5v5c0 1.93-1.57 3.5-3.5 3.5h-7C8.57 21 7 19.43 7 17.5v-5z"
                  />
                  <path
                    fill="#0364B8"
                    d="M3 8.5C3 6.57 4.57 5 6.5 5h7C15.43 5 17 6.57 17 8.5v5c0 1.93-1.57 3.5-3.5 3.5h-7C4.57 17 3 15.43 3 13.5v-5z"
                  />
                  <path
                    fill="#FFF"
                    d="M8.5 8C7.67 8 7 8.67 7 9.5v4c0 .83.67 1.5 1.5 1.5h4c.83 0 1.5-.67 1.5-1.5v-4c0-.83-.67-1.5-1.5-1.5h-4z"
                  />
                </svg>
                <span className="text-gray-200">Outlook Calendar</span>
              </button>

              {/* Office 365 */}
              <button
                onClick={() => handleCalendarOption("office365")}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#D83B01" d="M21 3H11v8h10V3z" />
                  <path fill="#F25022" d="M11 3H3v8h8V3z" />
                  <path fill="#7FBA00" d="M11 13H3v8h8v-8z" />
                  <path fill="#00A4EF" d="M21 13H11v8h10v-8z" />
                </svg>
                <span className="text-gray-200">Office 365</span>
              </button>

              <div className="my-2 border-t border-white/10" />

              {/* Download ICS */}
              <button
                onClick={() => handleCalendarOption("download")}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <Download className="w-5 h-5 text-gray-400" />
                <span className="text-gray-200">Stiahnuť .ics súbor</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
