"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SkillRadarChart } from "@/components/SkillRadarChart";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  profile: {
    bio: string | null;
    city: string | null;
    phone: string | null;
    skillLevel: string;
    favoriteSports: string[];
    footballSkill?: number;
    basketballSkill?: number;
    tennisSkill?: number;
    volleyballSkill?: number;
    badmintonSkill?: number;
    tableTennisSkill?: number;
    runningSkill?: number;
    cyclingSkill?: number;
    swimmingSkill?: number;
    gymSkill?: number;
  } | null;
  stats: {
    totalActivities: number;
    createdActivities: number;
    joinedActivities: number;
    completedActivities: number;
    upcomingActivities: number;
    mostPlayedSports: string[];
  };
}

interface Activity {
  id: string;
  title: string;
  sportType: string;
  date: string;
  status: string;
  currentParticipants: number;
  maxParticipants: number;
  isOrganizer: boolean;
  isParticipant: boolean;
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
  PROFESSIONAL: "Profesionál",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Otvorená", color: "bg-green-600" },
  FULL: { label: "Plná", color: "bg-orange-600" },
  CANCELLED: { label: "Zrušená", color: "bg-red-600" },
  COMPLETED: { label: "Ukončená", color: "bg-gray-600" },
};

interface OwnProfileStats {
  upcomingActivities: number;
  totalActivities: number;
  totalHours: number;
  uniquePartners: number;
}

interface RecentActivity {
  id: string;
  title: string;
  sportType: string;
  date: string;
  type: 'created' | 'joined';
}

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ownStats, setOwnStats] = useState<OwnProfileStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    fetchUserProfile();
    fetchUserActivities();
    if (isOwnProfile) {
      fetchOwnStats();
      fetchRecentActivities();
    }
  }, [params.id, isOwnProfile]);

  // Refetch profile when component becomes visible (e.g., after returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOwnProfile) {
        fetchUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOwnProfile]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`
      );
      if (!response.ok) {
        throw new Error("Používateľ nenájdený");
      }
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}/activities?limit=50`
      );
      if (!response.ok) {
        throw new Error("Chyba pri načítaní aktivít");
      }
      const data = await response.json();
      setActivities(data);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchOwnStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/stats`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setOwnStats(data);
      }
    } catch (err) {
      console.error("Error fetching own stats:", err);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/recent-activities`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      }
    } catch (err) {
      console.error("Error fetching recent activities:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[color:var(--fluent-text-secondary)]">
            Načítavam...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-2xl mb-4">❌</p>
              <h3 className="text-xl font-semibold text-[color:var(--fluent-text)] mb-2">
                {error || "Používateľ nenájdený"}
              </h3>
              <Link href="/activities">
                <Button variant="primary" className="mt-4">
                  Späť na aktivity
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("sk-SK", {
    month: "long",
    year: "numeric",
  });

  const upcomingActivities = activities.filter((a) => a.status === "OPEN");
  const completedActivities = activities.filter((a) => a.status === "COMPLETED");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back button and Edit button for own profile */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/activities">
            <Button variant="secondary">
              ← Späť
            </Button>
          </Link>
          {isOwnProfile && (
            <Link href="/profile/edit">
              <Button>Upraviť profil</Button>
            </Link>
          )}
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[color:var(--fluent-border)]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[color:var(--fluent-accent)]/20 flex items-center justify-center border-4 border-[color:var(--fluent-border)]">
                    <span className="text-5xl font-bold text-[color:var(--fluent-accent)]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[color:var(--fluent-text)] mb-2">
                  {user.name}
                </h1>
                
                {user.profile?.city && (
                  <p className="text-[color:var(--fluent-text-secondary)] mb-2">
                    📍 {user.profile.city}
                  </p>
                )}

                {isOwnProfile && user.profile?.phone && (
                  <p className="text-[color:var(--fluent-text-secondary)] mb-2">
                    📞 {user.profile.phone}
                  </p>
                )}

                <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-4">
                  Člen od {memberSince}
                </p>

                {user.profile?.bio && (
                  <p className="text-[color:var(--fluent-text)] mb-4">
                    {user.profile.bio}
                  </p>
                )}

                {/* Favorite Sports */}
                {user.profile?.favoriteSports && user.profile.favoriteSports.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[color:var(--fluent-text-secondary)] mb-2">
                      Obľúbené športy:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.favoriteSports.map((sport) => (
                        <span
                          key={sport}
                          className="px-3 py-1 text-sm bg-[color:var(--fluent-surface-secondary)] text-[color:var(--fluent-text)] rounded-full"
                        >
                          {sportTypeLabels[sport] || sport}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sport Skills Radar Chart */}
        {isOwnProfile && user.profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Zručnosti v športoch</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillRadarChart 
                skills={{
                  footballSkill: user.profile.footballSkill || 1,
                  basketballSkill: user.profile.basketballSkill || 1,
                  tennisSkill: user.profile.tennisSkill || 1,
                  volleyballSkill: user.profile.volleyballSkill || 1,
                  badmintonSkill: user.profile.badmintonSkill || 1,
                  tableTennisSkill: user.profile.tableTennisSkill || 1,
                  runningSkill: user.profile.runningSkill || 1,
                  cyclingSkill: user.profile.cyclingSkill || 1,
                  swimmingSkill: user.profile.swimmingSkill || 1,
                  gymSkill: user.profile.gymSkill || 1,
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-3xl font-bold text-[color:var(--fluent-accent)]">
                {user.stats.totalActivities}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Celkom aktivít
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-4">
              <p className="text-3xl font-bold text-[color:var(--fluent-accent)]">
                {user.stats.createdActivities}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Vytvorených
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-4">
              <p className="text-3xl font-bold text-[color:var(--fluent-accent)]">
                {user.stats.joinedActivities}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Prihlásených
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-4">
              <p className="text-3xl font-bold text-green-600">
                {user.stats.completedActivities}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Dokončených
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-4">
              <p className="text-3xl font-bold text-blue-600">
                {user.stats.upcomingActivities}
              </p>
              <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-1">
                Nadchádzajúcich
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Most Played Sports */}
        {user.stats.mostPlayedSports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Najhranejšie športy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {user.stats.mostPlayedSports.map((sport) => (
                  <span
                    key={sport}
                    className="px-4 py-2 text-lg bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-lg font-medium"
                  >
                    {sportTypeLabels[sport] || sport}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivity</CardTitle>
            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-[color:var(--fluent-accent)] text-white"
                    : "bg-[color:var(--fluent-surface-secondary)] text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
                }`}
              >
                Nadchádzajúce ({upcomingActivities.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-[color:var(--fluent-accent)] text-white"
                    : "bg-[color:var(--fluent-surface-secondary)] text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]"
                }`}
              >
                Dokončené ({completedActivities.length})
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <p className="text-center text-[color:var(--fluent-text-secondary)] py-8">
                Načítavam aktivity...
              </p>
            ) : (
              <div className="space-y-3">
                {(activeTab === "upcoming" ? upcomingActivities : completedActivities).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-4">📋</p>
                    <p className="text-[color:var(--fluent-text-secondary)]">
                      {activeTab === "upcoming" ? "Žiadne nadchádzajúce aktivity" : "Žiadne dokončené aktivity"}
                    </p>
                  </div>
                ) : (
                  (activeTab === "upcoming" ? upcomingActivities : completedActivities).map((activity) => {
                    const date = new Date(activity.date);
                    const statusInfo = statusLabels[activity.status] || statusLabels.OPEN;

                    return (
                      <Link
                        key={activity.id}
                        href={`/activities/${activity.id}`}
                        className="block"
                      >
                        <div className="p-4 rounded-lg bg-[color:var(--fluent-surface-secondary)] hover:bg-[color:var(--fluent-surface-tertiary)] transition-colors border border-[color:var(--fluent-border)]">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-[color:var(--fluent-text)]">
                              {activity.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-[color:var(--fluent-text-secondary)]">
                            <span>{sportTypeLabels[activity.sportType] || activity.sportType}</span>
                            <span>•</span>
                            <span>
                              {date.toLocaleDateString("sk-SK", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span>
                              {activity.currentParticipants}/{activity.maxParticipants} účastníkov
                            </span>
                            {activity.isOrganizer && (
                              <>
                                <span>•</span>
                                <span className="text-[color:var(--fluent-accent)] font-medium">
                                  Organizátor
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
