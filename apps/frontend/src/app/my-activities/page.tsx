"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useSession } from "@/lib/auth-client";

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
  parentActivityId: string | null;
  venue?: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;
  organizer: {
    id: string;
    name: string;
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

interface MyActivitiesResponse {
  created: Activity[];
  joined: Activity[];
  stats: {
    totalCreated: number;
    totalJoined: number;
    upcomingCreated: number;
    upcomingJoined: number;
  };
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

export default function MyActivitiesPage() {
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<MyActivitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set()
  );
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);

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
    if (!isPending) {
      if (session) {
        fetchMyActivities();
      } else {
        setLoading(false);
      }
    }
  }, [session, isPending]);

  const fetchMyActivities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/my`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Chyba pri načítaní aktivít");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedActivities.size === 0) return;
    showConfirm(
      `Naozaj chcete zmazať ${selectedActivities.size} ${
        selectedActivities.size === 1 ? "aktivitu" : "aktivít"
      }?`,
      async () => {
        setBulkActionLoading(true);
        try {
          const promises = Array.from(selectedActivities).map((activityId) =>
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}`,
              {
                method: "DELETE",
                credentials: "include",
              }
            )
          );
          await Promise.all(promises);
          setSelectedActivities(new Set());
          await fetchMyActivities();
          showStatus("Aktivity boli úspešne zmazané", "success");
        } catch (err) {
          showStatus("Chyba pri mazaní aktivít", "error");
        } finally {
          setBulkActionLoading(false);
        }
      }
    );
  };

  const handleBulkLeave = async () => {
    if (selectedActivities.size === 0) return;
    showConfirm(
      `Naozaj sa chcete odhlásiť z ${selectedActivities.size} ${
        selectedActivities.size === 1 ? "aktivity" : "aktivít"
      }?`,
      async () => {
        setBulkActionLoading(true);
        try {
          const promises = Array.from(selectedActivities).map((activityId) =>
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/join`,
              {
                method: "DELETE",
                credentials: "include",
              }
            )
          );
          await Promise.all(promises);
          setSelectedActivities(new Set());
          await fetchMyActivities();
          showStatus("Boli ste odhlásení z aktivít", "success");
        } catch (err) {
          showStatus("Chyba pri odhlasovaní z aktivít", "error");
        } finally {
          setBulkActionLoading(false);
        }
      }
    );
  };

  const toggleSelection = (activityId: string) => {
    const newSelection = new Set(selectedActivities);
    if (newSelection.has(activityId)) {
      newSelection.delete(activityId);
    } else {
      newSelection.add(activityId);
    }
    setSelectedActivities(newSelection);
  };

  const selectAll = () => {
    const displayActivities =
      activeTab === "created" ? data?.created || [] : data?.joined || [];
    setSelectedActivities(new Set(displayActivities.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedActivities(new Set());
  };

  const renderActivity = (activity: Activity, isCreator: boolean) => {
    const activityDate = new Date(activity.date);
    const formattedDate = activityDate.toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const formattedTime = activityDate.toLocaleTimeString("sk-SK", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const isPast = activityDate < new Date();
    const statusInfo = statusLabels[activity.status];
    const isSelected = selectedActivities.has(activity.id);

    const handleClick = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("activityListSource", "/my-activities");
      }
    };

    return (
      <Card
        key={activity.id}
        hover
        className={`relative transition-all ${
          isSelected ? "ring-2 ring-emerald-500" : ""
        }`}
      >
        <div
          className="absolute top-4 left-4 z-10 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSelection(activity.id);
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelection(activity.id)}
            className="w-5 h-5 cursor-pointer accent-emerald-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <Link href={`/activities/${activity.id}`} onClick={handleClick}>
          <div className="absolute top-4 right-4 flex gap-2">
            {((activity.isRecurring &&
              activity.recurrenceFrequency !== "NONE") ||
              activity.parentActivityId) && (
              <span
                className="px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl flex items-center gap-1"
                style={{
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.5)",
                  color: "#c084fc",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Opakovaná
              </span>
            )}
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-3xl font-bold text-emerald-500">
                  {activityDate.getDate()}
                </div>
                <div className="text-sm text-gray-300 uppercase">
                  {activityDate.toLocaleDateString("sk-SK", { month: "short" })}
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{activity.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    {sportTypeLabels[activity.sportType] || activity.sportType}
                  </span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span>{formattedTime}</span>
                </div>
                {isCreator && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">
                      👤 Organizátor
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>
                  {activity.currentParticipants}/{activity.maxParticipants}{" "}
                  účastníkov
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
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
                <span>{activity.locationName || activity.location}</span>
              </div>
              {activity.price > 0 && (
                <div className="flex items-center gap-2 text-sm">
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
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <span>{activity.price} €</span>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-300">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-8 pt-36 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card>
            <CardContent>
              <div className="text-center py-16 px-8">
                <p className="text-6xl mb-6">🔒</p>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Prihlásenie potrebné
                </h3>
                <p className="text-lg text-gray-300 mb-8">
                  Pre zobrazenie vašich aktivít sa musíte prihlásiť
                </p>
                <Link href="/auth/signin?redirect=/my-activities">
                  <Button variant="primary">Prihlásiť sa</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 pt-36">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const displayActivities =
    activeTab === "created" ? data.created : data.joined;
  const upcomingCount =
    activeTab === "created"
      ? data.stats.upcomingCreated
      : data.stats.upcomingJoined;

  return (
    <div className="min-h-screen p-8 pt-36">
      {/* Status Message Toast */}
      {statusMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-lg"
            style={{
              background:
                statusMessage.type === "success"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : statusMessage.type === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                statusMessage.type === "success"
                  ? "0 8px 32px rgba(16, 185, 129, 0.4)"
                  : statusMessage.type === "error"
                  ? "0 8px 32px rgba(239, 68, 68, 0.4)"
                  : "0 8px 32px rgba(245, 158, 11, 0.4)",
            }}
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
            <span className="text-[15px] font-semibold">
              {statusMessage.text}
            </span>
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
          <div
            className="relative p-6 max-w-md w-full mx-4 rounded-2xl"
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              animation:
                "springScale 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
          >
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
                <p className="text-gray-300 text-[15px]">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-5 py-2.5 text-[15px] font-semibold rounded-full transition-all duration-200 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#e5e7eb",
                  boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.4)",
                }}
              >
                Zrušiť
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-5 py-2.5 text-[15px] font-semibold rounded-full transition-all duration-200 backdrop-blur-xl"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.5)",
                  color: "#34d399",
                  boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.4)",
                }}
              >
                Potvrdiť
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Moje aktivity</h1>
          <p className="text-gray-300">Prehľad všetkých tvojich aktivít</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-1">
                  {data.stats.totalCreated}
                </div>
                <div className="text-sm text-gray-300">Vytvorené</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 mb-1">
                  {data.stats.totalJoined}
                </div>
                <div className="text-sm text-gray-300">Prihlásené</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {data.stats.upcomingCreated}
                </div>
                <div className="text-sm text-gray-300">
                  Nadchádzajúce (vytvorené)
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {data.stats.upcomingJoined}
                </div>
                <div className="text-sm text-gray-300">
                  Nadchádzajúce (prihlásené)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab("created");
              setSelectedActivities(new Set());
            }}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "created"
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Vytvorené ({data.stats.totalCreated})
          </button>
          <button
            onClick={() => {
              setActiveTab("joined");
              setSelectedActivities(new Set());
            }}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "joined"
                ? "text-emerald-500 border-b-2 border-emerald-500"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Prihlásené ({data.stats.totalJoined})
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {displayActivities.length > 0 && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-[15px] text-white font-semibold">
                {selectedActivities.size > 0
                  ? `Vybratých: ${selectedActivities.size}`
                  : "Vyberte aktivity"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={selectAll}
                  disabled={bulkActionLoading}
                >
                  Vybrať všetky
                </Button>
                <Button
                  variant="secondary"
                  onClick={deselectAll}
                  disabled={bulkActionLoading || selectedActivities.size === 0}
                >
                  Zrušiť výber
                </Button>
              </div>
            </div>
            {selectedActivities.size > 0 && (
              <div className="flex gap-2">
                {activeTab === "created" ? (
                  <Button
                    variant="secondary"
                    className="text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading
                      ? "Mažem..."
                      : `Zmazať (${selectedActivities.size})`}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="text-sm bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20"
                    onClick={handleBulkLeave}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading
                      ? "Odhlasovanie..."
                      : `Odhlásiť sa (${selectedActivities.size})`}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activities Grid */}
        {displayActivities.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏃</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeTab === "created"
                    ? "Zatiaľ si nevytvoril žiadne aktivity"
                    : "Zatiaľ si sa neprihlásil na žiadne aktivity"}
                </h3>
                <p className="text-gray-300 mb-6">
                  {activeTab === "created"
                    ? "Vytvor svoju prvú športovú aktivitu a pozvi ostatných"
                    : "Prehliadni dostupné aktivity a pripoj sa k niektorej"}
                </p>
                <Link
                  href={
                    activeTab === "created"
                      ? "/activities/create"
                      : "/activities"
                  }
                >
                  <Button variant="primary">
                    {activeTab === "created"
                      ? "Vytvoriť aktivitu"
                      : "Prehliadať aktivity"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayActivities.map((activity) =>
              renderActivity(activity, activeTab === "created")
            )}
          </div>
        )}
      </div>
    </div>
  );
}
