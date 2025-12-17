"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import ActivityChat from "@/components/ActivityChat";
import ShareActivityButton from "@/components/ShareActivityButton";

// Status message type
type StatusMessage = {
  text: string;
  type: "success" | "error" | "warning";
} | null;

// Confirm dialog state type
type ConfirmDialog = {
  message: string;
  onConfirm: () => void;
} | null;

interface Activity {
  id: string;
  title: string;
  description: string | null;
  sportType: string;
  skillLevel: string;
  date: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  location: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: string;
  minAge: number;
  maxAge: number;
  price: number;
  isRecurring: boolean;
  recurrenceFrequency: string;
  recurrenceDays: number[];
  recurrenceEndDate: string | null;
  parentActivityId: string | null;
  venue?: {
    id: string;
    name: string;
    city: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  organizer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  participations: {
    id: string;
    guestCount: number;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
}

const sportTypeLabels: Record<string, string> = {
  FOOTBALL: "⚽ Futbal",
  BASKETBALL: "🏀 Basketbal",
  TENNIS: "🎾 Tenis",
  VOLLEYBALL: "🏐 Volejbal",
  BADMINTON: "🏸 Bedminton",
  TABLE_TENNIS: "🏓 Stolný tenis",
  RUNNING: "🏃 Beh",
  CYCLING: "🚴 Cyklistika",
  SWIMMING: "🏊 Plávanie",
  GYM: "💪 Posilňovňa",
  OTHER: "🎯 Iné",
};

const skillLevelLabels: Record<string, string> = {
  BEGINNER: "Začiatočník",
  INTERMEDIATE: "Mierne pokročilý",
  ADVANCED: "Pokročilý",
  EXPERT: "Expert",
};

const genderLabels: Record<string, string> = {
  MALE: "Muži",
  FEMALE: "Ženy",
  MIXED: "Zmiešané",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  OPEN: {
    label: "Otvorená",
    color: "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400",
  },
  FULL: {
    label: "Plná",
    color: "bg-orange-500/20 border border-orange-500/50 text-orange-400",
  },
  CANCELLED: {
    label: "Zrušená",
    color: "bg-red-500/20 border border-red-500/50 text-red-400",
  },
  COMPLETED: {
    label: "Ukončená",
    color: "bg-gray-500/20 border border-gray-500/50 text-gray-400",
  },
};

///////////////////////////////////////////////////////////////////
// AddToCalendarDropdown - modern, elegant implementation
///////////////////////////////////////////////////////////////////
const AddToCalendarDropdown = ({ activity }: { activity: Activity }) => {
  const [open, setOpen] = useState(false);

  // Helper: format for ICS (UTC) and for Google/Outlook (YYYYMMDDTHHMMSSZ)
  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatForICS = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(
      d.getUTCSeconds()
    )}Z`;

  const formatForCalendarParam = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const start = new Date(activity.date);
  const end = new Date(start.getTime() + activity.duration * 60000);

  // Generate ICS content with CRLF as recommended
  const generateICS = (activity: Activity) => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SportBuddy//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${activity.id || Math.random().toString(36).slice(2)}`,
      `SUMMARY:${(activity.title || "").replace(/\r?\n/g, "\\n")}`,
      `DESCRIPTION:${(activity.description || "").replace(/\r?\n/g, "\\n")}`,
      `LOCATION:${(activity.locationName || activity.location || "").replace(
        /\r?\n/g,
        "\\n"
      )}`,
      `DTSTART:${formatForICS(start)}`,
      `DTEND:${formatForICS(end)}`,
      // 1 hour before alarm
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Pripomienka",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return lines.join("\r\n");
  };

  const icsContent = generateICS(activity);

  // Google calendar URL (uses YYYYMMDDTHHMMSSZ without punctuation)
  const googleDates = `${formatForCalendarParam(
    start
  )}/${formatForCalendarParam(end)}`;
  const googleUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
    activity.title || ""
  )}&details=${encodeURIComponent(
    activity.description || ""
  )}&location=${encodeURIComponent(
    activity.locationName || activity.location || ""
  )}&dates=${googleDates}`;

  // Outlook web deeplink
  const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    activity.title || ""
  )}&body=${encodeURIComponent(
    activity.description || ""
  )}&location=${encodeURIComponent(
    activity.locationName || activity.location || ""
  )}&startdt=${encodeURIComponent(
    start.toISOString()
  )}&enddt=${encodeURIComponent(end.toISOString())}`;

  // data URL for direct .ics download
  const icsDataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(
    icsContent
  )}`;

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.createElement("a");
    element.setAttribute("href", icsDataUrl);
    element.setAttribute(
      "download",
      `${(activity.title || "event").replace(/\s+/g, "_")}.ics`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setOpen(false);
  };

  return (
    <div className="relative w-full text-left">
      <Button
        variant="secondary"
        onClick={() => setOpen((s) => !s)}
        className="w-full justify-center flex items-center gap-2"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Pridať do kalendára
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polyline
            points="6 9 12 15 18 9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>

      {open && (
        <>
          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
                Vybrať kalendár
              </div>

              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/[0.05] rounded-md transition-colors group"
                onClick={() => setOpen(false)}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded">
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
                </div>
                <div className="flex-1">
                  <div className="font-medium">Google Calendar</div>
                  <div className="text-xs text-gray-400">
                    Otvoriť v prehliadači
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/[0.05] rounded-md transition-colors group"
                onClick={() => setOpen(false)}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#0078D4"
                      d="M22 10.5V20c0 1.1-.9 2-2 2H10.5v-3H22v-8.5z"
                    />
                    <path
                      fill="#0078D4"
                      d="M22 4v6.5H10.5V2H20c1.1 0 2 .9 2 2z"
                    />
                    <path
                      fill="#0364B8"
                      d="M10.5 10.5H2V4c0-1.1.9-2 2-2h6.5v8.5z"
                    />
                    <path
                      fill="#0078D4"
                      d="M10.5 22H4c-1.1 0-2-.9-2-2v-6.5h8.5V22z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Outlook</div>
                  <div className="text-xs text-gray-400">
                    Office 365 & Outlook.com
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <div className="my-2 border-t border-white/10" />

              <button
                onClick={handleDownloadICS}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/[0.05] rounded-md transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Stiahnuť .ics súbor</div>
                  <div className="text-xs text-gray-400">
                    Pre Apple, iCal a ostatné
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

///////////////////////////////////////////////////////////////////
// Main ActivityDetailPage (original code with only minimal changes)
///////////////////////////////////////////////////////////////////
export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [addingGuests, setAddingGuests] = useState(false);
  const [upcomingInstances, setUpcomingInstances] = useState<Activity[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/activities");
  const [bulkJoinGuestCount, setBulkJoinGuestCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);
  const [leavingInstance, setLeavingInstance] = useState<string | null>(null);
  // Rating state
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [existingComment, setExistingComment] = useState<string>("");
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [instanceGuestCounts, setInstanceGuestCounts] = useState<
    Record<string, number>
  >({});

  // Helper to show status messages
  const showStatus = useCallback(
    (text: string, type: "success" | "error" | "warning") => {
      setStatusMessage({ text, type });
      setTimeout(() => setStatusMessage(null), 4000);
    },
    []
  );

  // Helper to show confirmation dialog
  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  useEffect(() => {
    // Check if we came from my-activities page via referrer or sessionStorage
    if (typeof window !== "undefined") {
      const savedSource = sessionStorage.getItem("activityListSource");
      if (savedSource === "/my-activities") {
        setReturnUrl("/my-activities");
      } else if (
        document.referrer &&
        document.referrer.includes("/my-activities")
      ) {
        setReturnUrl("/my-activities");
      }
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    fetchCurrentUser();
  }, [params.id]);

  useEffect(() => {
    // Update guest count when activity changes
    if (activity && currentUserId) {
      const participation = activity.participations.find(
        (p) => p.user.id === currentUserId
      );
      if (participation) {
        setGuestCount(participation.guestCount || 0);
      }
    }

    // Fetch upcoming instances if recurring (including child activities)
    if (activity) {
      const isRecurringOrChild =
        (activity.isRecurring && activity.recurrenceFrequency !== "NONE") ||
        activity.parentActivityId;
      if (isRecurringOrChild) {
        fetchUpcomingInstances();
      }

      // Fetch existing rating if user is participating
      const isUserParticipating = activity.participations.some(
        (p) => p.user.id === currentUserId
      );
      if (isUserParticipating && currentUserId) {
        fetchExistingRating();
      }
    }
  }, [activity, currentUserId]);

  const fetchExistingRating = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${params.id}/rate`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.rating) {
          setExistingRating(data.rating);
          setUserRating(data.rating);
        }
        if (data.comment) {
          setExistingComment(data.comment);
          setRatingComment(data.comment);
        }
      }
    } catch (err) {
      console.error("Error fetching rating:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${params.id}`
      );
      if (!response.ok) {
        throw new Error("Aktivita nenájdená");
      }
      const data = await response.json();
      setActivity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingInstances = async () => {
    setLoadingUpcoming(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${params.id}/upcoming`
      );
      if (response.ok) {
        const data = await response.json();
        setUpcomingInstances(data);
        // Don't auto-expand, keep collapsed by default
      }
    } catch (err) {
      console.error("Error fetching upcoming instances:", err);
    } finally {
      setLoadingUpcoming(false);
    }
  };
  const handleJoin = async () => {
    if (!activity) return;
    setJoining(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ guestCount: 0 }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri prihlásení");
      }

      showStatus("Úspešne ste sa prihlásili na aktivitu!", "success");
      await fetchActivity();
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!activity) return;

    showConfirm("Naozaj sa chcete odhlásiť z tejto aktivity?", async () => {
      setLeaving(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Chyba pri odhlásení");
        }

        showStatus("Boli ste odhlásení z aktivity", "success");
        await fetchActivity();
      } catch (err: any) {
        showStatus(err.message, "error");
      } finally {
        setLeaving(false);
      }
    });
  };

  const handleAddGuests = async () => {
    if (!activity) return;

    const currentParticipation = activity.participations.find(
      (p) => p.user.id === currentUserId
    );
    const currentGuestCount = currentParticipation?.guestCount || 0;
    const totalNeeded = 1 + guestCount; // user + guests
    const currentTotal = 1 + currentGuestCount; // current user + current guests
    const availableSpots =
      activity.maxParticipants - activity.currentParticipants + currentTotal;

    if (totalNeeded > availableSpots) {
      showStatus(
        `K dispozícii je len ${availableSpots} voľných miest.`,
        "warning"
      );
      return;
    }

    setAddingGuests(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ guestCount }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri aktualizácii počtu hostí");
      }

      await fetchActivity();
      showStatus(`Počet hostí aktualizovaný na ${guestCount}!`, "success");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setAddingGuests(false);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;

    showConfirm(
      "Naozaj chcete zmazať túto aktivitu? Táto akcia je nevratná.",
      async () => {
        setDeleting(true);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Chyba pri mazaní aktivity");
          }

          router.push(returnUrl);
        } catch (err: any) {
          showStatus(err.message, "error");
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  // Handle leaving from instance in recurring list
  const handleLeaveInstance = async (instanceId: string) => {
    setLeavingInstance(instanceId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${instanceId}/join`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri odhlásení");
      }

      showStatus("Boli ste odhlásení z termínu", "success");
      fetchUpcomingInstances();
      if (instanceId === activity?.id) {
        fetchActivity();
      }
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setLeavingInstance(null);
    }
  };

  // Handle rating submission
  const handleSubmitRating = async (rating: number, comment?: string) => {
    if (!activity || !currentUserId) return;

    setSubmittingRating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ rating, comment: comment || ratingComment }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri hodnotení");
      }

      setExistingRating(rating);
      setUserRating(rating);
      setExistingComment(comment || ratingComment);
      setIsEditingRating(false);
      showStatus("Ďakujeme za vaše hodnotenie!", "success");
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleRemoveParticipant = async (userId: string, userName: string) => {
    showConfirm(
      `Naozaj chcete odstrániť používateľa ${userName} z aktivity?`,
      async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity?.id}/participants/${userId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Chyba pri odstraňovaní účastníka");
          }

          showStatus(`Používateľ ${userName} bol odstránený`, "success");
          await fetchActivity();
        } catch (err: any) {
          showStatus(err.message, "error");
        }
      }
    );
  };

  const handleBlockParticipant = async (userId: string, userName: string) => {
    showConfirm(
      `Naozaj chcete zablokovať používateľa ${userName}? Nebude sa môcť znova prihlásiť.`,
      async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity?.id}/participants/${userId}`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Chyba pri blokovaní účastníka");
          }

          showStatus(`Používateľ ${userName} bol zablokovaný`, "success");
          await fetchActivity();
        } catch (err: any) {
          showStatus(err.message, "error");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-36">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-300">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8 pt-36">
        <div className="max-w-5xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-2xl mb-4">❌</p>
              <h3 className="text-xl font-semibold text-white mb-2">
                {error || "Aktivita nenájdená"}
              </h3>
              <Link href={returnUrl}>
                <Button variant="primary" className="mt-4">
                  Späť na zoznam
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const date = new Date(activity.date);
  const formattedDate = date.toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("sk-SK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isParticipating = activity.participations.some(
    (p) => p.user.id === currentUserId
  );
  const isOrganizer = activity.organizer.id === currentUserId;
  const canJoin =
    !isParticipating &&
    activity.status === "OPEN" &&
    activity.currentParticipants < activity.maxParticipants;

  const fillPercentage =
    (activity.currentParticipants / activity.maxParticipants) * 100;
  const statusInfo = statusLabels[activity.status] || statusLabels.OPEN;

  return (
    <div className="container mx-auto px-4 py-8 pt-36">
      {/* Status Message Toast */}
      {statusMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-white shadow-lg ${
              statusMessage.type === "success"
                ? "bg-emerald-600 border-emerald-500"
                : statusMessage.type === "error"
                ? "bg-red-600 border-red-500"
                : "bg-yellow-600 border-yellow-500"
            }`}
          >
            {statusMessage.type === "success" && (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {statusMessage.type === "error" && (
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
            )}
            {statusMessage.type === "warning" && (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
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

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          />
          <div className="relative bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Potvrdiť akciu
                </h3>
                <p className="text-gray-300 text-sm">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-5 py-2.5 text-sm font-semibold rounded-full backdrop-blur-xl transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#e5e7eb",
                }}
              >
                Zrušiť
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold rounded-full backdrop-blur-xl transition-colors"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.5)",
                  color: "#34d399",
                }}
              >
                Potvrdiť
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link href={returnUrl}>
          <Button variant="secondary" className="mb-8 px-6 py-3 text-lg">
            ← Späť na zoznam
          </Button>
        </Link>

        {/* Header */}
        <Card className="mb-6 relative z-30">
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {activity.title}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-xl text-gray-300">
                    {sportTypeLabels[activity.sportType] || activity.sportType}
                  </p>
                  {activity.isRecurring &&
                    activity.recurrenceFrequency !== "NONE" && (
                      <span
                        className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-semibold rounded-full backdrop-blur-xl"
                        style={{
                          background: "rgba(168, 85, 247, 0.2)",
                          border: "1px solid rgba(168, 85, 247, 0.5)",
                          color: "#c084fc",
                          boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Pravidelná aktivita
                      </span>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isOrganizer && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    👤 Organizátor
                  </span>
                )}
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-xl ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {canJoin && (
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full justify-center"
                >
                  {joining ? "Prihlasovanie..." : "✓ Prihlásiť sa"}
                </Button>
              )}
              {isParticipating && (
                <Button
                  variant="secondary"
                  onClick={handleLeave}
                  disabled={leaving}
                  className="w-full justify-center hover:border-red-500/40 text-red-400 hover:text-red-300"
                >
                  {leaving ? "Odhlasovanie..." : "✗ Odhlásiť sa"}
                </Button>
              )}
              {isOrganizer && (
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full justify-center hover:border-red-500/40 text-red-400 hover:text-red-300"
                >
                  {deleting ? "Mažem..." : "🗑️ Zmazať aktivitu"}
                </Button>
              )}

              <div className="w-full">
                <AddToCalendarDropdown activity={activity} />
              </div>
              <div className="w-full">
                <ShareActivityButton activity={activity} />
              </div>
            </div>

            {/* Add guests section for participants */}
            {isParticipating && activity.status === "OPEN" && (
              <div className="mt-6 p-4 bg-emerald-950/20 border border-emerald-800 rounded-lg">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 max-w-xs">
                    <label
                      htmlFor="guestCount"
                      className="block text-xs font-medium text-white mb-2"
                    >
                      Počet hostí (okrem vás)
                    </label>
                    <input
                      id="guestCount"
                      type="number"
                      min="0"
                      max={
                        activity.maxParticipants -
                        activity.currentParticipants +
                        (activity.participations.find(
                          (p) => p.user.id === currentUserId
                        )?.guestCount || 0)
                      }
                      value={guestCount}
                      onChange={(e) =>
                        setGuestCount(
                          Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                      className="w-full px-4 py-2 border border-white/10 rounded-lg bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleAddGuests}
                    disabled={addingGuests}
                  >
                    {addingGuests ? "Aktualizujem..." : "Aktualizovať"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Celkom miest: Vy + {guestCount}{" "}
                  {guestCount === 1
                    ? "hosť"
                    : guestCount < 5
                    ? "hostia"
                    : "hostí"}{" "}
                  = {1 + guestCount}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Informácie o aktivite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Dátum a čas</p>
                    <p className="text-lg text-white">
                      📅 {formattedDate} o {formattedTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Dĺžka trvania</p>
                    <p className="text-lg text-white">
                      🕐 {activity.duration} minút
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Miesto konania</p>
                    {activity.locationName && (
                      <p className="text-lg font-medium text-white">
                        📍 {activity.locationName}
                      </p>
                    )}
                    <p
                      className={`${
                        activity.locationName ? "text-sm" : "text-lg"
                      } text-gray-300`}
                    >
                      {activity.location}
                    </p>
                    {(activity.locationName ||
                      activity.location ||
                      (activity.latitude && activity.longitude)) && (
                      <a
                        href={
                          activity.locationName
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                activity.locationName + ", " + activity.location
                              )}`
                            : activity.location
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                activity.location
                              )}`
                            : `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-xl transition-colors"
                        style={{
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "1px solid rgba(16, 185, 129, 0.5)",
                          color: "#34d399",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Otvoriť v Mapách
                      </a>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Úroveň hráčov</p>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
                      {skillLevelLabels[activity.skillLevel] ||
                        activity.skillLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Pohlavie</p>
                      <p className="text-lg text-white">
                        {genderLabels[activity.gender] || activity.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Vekové rozpätie
                      </p>
                      <p className="text-lg text-white">
                        {activity.minAge} - {activity.maxAge} rokov
                      </p>
                    </div>
                  </div>

                  {activity.price > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Cena</p>
                      <p className="text-lg font-semibold text-emerald-400">
                        {activity.price.toFixed(2)} €
                      </p>
                    </div>
                  )}

                  {activity.description && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Popis</p>
                      <p className="text-white">{activity.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming instances for recurring activities */}
            {((activity.isRecurring &&
              activity.recurrenceFrequency !== "NONE") ||
              activity.parentActivityId) && (
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setShowUpcoming(!showUpcoming)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Nadchádzajúce termíny
                      {upcomingInstances.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                          {upcomingInstances.length}
                        </span>
                      )}
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${
                        showUpcoming ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </CardTitle>
                </CardHeader>
                {showUpcoming && (
                  <CardContent>
                    {loadingUpcoming ? (
                      <p className="text-sm text-gray-400">Načítavam...</p>
                    ) : upcomingInstances.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Žiadne nadchádzajúce termíny
                      </p>
                    ) : (
                      <>
                        {/* Bulk join buttons */}
                        {currentUserId &&
                          upcomingInstances.some(
                            (inst) =>
                              !inst.participations.some(
                                (p) => p.user.id === currentUserId
                              ) &&
                              inst.currentParticipants < inst.maxParticipants
                          ) && (
                            <div className="mb-4 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                              <h4 className="font-semibold text-white mb-3">
                                Hromadné prihlásenie
                              </h4>
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-white mb-2">
                                  Počet hostí (pre každý termín):
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={bulkJoinGuestCount}
                                  onChange={(e) =>
                                    setBulkJoinGuestCount(
                                      Math.max(
                                        0,
                                        Math.min(
                                          10,
                                          parseInt(e.target.value) || 0
                                        )
                                      )
                                    )
                                  }
                                  className="w-24 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <span className="ml-2 text-sm text-gray-400">
                                  (Celkom: {1 + bulkJoinGuestCount} osôb na
                                  termín)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="primary"
                                  className="text-sm"
                                  onClick={() => {
                                    const totalPerActivity =
                                      1 + bulkJoinGuestCount;
                                    showConfirm(
                                      `Prihlásiť sa na všetky dostupné termíny s ${totalPerActivity} ${
                                        totalPerActivity === 1
                                          ? "osobou"
                                          : "osobami"
                                      }?`,
                                      async () => {
                                        try {
                                          const response = await fetch(
                                            `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join-recurring`,
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              credentials: "include",
                                              body: JSON.stringify({
                                                mode: "all",
                                                guestCount: bulkJoinGuestCount,
                                              }),
                                            }
                                          );
                                          if (response.ok) {
                                            const data = await response.json();
                                            showStatus(data.message, "success");
                                            fetchUpcomingInstances();
                                            fetchActivity();
                                          } else {
                                            const data = await response.json();
                                            showStatus(
                                              data.error ||
                                                "Chyba pri hromadnom prihlásení",
                                              "error"
                                            );
                                          }
                                        } catch (err) {
                                          showStatus(
                                            "Chyba pri hromadnom prihlásení",
                                            "error"
                                          );
                                        }
                                      }
                                    );
                                  }}
                                >
                                  Prihlásiť na všetky
                                </Button>
                                {activity.recurrenceFrequency === "WEEKLY" &&
                                  activity.recurrenceDays.length > 1 && (
                                    <>
                                      {[
                                        ...new Set(
                                          upcomingInstances.map((inst) =>
                                            new Date(inst.date).getDay()
                                          )
                                        ),
                                      ]
                                        .sort()
                                        .map((dayNum) => {
                                          const dayNames = [
                                            "Nedeľa",
                                            "Pondelok",
                                            "Utorok",
                                            "Streda",
                                            "Štvrtok",
                                            "Piatok",
                                            "Sobota",
                                          ];
                                          return (
                                            <Button
                                              key={dayNum}
                                              variant="secondary"
                                              className="text-sm"
                                              onClick={() => {
                                                const totalPerActivity =
                                                  1 + bulkJoinGuestCount;
                                                showConfirm(
                                                  `Prihlásiť sa na všetky ${dayNames[
                                                    dayNum
                                                  ].toLowerCase()} s ${totalPerActivity} ${
                                                    totalPerActivity === 1
                                                      ? "osobou"
                                                      : "osobami"
                                                  }?`,
                                                  async () => {
                                                    try {
                                                      const response =
                                                        await fetch(
                                                          `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join-recurring`,
                                                          {
                                                            method: "POST",
                                                            headers: {
                                                              "Content-Type":
                                                                "application/json",
                                                            },
                                                            credentials:
                                                              "include",
                                                            body: JSON.stringify(
                                                              {
                                                                mode: "specific-days",
                                                                selectedDays: [
                                                                  dayNum,
                                                                ],
                                                                guestCount:
                                                                  bulkJoinGuestCount,
                                                              }
                                                            ),
                                                          }
                                                        );
                                                      if (response.ok) {
                                                        const data =
                                                          await response.json();
                                                        showStatus(
                                                          data.message,
                                                          "success"
                                                        );
                                                        fetchUpcomingInstances();
                                                        fetchActivity();
                                                      } else {
                                                        const data =
                                                          await response.json();
                                                        showStatus(
                                                          data.error ||
                                                            "Chyba pri hromadnom prihlásení",
                                                          "error"
                                                        );
                                                      }
                                                    } catch (err) {
                                                      showStatus(
                                                        "Chyba pri hromadnom prihlásení",
                                                        "error"
                                                      );
                                                    }
                                                  }
                                                );
                                              }}
                                            >
                                              Len{" "}
                                              {dayNames[dayNum].toLowerCase()}
                                            </Button>
                                          );
                                        })}
                                    </>
                                  )}
                              </div>
                            </div>
                          )}

                        {/* Bulk leave buttons */}
                        {currentUserId &&
                          upcomingInstances.some((inst) =>
                            inst.participations.some(
                              (p) => p.user.id === currentUserId
                            )
                          ) && (
                            <div className="mb-4 p-4 bg-white/[0.03] rounded-lg border border-red-500/30">
                              <h4 className="font-semibold text-white mb-3">
                                Hromadné odhlásenie
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="secondary"
                                  className="text-sm bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400"
                                  onClick={() => {
                                    const participatingCount =
                                      upcomingInstances.filter((inst) =>
                                        inst.participations.some(
                                          (p) => p.user.id === currentUserId
                                        )
                                      ).length;
                                    showConfirm(
                                      `Odhlásiť sa zo všetkých ${participatingCount} termínov?`,
                                      async () => {
                                        try {
                                          const response = await fetch(
                                            `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/leave-recurring`,
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              credentials: "include",
                                              body: JSON.stringify({
                                                mode: "all",
                                              }),
                                            }
                                          );
                                          if (response.ok) {
                                            const data = await response.json();
                                            showStatus(data.message, "success");
                                            fetchUpcomingInstances();
                                            fetchActivity();
                                          } else {
                                            const data = await response.json();
                                            showStatus(
                                              data.error ||
                                                "Chyba pri hromadnom odhlásení",
                                              "error"
                                            );
                                          }
                                        } catch (err) {
                                          showStatus(
                                            "Chyba pri hromadnom odhlásení",
                                            "error"
                                          );
                                        }
                                      }
                                    );
                                  }}
                                >
                                  Odhlásiť zo všetkých
                                </Button>
                                {activity.recurrenceFrequency === "WEEKLY" &&
                                  activity.recurrenceDays.length > 1 && (
                                    <>
                                      {[
                                        ...new Set(
                                          upcomingInstances
                                            .filter((inst) =>
                                              inst.participations.some(
                                                (p) =>
                                                  p.user.id === currentUserId
                                              )
                                            )
                                            .map((inst) =>
                                              new Date(inst.date).getDay()
                                            )
                                        ),
                                      ]
                                        .sort()
                                        .map((dayNum) => {
                                          const dayNames = [
                                            "Nedeľa",
                                            "Pondelok",
                                            "Utorok",
                                            "Streda",
                                            "Štvrtok",
                                            "Piatok",
                                            "Sobota",
                                          ];
                                          return (
                                            <Button
                                              key={dayNum}
                                              variant="secondary"
                                              className="text-sm bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                                              onClick={() => {
                                                const participatingOnDay =
                                                  upcomingInstances.filter(
                                                    (inst) =>
                                                      new Date(
                                                        inst.date
                                                      ).getDay() === dayNum &&
                                                      inst.participations.some(
                                                        (p) =>
                                                          p.user.id ===
                                                          currentUserId
                                                      )
                                                  ).length;
                                                showConfirm(
                                                  `Odhlásiť sa zo všetkých ${dayNames[
                                                    dayNum
                                                  ].toLowerCase()} (${participatingOnDay} termínov)?`,
                                                  async () => {
                                                    try {
                                                      const response =
                                                        await fetch(
                                                          `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/leave-recurring`,
                                                          {
                                                            method: "POST",
                                                            headers: {
                                                              "Content-Type":
                                                                "application/json",
                                                            },
                                                            credentials:
                                                              "include",
                                                            body: JSON.stringify(
                                                              {
                                                                mode: "specific-days",
                                                                selectedDays: [
                                                                  dayNum,
                                                                ],
                                                              }
                                                            ),
                                                          }
                                                        );
                                                      if (response.ok) {
                                                        const data =
                                                          await response.json();
                                                        showStatus(
                                                          data.message,
                                                          "success"
                                                        );
                                                        fetchUpcomingInstances();
                                                        fetchActivity();
                                                      } else {
                                                        const data =
                                                          await response.json();
                                                        showStatus(
                                                          data.error ||
                                                            "Chyba pri hromadnom odhlásení",
                                                          "error"
                                                        );
                                                      }
                                                    } catch (err) {
                                                      showStatus(
                                                        "Chyba pri hromadnom odhlásení",
                                                        "error"
                                                      );
                                                    }
                                                  }
                                                );
                                              }}
                                            >
                                              Len{" "}
                                              {dayNames[dayNum].toLowerCase()}
                                            </Button>
                                          );
                                        })}
                                    </>
                                  )}
                              </div>
                            </div>
                          )}

                        <div className="space-y-3">
                          {upcomingInstances.map((instance) => {
                            const instanceDate = new Date(instance.date);
                            const formattedDate =
                              instanceDate.toLocaleDateString("sk-SK", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });
                            const formattedTime =
                              instanceDate.toLocaleTimeString("sk-SK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                            const isCurrentActivity =
                              instance.id === activity.id;
                            const isParticipatingInInstance =
                              instance.participations.some(
                                (p) => p.user.id === currentUserId
                              );

                            return (
                              <div
                                key={instance.id}
                                className={`p-4 rounded-lg border transition-all ${
                                  isCurrentActivity
                                    ? "bg-emerald-500/10 border-emerald-500"
                                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-400">
                                        {instanceDate.getDate()}
                                      </div>
                                      <div className="text-xs text-gray-400 uppercase">
                                        {instanceDate.toLocaleDateString(
                                          "sk-SK",
                                          { month: "short" }
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">
                                        {formattedDate} o {formattedTime}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {instance.currentParticipants}/
                                        {instance.maxParticipants} účastníkov
                                      </p>
                                    </div>
                                  </div>
                                  {isCurrentActivity && (
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded shadow-sm">
                                      Aktuálny termín
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  {!isCurrentActivity && (
                                    <Link
                                      href={`/activities/${instance.id}`}
                                      className="flex-1"
                                    >
                                      <Button
                                        variant="secondary"
                                        className="w-full text-sm py-2"
                                      >
                                        Zobraziť detail
                                      </Button>
                                    </Link>
                                  )}
                                  {!isParticipatingInInstance &&
                                    instance.currentParticipants <
                                      instance.maxParticipants && (
                                      <div className="flex-1 flex gap-2">
                                        <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg h-10 shrink-0">
                                          <button
                                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-l-lg"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setInstanceGuestCounts((prev) => {
                                                const current =
                                                  prev[instance.id] || 0;
                                                return {
                                                  ...prev,
                                                  [instance.id]: Math.max(
                                                    0,
                                                    current - 1
                                                  ),
                                                };
                                              });
                                            }}
                                          >
                                            -
                                          </button>
                                          <div className="w-8 text-center text-sm font-medium text-white">
                                            {instanceGuestCounts[instance.id] ||
                                              0}
                                          </div>
                                          <button
                                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-r-lg"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setInstanceGuestCounts((prev) => {
                                                const current =
                                                  prev[instance.id] || 0;
                                                return {
                                                  ...prev,
                                                  [instance.id]: Math.min(
                                                    10,
                                                    current + 1
                                                  ),
                                                };
                                              });
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                        <Button
                                          variant="primary"
                                          className="flex-1 text-sm py-2"
                                          onClick={async () => {
                                            const guests =
                                              instanceGuestCounts[
                                                instance.id
                                              ] || 0;
                                            try {
                                              const response = await fetch(
                                                `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${instance.id}/join`,
                                                {
                                                  method: "POST",
                                                  headers: {
                                                    "Content-Type":
                                                      "application/json",
                                                  },
                                                  credentials: "include",
                                                  body: JSON.stringify({
                                                    guestCount: guests,
                                                  }),
                                                }
                                              );
                                              if (response.ok) {
                                                fetchUpcomingInstances();
                                                if (
                                                  instance.id === activity?.id
                                                ) {
                                                  fetchActivity();
                                                }
                                                // Reset guest count for this instance
                                                setInstanceGuestCounts(
                                                  (prev) => {
                                                    const newState = {
                                                      ...prev,
                                                    };
                                                    delete newState[
                                                      instance.id
                                                    ];
                                                    return newState;
                                                  }
                                                );
                                                showStatus(
                                                  `Úspešne prihlásený${
                                                    guests > 0
                                                      ? ` (+${guests} hostia)`
                                                      : ""
                                                  }!`,
                                                  "success"
                                                );
                                              } else {
                                                const data =
                                                  await response.json();
                                                showStatus(
                                                  data.error ||
                                                    "Chyba pri prihlásení",
                                                  "error"
                                                );
                                              }
                                            } catch (err) {
                                              showStatus(
                                                "Chyba pri prihlásení",
                                                "error"
                                              );
                                            }
                                          }}
                                        >
                                          Prihlásiť
                                          {instanceGuestCounts[instance.id] >
                                            0 &&
                                            ` (+${
                                              instanceGuestCounts[instance.id]
                                            })`}
                                        </Button>
                                      </div>
                                    )}
                                  {isParticipatingInInstance && (
                                    <div className="flex-1 flex items-center justify-between gap-2">
                                      <span className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Prihlásený
                                      </span>
                                      <Button
                                        variant="secondary"
                                        className="text-xs py-1 px-2 bg-red-950/30 hover:bg-red-950/50 text-red-400 border-red-700"
                                        disabled={
                                          leavingInstance === instance.id
                                        }
                                        onClick={() =>
                                          handleLeaveInstance(instance.id)
                                        }
                                      >
                                        {leavingInstance === instance.id
                                          ? "..."
                                          : "Odhlásiť"}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Map */}
            {activity.latitude && activity.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Mapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-white/[0.03]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={
                        activity.locationName
                          ? `https://maps.google.com/maps?q=${encodeURIComponent(
                              activity.locationName + ", " + activity.location
                            )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                          : `https://maps.google.com/maps?q=${activity.latitude},${activity.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                      }
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants progress */}
            <Card>
              <CardHeader>
                <CardTitle>Obsadenosť</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Účastníci</span>
                    <span className="font-semibold text-white">
                      {activity.currentParticipants}/{activity.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activity.maxParticipants - activity.currentParticipants}{" "}
                    voľných miest
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Organizátor</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/users/${activity.organizer.id}`}
                  className="flex items-center gap-3 hover:bg-white/[0.03] rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                >
                  {activity.organizer.image ? (
                    <img
                      src={activity.organizer.image}
                      alt={activity.organizer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      {activity.organizer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">
                      {activity.organizer.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {activity.organizer.email}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Participants list */}
            <Card>
              <CardHeader>
                <CardTitle>Prihlásení účastníci</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity.participations.map((participation) => (
                    <div
                      key={participation.id}
                      className="flex items-center justify-between p-2 -m-2 hover:bg-white/[0.03] rounded-lg transition-colors group"
                    >
                      <Link
                        href={`/users/${participation.user.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        {participation.user.image ? (
                          <img
                            src={participation.user.image}
                            alt={participation.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                            {participation.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm text-white">
                          {participation.user.name}
                          {participation.guestCount > 0 && (
                            <span className="ml-2 text-xs text-gray-400">
                              +{participation.guestCount}
                            </span>
                          )}
                          {participation.user.id === activity.organizer.id && (
                            <span className="ml-2 text-xs text-emerald-400">
                              (Organizátor)
                            </span>
                          )}
                        </p>
                      </Link>

                      {isOrganizer &&
                        participation.user.id !== currentUserId && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveParticipant(
                                  participation.user.id,
                                  participation.user.name
                                );
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                              title="Odstrániť z aktivity"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleBlockParticipant(
                                  participation.user.id,
                                  participation.user.name
                                );
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                              title="Zablokovať používateľa"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line
                                  x1="4.93"
                                  y1="4.93"
                                  x2="19.07"
                                  y2="19.07"
                                ></line>
                              </svg>
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Section - show for all participants */}
            {isParticipating && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ohodnotiť aktivitu</CardTitle>
                    {existingRating && !isEditingRating && (
                      <button
                        onClick={() => setIsEditingRating(true)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Upraviť hodnotenie
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                      {existingRating && !isEditingRating
                        ? "Vaše hodnotenie:"
                        : "Ako sa vám páčila táto aktivita?"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          disabled={
                            submittingRating ||
                            (!!existingRating && !isEditingRating)
                          }
                          className={`text-3xl transition-all ${
                            existingRating && !isEditingRating
                              ? "cursor-default"
                              : "cursor-pointer hover:scale-110"
                          }`}
                          onMouseEnter={() =>
                            (!existingRating || isEditingRating) &&
                            setHoverRating(star)
                          }
                          onMouseLeave={() =>
                            (!existingRating || isEditingRating) &&
                            setHoverRating(0)
                          }
                          onClick={() => {
                            if (!existingRating || isEditingRating) {
                              setUserRating(star);
                            }
                          }}
                        >
                          {(hoverRating || userRating || existingRating || 0) >=
                          star ? (
                            <span className="text-yellow-400">★</span>
                          ) : (
                            <span className="text-gray-600">☆</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Comment field */}
                    {(!existingRating || isEditingRating) && (
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Slovné hodnotenie (voliteľné):
                        </label>
                        <textarea
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          placeholder="Napíšte svoj názor na aktivitu..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Existing comment display */}
                    {existingComment && !isEditingRating && (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-300 italic">
                          "{existingComment}"
                        </p>
                      </div>
                    )}

                    {/* Submit button for new/edited rating */}
                    {(!existingRating || isEditingRating) && userRating > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitRating(userRating)}
                          disabled={submittingRating}
                          className="px-5 py-2.5 rounded-full font-semibold backdrop-blur-xl transition-colors disabled:opacity-50"
                          style={{
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.5)",
                            color: "#34d399",
                          }}
                        >
                          {submittingRating
                            ? "Odosielam..."
                            : existingRating
                            ? "Uložiť zmeny"
                            : "Odoslať hodnotenie"}
                        </button>
                        {isEditingRating && (
                          <button
                            onClick={() => {
                              setIsEditingRating(false);
                              setUserRating(existingRating || 0);
                              setRatingComment(existingComment);
                            }}
                            className="px-5 py-2.5 rounded-full font-semibold backdrop-blur-xl transition-colors"
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#9ca3af",
                            }}
                          >
                            Zrušiť
                          </button>
                        )}
                      </div>
                    )}

                    {existingRating && !isEditingRating && (
                      <p className="text-sm text-emerald-400">
                        Ďakujeme za vaše hodnotenie!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Activity Chat */}
        <ActivityChat
          activityId={activity.id}
          currentUserId={currentUserId || undefined}
          isLoggedIn={!!currentUserId}
        />
      </div>
    </div>
  );
}
