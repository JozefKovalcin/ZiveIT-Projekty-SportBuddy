"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

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
  venue: {
    id: string;
    name: string;
    city: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  organizer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  participations: {
    id: string;
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

const statusLabels: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Otvorená", color: "bg-green-500" },
  FULL: { label: "Plná", color: "bg-orange-500" },
  CANCELLED: { label: "Zrušená", color: "bg-red-500" },
  COMPLETED: { label: "Ukončená", color: "bg-gray-500" },
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
    fetchCurrentUser();
  }, [params.id]);

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

  const handleJoin = async () => {
    if (!activity) return;
    setJoining(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activity.id}/join`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri prihlásení");
      }

      // Refresh activity data
      await fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!activity) return;
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

      // Refresh activity data
      await fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[color:var(--fluent-text-secondary)]">
            Načítavam...
          </p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-2xl mb-4">❌</p>
              <h3 className="text-xl font-semibold text-[color:var(--fluent-text)] mb-2">
                {error || "Aktivita nenájdená"}
              </h3>
              <Link href="/activities">
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
    !isOrganizer &&
    activity.status === "OPEN" &&
    activity.currentParticipants < activity.maxParticipants;

  const fillPercentage =
    (activity.currentParticipants / activity.maxParticipants) * 100;
  const statusInfo = statusLabels[activity.status] || statusLabels.OPEN;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link href="/activities">
          <Button variant="secondary" className="mb-6">
            ← Späť na zoznam
          </Button>
        </Link>

        {/* Header */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-2">
                  {activity.title}
                </h1>
                <p className="text-xl text-[color:var(--fluent-text-secondary)]">
                  {sportTypeLabels[activity.sportType] || activity.sportType}
                </p>
              </div>
              <span
                className={`px-4 py-2 text-sm font-medium text-white rounded-full ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              {canJoin && (
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining ? "Prihlasovanie..." : "✓ Prihlásiť sa"}
                </Button>
              )}
              {isParticipating && !isOrganizer && (
                <Button
                  variant="secondary"
                  onClick={handleLeave}
                  disabled={leaving}
                >
                  {leaving ? "Odhlasovanie..." : "✗ Odhlásiť sa"}
                </Button>
              )}
              {isOrganizer && (
                <span className="px-4 py-2 text-sm font-medium bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-lg">
                  👤 Organizátor
                </span>
              )}
            </div>
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
                    <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                      Dátum a čas
                    </p>
                    <p className="text-lg text-[color:var(--fluent-text)]">
                      📅 {formattedDate} o {formattedTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                      Dĺžka trvania
                    </p>
                    <p className="text-lg text-[color:var(--fluent-text)]">
                      🕐 {activity.duration} minút
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                      Športovisko
                    </p>
                    <p className="text-lg text-[color:var(--fluent-text)]">
                      📍 {activity.venue.name}
                    </p>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                      {activity.venue.address}, {activity.venue.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                      Úroveň hráčov
                    </p>
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-full">
                      {skillLevelLabels[activity.skillLevel] ||
                        activity.skillLevel}
                    </span>
                  </div>

                  {activity.description && (
                    <div>
                      <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                        Popis
                      </p>
                      <p className="text-[color:var(--fluent-text)]">
                        {activity.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            {activity.venue.latitude && activity.venue.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Mapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${activity.venue.latitude},${activity.venue.longitude}&zoom=15`}
                      allowFullScreen
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
                    <span className="text-[color:var(--fluent-text-secondary)]">
                      Účastníci
                    </span>
                    <span className="font-semibold text-[color:var(--fluent-text)]">
                      {activity.currentParticipants}/{activity.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-[color:var(--fluent-surface-secondary)] rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--fluent-accent)] transition-all duration-300"
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[color:var(--fluent-text-secondary)]">
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--fluent-accent)]/20 flex items-center justify-center text-[color:var(--fluent-accent)] font-bold">
                    {activity.organizer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--fluent-text)]">
                      {activity.organizer.name}
                    </p>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                      {activity.organizer.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants list */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Účastníci ({activity.participations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity.participations.map((participation) => (
                    <div
                      key={participation.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[color:var(--fluent-accent)]/20 flex items-center justify-center text-[color:var(--fluent-accent)] font-bold text-sm">
                        {participation.user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm text-[color:var(--fluent-text)]">
                        {participation.user.name}
                        {participation.user.id === activity.organizer.id && (
                          <span className="ml-2 text-xs text-[color:var(--fluent-accent)]">
                            (Organizátor)
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
