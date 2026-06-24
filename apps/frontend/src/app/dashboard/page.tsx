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
  sportType: string;
  date: string;
  location?: string;
  locationName?: string | null;
  currentParticipants: number;
  maxParticipants: number;
  organizer: {
    id: string;
    name: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  activity?: {
    id: string;
    title: string;
  };
}

interface BlockedUser {
  id: string;
  createdAt: string;
  blocked: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  VOLLEYBALL: "🏐",
  BADMINTON: "🏸",
  TABLE_TENNIS: "🏓",
  RUNNING: "🏃",
  CYCLING: "🚴",
  SWIMMING: "🏊",
  GYM: "💪",
  OTHER: "🎯",
};

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [activitiesRes, notifRes, blockedRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/my`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?limit=5`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/blocked`, {
          credentials: "include",
        }).catch(() => null),
      ]);

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        const now = new Date();
        const today = new Date(now);
        today.setHours(23, 59, 59, 999);

        // Deduplicate activities by ID (user might be both organizer and participant)
        const uniqueActivities = Array.from(
          new Map(
            [...data.created, ...data.joined].map((a: Activity) => [a.id, a])
          ).values()
        );

        const allActivities = uniqueActivities
          .filter((a: Activity) => new Date(a.date) >= now)
          .sort(
            (a: Activity, b: Activity) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setUpcomingActivities(allActivities.slice(0, 6));
        setTodayActivities(
          allActivities.filter((a: Activity) => new Date(a.date) <= today)
        );
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }

      if (blockedRes?.ok) {
        const data = await blockedRes.json();
        setBlockedUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/blocked/${blockId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((b) => b.id !== blockId));
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("sk-SK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 24) {
      return `o ${hours}h ${minutes}m`;
    }
    const days = Math.floor(hours / 24);
    return `o ${days} ${days === 1 ? "deň" : days < 5 ? "dni" : "dní"}`;
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "práve teraz";
    if (minutes < 60) return `pred ${minutes}m`;
    if (hours < 24) return `pred ${hours}h`;
    return `pred ${days}d`;
  };

  if (isPending || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Načítavam...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen relative overflow-hidden pt-36 pb-12">
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Ahoj{session.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
          <p className="text-gray-300">
            {todayActivities.length > 0
              ? `Máte ${todayActivities.length} ${
                  todayActivities.length === 1
                    ? "aktivitu"
                    : todayActivities.length < 5
                    ? "aktivity"
                    : "aktivít"
                } dnes`
              : "Vitajte späť vo vašom športovom dashboarde"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Activities */}
            {todayActivities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    Dnes ({todayActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayActivities.map((activity) => (
                    <Link key={activity.id} href={`/activities/${activity.id}`}>
                      <div className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {SPORT_LABELS[activity.sportType] || "🎯"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {formatTime(activity.date)} •{" "}
                              {activity.locationName || activity.location}
                            </p>
                          </div>
                          <div className="text-emerald-400 font-semibold text-sm whitespace-nowrap">
                            {getTimeUntil(activity.date)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Activities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xl sm:text-2xl">📅</span>
                    <span className="truncate text-base sm:text-xl">Nadchádzajúce aktivity</span>
                  </CardTitle>
                  <Link href="/my-activities" className="shrink-0">
                    <Button variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">
                      Všetky
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      Žiadne nadchádzajúce aktivity
                    </p>
                    <Link href="/activities">
                      <Button variant="primary">Nájsť aktivity</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingActivities.map((activity) => {
                      const activityDate = new Date(activity.date);
                      const isToday =
                        activityDate.toDateString() ===
                        new Date().toDateString();

                      return (
                        <Link
                          key={activity.id}
                          href={`/activities/${activity.id}`}
                        >
                          <div className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-center min-w-[50px]">
                                <div className="text-2xl font-bold text-emerald-400">
                                  {activityDate.getDate()}
                                </div>
                                <div className="text-xs text-gray-400 uppercase">
                                  {activityDate.toLocaleDateString("sk-SK", {
                                    month: "short",
                                  })}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">
                                    {SPORT_LABELS[activity.sportType] || "🎯"}
                                  </span>
                                  <h3 className="font-semibold text-white truncate">
                                    {activity.title}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                  {formatTime(activity.date)} •{" "}
                                  {activity.locationName || activity.location}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">
                                  {activity.currentParticipants}/
                                  {activity.maxParticipants}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blocked Users Management */}
            {blockedUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚫</span>
                    Zablokovaní používatelia ({blockedUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blockedUsers.map((blocked) => (
                      <div
                        key={blocked.id}
                        className="p-4 bg-white/[0.03] border border-white/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">
                              {blocked.blocked.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white">
                              {blocked.blocked.name}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">
                              {blocked.blocked.email}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            className="text-sm"
                            onClick={() => handleUnblock(blocked.id)}
                          >
                            Odblokovať
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Rýchle akcie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/activities/create" className="block">
                  <Button variant="primary" className="w-full justify-start">
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
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
                    <span className="truncate">Vytvoriť aktivitu</span>
                  </Button>
                </Link>
                <Link href="/activities" className="block">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                  >
                    <svg
                      className="w-5 h-5 mr-2 flex-shrink-0"
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
                    <span className="truncate">Hľadať aktivity</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    Notifikácie
                  </CardTitle>
                  <Link href="/profile/notifications">
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                      Nastavenia
                    </button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Žiadne nové notifikácie
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={
                          notif.activity
                            ? `/activities/${notif.activity.id}`
                            : "/notifications"
                        }
                      >
                        <div
                          className={`p-3 rounded-lg transition-all cursor-pointer ${
                            notif.read
                              ? "bg-white/[0.03] hover:bg-white/[0.06]"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.read && (
                              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white mb-1">
                                {notif.title}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {getRelativeTime(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
