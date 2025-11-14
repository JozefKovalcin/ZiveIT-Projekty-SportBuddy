"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  };
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  participations: Array<{
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
}

interface UserActivities {
  created: Activity[];
  joined: Activity[];
  stats: {
    totalCreated: number;
    totalJoined: number;
    upcomingCreated: number;
    upcomingJoined: number;
  };
}

const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "Futbal",
  BASKETBALL: "Basketbal",
  TENNIS: "Tenis",
  VOLLEYBALL: "Volejbal",
  BADMINTON: "Bedminton",
  TABLE_TENNIS: "Stolný tenis",
  RUNNING: "Beh",
  CYCLING: "Cyklistika",
  SWIMMING: "Plávanie",
  GYM: "Fitnes",
  OTHER: "Iné",
};

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<UserActivities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchActivities();
    }
  }, [session]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/my`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isPending || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--fluent-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--fluent-text-secondary)]">
            Načítavam...
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--fluent-bg)" }}
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden gradient-cta py-12 px-8 rounded-2xl text-white mb-12"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              Ahoj{session.user?.name ? `, ${session.user.name}` : ""} 👋
            </h1>
            <p className="text-xl opacity-90 drop-shadow">
              Vitajte vo vašom športovom dashboarde
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-1 rounded-xl mb-4 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <CardTitle>Moje aktivity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[color:var(--fluent-text)]">
                {activities?.stats.totalCreated || 0}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Vytvorené aktivity ({activities?.stats.upcomingCreated || 0}{" "}
                nadchádzajúcich)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-2 rounded-xl mb-4 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle>Prihlásený na</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[color:var(--fluent-text)]">
                {activities?.stats.totalJoined || 0}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Aktivít ({activities?.stats.upcomingJoined || 0}{" "}
                nadchádzajúcich)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-3 rounded-xl mb-4 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <CardTitle>Celkom aktivít</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[color:var(--fluent-text)]">
                {(activities?.stats.totalCreated || 0) +
                  (activities?.stats.totalJoined || 0)}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Účastí na športových aktivitách
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[color:var(--fluent-text)] mb-6">
            Rýchle akcie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/activities/create">
              <Card hover className="h-full cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
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
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[color:var(--fluent-text)] mb-1">
                      Vytvoriť aktivitu
                    </h3>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                      Zorganizujte novú športovú aktivitu
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/activities">
              <Card hover className="h-full cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className="w-16 h-16 gradient-feature-2 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[color:var(--fluent-text)] mb-1">
                      Hľadať aktivity
                    </h3>
                    <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                      Nájdite si spoluhráčov vo vašom meste
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Activities Lists */}
        {activities &&
        (activities.created.length > 0 || activities.joined.length > 0) ? (
          <div className="space-y-8">
            {/* Created Activities */}
            {activities.created.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[color:var(--fluent-text)] mb-6">
                  Moje vytvorené aktivity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.created.map((activity) => (
                    <Link key={activity.id} href={`/activities/${activity.id}`}>
                      <Card hover className="h-full cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white shadow-sm">
                              {SPORT_LABELS[activity.sportType] ||
                                activity.sportType}
                            </span>
                            <span className="text-xs text-[color:var(--fluent-text-secondary)]">
                              Organizátor
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[color:var(--fluent-text)] mb-2">
                            {activity.title}
                          </h3>
                          <div className="space-y-2 text-sm text-[color:var(--fluent-text-secondary)]">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{formatDate(activity.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span>
                                {activity.locationName || activity.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span>
                                {activity.currentParticipants}/
                                {activity.maxParticipants} účastníkov
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Joined Activities */}
            {activities.joined.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[color:var(--fluent-text)] mb-6">
                  Aktivity, na ktoré som prihlásený
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.joined.map((activity) => (
                    <Link key={activity.id} href={`/activities/${activity.id}`}>
                      <Card hover className="h-full cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white shadow-sm">
                              {SPORT_LABELS[activity.sportType] ||
                                activity.sportType}
                            </span>
                            <span className="text-xs text-[color:var(--fluent-text-secondary)]">
                              Účastník
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[color:var(--fluent-text)] mb-2">
                            {activity.title}
                          </h3>
                          <div className="space-y-2 text-sm text-[color:var(--fluent-text-secondary)]">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{formatDate(activity.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span>
                                {activity.locationName || activity.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>Organizuje: {activity.organizer.name}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="text-center py-16">
              <div
                className="w-20 h-20 bg-[color:var(--fluent-surface-secondary)] rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-10 h-10 text-[color:var(--fluent-text-tertiary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[color:var(--fluent-text)] mb-2">
                Zatiaľ žiadne aktivity
              </h3>
              <p className="text-[color:var(--fluent-text-secondary)] mb-6 max-w-md mx-auto">
                Začnite vytvorením novej aktivity alebo sa pripojte k
                existujúcim aktivitám vo vašom okolí.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/activities/create">
                  <Button size="lg">Vytvoriť aktivitu</Button>
                </Link>
                <Link href="/activities">
                  <Button variant="secondary" size="lg">
                    Prehliadať aktivity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
