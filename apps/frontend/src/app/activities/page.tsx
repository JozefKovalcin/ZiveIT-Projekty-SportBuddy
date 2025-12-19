"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import SearchAndFilter, { FilterState } from "@/components/SearchAndFilter";

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
  isRecurring: boolean;
  recurrenceFrequency: string;
  parentActivityId: string | null;
  upcomingInstances?: Activity[];
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
  participations: any[];
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

const statusLabels: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Otvorená", color: "text-emerald-400" },
  FULL: { label: "Plná", color: "text-orange-400" },
  CANCELLED: { label: "Zrušená", color: "text-red-400" },
  COMPLETED: { label: "Ukončená", color: "text-gray-400" },
};

function ActivityCard({ activity }: { activity: Activity }) {
  const [showInstances, setShowInstances] = useState(false);
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

  const freeSpots = activity.maxParticipants - activity.currentParticipants;
  const statusInfo = statusLabels[activity.status] || statusLabels.OPEN;

  const hasUpcomingInstances = activity.upcomingInstances && activity.upcomingInstances.length > 0;

  const handleClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activityListSource", "/activities");
    }
  };

  const handleToggleInstances = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInstances(!showInstances);
  };

  return (
    <div>
      <Link href={`/activities/${activity.id}`} onClick={handleClick}>
        <Card hover className="h-full">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {activity.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-gray-300">
                    {sportTypeLabels[activity.sportType] || activity.sportType}
                  </p>
                  {((activity.isRecurring &&
                    activity.recurrenceFrequency !== "NONE") ||
                    activity.parentActivityId) && (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-xl"
                      style={{
                        background: "rgba(168, 85, 247, 0.2)",
                        border: "1px solid rgba(168, 85, 247, 0.5)",
                        color: "#c084fc",
                        boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
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
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                      Opakovaná
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Date & Time */}
            <div className="mb-3 space-y-1">
              <p className="text-sm text-white">📅 {formattedDate}</p>
              <p className="text-sm text-white">
                🕐 {formattedTime} ({activity.duration} min)
              </p>
            </div>

            {/* Show upcoming instances button if recurring */}
            {hasUpcomingInstances && (
              <button
                onClick={handleToggleInstances}
                className="mb-3 text-left px-3 py-2 rounded-lg transition-all backdrop-blur-xl hover:bg-white/5"
                style={{
                  background: "rgba(168, 85, 247, 0.1)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-300">
                    {showInstances ? "Skryť termíny" : `+${activity.upcomingInstances!.length} ďalších ${activity.upcomingInstances!.length === 1 ? 'termín' : activity.upcomingInstances!.length < 5 ? 'termíny' : 'termínov'}`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-purple-300 transition-transform ${showInstances ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            )}

            {/* Location */}
            <div className="mb-3">
              <p className="text-sm text-white">
                📍 {activity.locationName || activity.location}
              </p>
            </div>

            {/* Skill Level */}
            <div className="mb-3">
              <span
                className="inline-block px-4 py-1.5 text-xs font-semibold rounded-full backdrop-blur-xl"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#34d399",
                  boxShadow: "0 4px 12px -3px rgba(0, 0, 0, 0.3)",
                }}
              >
                {skillLevelLabels[activity.skillLevel] || activity.skillLevel}
              </span>
            </div>

            {/* Participants */}
            <div className="mt-auto pt-3 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">
                  Účastníci: {activity.currentParticipants}/
                  {activity.maxParticipants}
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  {freeSpots > 0 ? `${freeSpots} voľných miest` : "Obsadené"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Upcoming instances dropdown */}
      {showInstances && hasUpcomingInstances && (
        <div className="mt-2 space-y-2">
          {activity.upcomingInstances!.map((instance) => {
            const instanceDate = new Date(instance.date);
            const instanceFormattedDate = instanceDate.toLocaleDateString("sk-SK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const instanceFormattedTime = instanceDate.toLocaleTimeString("sk-SK", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const instanceFreeSpots = instance.maxParticipants - instance.currentParticipants;

            return (
              <Link key={instance.id} href={`/activities/${instance.id}`} onClick={handleClick}>
                <div
                  className="p-3 rounded-lg cursor-pointer transition-colors hover:border-purple-500/40"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                  }}
                >
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="text-white font-medium">📅 {instanceFormattedDate}</p>
                      <p className="text-gray-300 text-xs mt-1">🕐 {instanceFormattedTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-xs">
                        {instance.currentParticipants}/{instance.maxParticipants} účastníkov
                      </p>
                      <p className="text-emerald-400 text-xs mt-1">
                        {instanceFreeSpots > 0 ? `${instanceFreeSpots} voľných` : "Obsadené"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-white/10 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </Card>
  );
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async (filters: FilterState) => {
    try {
      setLoading(true);
      setError("");

      // Build query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const queryString = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/activities${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Chyba pri načítaní aktivít");
      }
      const data = await response.json();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - read URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      fetchActivities({
        search: params.get("search") || "",
        sportType: params.get("sportType") || "",
        skillLevel: params.get("skillLevel") || "",
        gender: params.get("gender") || "",
        minPrice: params.get("minPrice") || "",
        maxPrice: params.get("maxPrice") || "",
        minAge: params.get("minAge") || "",
        maxAge: params.get("maxAge") || "",
        dateFrom: params.get("dateFrom") || "",
        dateTo: params.get("dateTo") || "",
      });
    }
  }, [fetchActivities]);

  const handleSearch = useCallback(
    (filters: FilterState) => {
      fetchActivities(filters);
    },
    [fetchActivities]
  );

  return (
    <div className="min-h-screen relative overflow-hidden pt-36">
      {/* Background Effects (Orbs) */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Športové aktivity
            </h1>
            <p className="text-gray-300">
              Nájdi si aktivitu a pripoj sa k ostatným
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="h-[52px] pl-6 pr-10 text-lg whitespace-nowrap gap-2"
            onClick={() => router.push("/activities/create")}
          >
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Vytvoriť aktivitu
          </Button>
        </div>

        {/* Search and Filter */}
        <Suspense fallback={null}>
          <SearchAndFilter
            onSearch={handleSearch}
            loading={loading}
            resultCount={activities.length}
          />
        </Suspense>

        {/* Error */}
        {error && (
          <div
            className="mt-6 p-4 rounded-2xl text-red-500"
            style={{
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && activities.length === 0 && !error && (
          <div className="mt-6">
            <Card>
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Žiadne výsledky
                </h3>
                <p className="text-gray-300 mb-6">
                  Skús zmeniť vyhľadávacie kritériá alebo vytvor novú aktivitu
                </p>
                <Link href="/activities/create">
                  <Button variant="primary">Vytvoriť aktivitu</Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Activities grid */}
        {!loading && activities.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
