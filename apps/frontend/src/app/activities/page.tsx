"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
  OPEN: { label: "Otvorená", color: "text-green-500" },
  FULL: { label: "Plná", color: "text-orange-500" },
  CANCELLED: { label: "Zrušená", color: "text-red-500" },
  COMPLETED: { label: "Ukončená", color: "text-gray-500" },
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

  return (
    <Link href={`/activities/${activity.id}`}>
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[color:var(--fluent-text)] mb-1">
                {activity.title}
              </h3>
              <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                {sportTypeLabels[activity.sportType] || activity.sportType}
              </p>
            </div>
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Date & Time */}
          <div className="mb-3 space-y-1">
            <p className="text-sm text-[color:var(--fluent-text)]">
              📅 {formattedDate}
            </p>
            <p className="text-sm text-[color:var(--fluent-text)]">
              🕐 {formattedTime} ({activity.duration} min)
            </p>
          </div>

          {/* Location */}
          <div className="mb-3">
            <p className="text-sm text-[color:var(--fluent-text)]">
              📍 {activity.locationName || activity.location}
            </p>
          </div>

          {/* Skill Level */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-full">
              {skillLevelLabels[activity.skillLevel] || activity.skillLevel}
            </span>
          </div>

          {/* Participants */}
          <div className="mt-auto pt-3 border-t border-[color:var(--fluent-border)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[color:var(--fluent-text-secondary)]">
                Účastníci: {activity.currentParticipants}/
                {activity.maxParticipants}
              </span>
              <span className="text-sm font-medium text-[color:var(--fluent-accent)]">
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
        <div className="h-6 bg-[color:var(--fluent-border)] rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-[color:var(--fluent-border)] rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-[color:var(--fluent-border)] rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-[color:var(--fluent-border)] rounded w-1/2"></div>
      </div>
    </Card>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities`
      );
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-2">
            Športové aktivity
          </h1>
          <p className="text-[color:var(--fluent-text-secondary)]">
            Nájdi si aktivitu a pripoj sa k ostatným
          </p>
        </div>
        <Link href="/activities/create">
          <Button variant="primary">+ Vytvoriť aktivitu</Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && activities.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-2xl mb-4">🏀</p>
            <h3 className="text-xl font-semibold text-[color:var(--fluent-text)] mb-2">
              Žiadne aktivity
            </h3>
            <p className="text-[color:var(--fluent-text-secondary)] mb-6">
              Zatiaľ nie sú vytvorené žiadne aktivity. Buď prvý!
            </p>
            <Link href="/activities/create">
              <Button variant="primary">Vytvoriť aktivitu</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Activities grid */}
      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
