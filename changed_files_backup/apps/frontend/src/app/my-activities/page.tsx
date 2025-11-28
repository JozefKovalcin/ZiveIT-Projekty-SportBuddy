"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useSession } from "@/lib/auth-client";

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
  OPEN: { label: "Otvorená", color: "bg-green-500" },
  FULL: { label: "Plná", color: "bg-orange-500" },
  CANCELLED: { label: "Zrušená", color: "bg-red-500" },
  COMPLETED: { label: "Ukončená", color: "bg-gray-500" },
};

export default function MyActivitiesPage() {
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<MyActivitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"created" | "joined">("created");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
    if (!confirm(`Naozaj chcete zmazať ${selectedActivities.size} ${selectedActivities.size === 1 ? 'aktivitu' : 'aktivít'}?`)) return;

    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedActivities).map(activityId =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      setSelectedActivities(new Set());
      await fetchMyActivities();
    } catch (err) {
      alert("Chyba pri mazaní aktivít");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkLeave = async () => {
    if (selectedActivities.size === 0) return;
    if (!confirm(`Naozaj sa chcete odhlásiť z ${selectedActivities.size} ${selectedActivities.size === 1 ? 'aktivity' : 'aktivít'}?`)) return;

    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedActivities).map(activityId =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/join`, {
          method: "DELETE",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      setSelectedActivities(new Set());
      await fetchMyActivities();
    } catch (err) {
      alert("Chyba pri odhlasovaní z aktivít");
    } finally {
      setBulkActionLoading(false);
    }
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
    const displayActivities = activeTab === "created" ? data?.created || [] : data?.joined || [];
    setSelectedActivities(new Set(displayActivities.map(a => a.id)));
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
        className={`relative transition-all ${isSelected ? 'ring-2 ring-[color:var(--fluent-accent)]' : ''}`}
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
            className="w-5 h-5 cursor-pointer accent-[color:var(--fluent-accent)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <Link href={`/activities/${activity.id}`} onClick={handleClick}>
          <div className="absolute top-4 right-4 flex gap-2">
            {((activity.isRecurring && activity.recurrenceFrequency !== "NONE") || activity.parentActivityId) && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Opakovaná
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-3xl font-bold text-[color:var(--fluent-accent)]">
                  {activityDate.getDate()}
                </div>
                <div className="text-sm text-[color:var(--fluent-text-secondary)] uppercase">
                  {activityDate.toLocaleDateString("sk-SK", { month: "short" })}
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{activity.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-[color:var(--fluent-text-secondary)]">
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
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>
                  {activity.currentParticipants}/{activity.maxParticipants} účastníkov
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{activity.locationName || activity.location}</span>
              </div>
              {activity.price > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[color:var(--fluent-text-secondary)]">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card>
            <CardContent>
              <div className="text-center py-16 px-8">
                <p className="text-6xl mb-6">🔒</p>
                <h3 className="text-2xl font-semibold text-[color:var(--fluent-text)] mb-4">
                  Prihlásenie potrebné
                </h3>
                <p className="text-lg text-[color:var(--fluent-text-secondary)] mb-8">
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
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const displayActivities = activeTab === "created" ? data.created : data.joined;
  const upcomingCount = activeTab === "created" ? data.stats.upcomingCreated : data.stats.upcomingJoined;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-2">
            Moje aktivity
          </h1>
          <p className="text-[color:var(--fluent-text-secondary)]">
            Prehľad všetkých tvojich aktivít
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-[color:var(--fluent-accent)] mb-1">
                  {data.stats.totalCreated}
                </div>
                <div className="text-sm text-[color:var(--fluent-text-secondary)]">
                  Vytvorené
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-[color:var(--fluent-accent)] mb-1">
                  {data.stats.totalJoined}
                </div>
                <div className="text-sm text-[color:var(--fluent-text-secondary)]">
                  Prihlásené
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {data.stats.upcomingCreated}
                </div>
                <div className="text-sm text-[color:var(--fluent-text-secondary)]">
                  Nadchádzajúce (vytvorené)
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {data.stats.upcomingJoined}
                </div>
                <div className="text-sm text-[color:var(--fluent-text-secondary)]">
                  Nadchádzajúce (prihlásené)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[color:var(--fluent-border)]">
          <button
            onClick={() => {
              setActiveTab("created");
              setSelectedActivities(new Set());
            }}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "created"
                ? "text-[color:var(--fluent-accent)] border-b-2 border-[color:var(--fluent-accent)]"
                : "text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
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
                ? "text-[color:var(--fluent-accent)] border-b-2 border-[color:var(--fluent-accent)]"
                : "text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
            }`}
          >
            Prihlásené ({data.stats.totalJoined})
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {displayActivities.length > 0 && (
          <div className="mb-6 p-4 bg-[color:var(--fluent-surface-secondary)] rounded-lg border border-[color:var(--fluent-border)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[color:var(--fluent-text)]">
                {selectedActivities.size > 0 
                  ? `Vybratých: ${selectedActivities.size}` 
                  : 'Vyberte aktivity'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={selectAll}
                  disabled={bulkActionLoading}
                >
                  Vybrať všetky
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm"
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
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? "Mažem..." : `Zmazať (${selectedActivities.size})`}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="text-sm bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 dark:text-orange-400"
                    onClick={handleBulkLeave}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? "Odhlasovanie..." : `Odhlásiť sa (${selectedActivities.size})`}
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
                <h3 className="text-xl font-semibold text-[color:var(--fluent-text)] mb-2">
                  {activeTab === "created" ? "Zatiaľ si nevytvoril žiadne aktivity" : "Zatiaľ si sa neprihlásil na žiadne aktivity"}
                </h3>
                <p className="text-[color:var(--fluent-text-secondary)] mb-6">
                  {activeTab === "created" 
                    ? "Vytvor svoju prvú športovú aktivitu a pozvi ostatných"
                    : "Prehliadni dostupné aktivity a pripoj sa k niektorej"
                  }
                </p>
                <Link href={activeTab === "created" ? "/activities/create" : "/activities"}>
                  <Button variant="primary">
                    {activeTab === "created" ? "Vytvoriť aktivitu" : "Prehliadať aktivity"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayActivities.map((activity) => renderActivity(activity, activeTab === "created"))}
          </div>
        )}
      </div>
    </div>
  );
}