"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

  const handleClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activityListSource", "/activities");
    }
  };

  return (
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
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full shadow-sm">
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

          {/* Location */}
          <div className="mb-3">
            <p className="text-sm text-white">
              📍 {activity.locationName || activity.location}
            </p>
          </div>

          {/* Skill Level */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
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
          <Link href="/activities/create">
            <button className="px-8 py-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold text-lg transition-all backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 whitespace-nowrap">
              + Vytvoriť aktivitu
            </button>
          </Link>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          onSearch={handleSearch}
          loading={loading}
          resultCount={activities.length}
        />

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
