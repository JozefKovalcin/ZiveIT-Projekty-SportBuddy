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
  OPEN: { label: "Otvorená", color: "bg-green-600 shadow-sm" },
  FULL: { label: "Plná", color: "bg-orange-600 shadow-sm" },
  CANCELLED: { label: "Zrušená", color: "bg-red-600 shadow-sm" },
  COMPLETED: { label: "Ukončená", color: "bg-gray-600 shadow-sm" },
};

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

  useEffect(() => {
    // Check if we came from my-activities page via referrer or sessionStorage
    if (typeof window !== "undefined") {
      const savedSource = sessionStorage.getItem("activityListSource");
      if (savedSource === "/my-activities") {
        setReturnUrl("/my-activities");
      } else if (document.referrer && document.referrer.includes("/my-activities")) {
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
      const participation = activity.participations.find(p => p.user.id === currentUserId);
      if (participation) {
        setGuestCount(participation.guestCount || 0);
      }
    }

    // Fetch upcoming instances if recurring (including child activities)
    if (activity) {
      const isRecurringOrChild = (activity.isRecurring && activity.recurrenceFrequency !== "NONE") || activity.parentActivityId;
      if (isRecurringOrChild) {
        fetchUpcomingInstances();
      }
    }
  }, [activity, currentUserId]);

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
    
    const confirmLeave = window.confirm(
      "Naozaj sa chcete odhlásiť z tejto aktivity?"
    );
    if (!confirmLeave) return;
    
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

  const handleAddGuests = async () => {
    if (!activity) return;
    
    const currentParticipation = activity.participations.find(p => p.user.id === currentUserId);
    const currentGuestCount = currentParticipation?.guestCount || 0;
    const totalNeeded = 1 + guestCount; // user + guests
    const currentTotal = 1 + currentGuestCount; // current user + current guests
    const availableSpots = activity.maxParticipants - activity.currentParticipants + currentTotal;
    
    if (totalNeeded > availableSpots) {
      alert(`K dispozícii je len ${availableSpots} voľných miest.`);
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

      // Refresh activity data
      await fetchActivity();
      alert(`Počet hostí aktualizovaný na ${guestCount}!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingGuests(false);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    
    const confirmDelete = window.confirm(
      "Naozaj chcete zmazať túto aktivitu? Táto akcia je nevratná."
    );
    if (!confirmDelete) return;
    
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

      alert("Aktivita bola úspešne zmazaná");
      router.push(returnUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link href={returnUrl}>
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
                <div className="flex items-center gap-3">
                  <p className="text-xl text-[color:var(--fluent-text-secondary)]">
                    {sportTypeLabels[activity.sportType] || activity.sportType}
                  </p>
                  {activity.isRecurring && activity.recurrenceFrequency !== "NONE" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-purple-500 text-white rounded-full shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                      </svg>
                      Pravidelná aktivita
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-4 py-2 text-sm font-medium text-white rounded-full ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {canJoin && (
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining ? "Prihlasovanie..." : "✓ Prihlásiť sa"}
                </Button>
              )}
              {isParticipating && (
                <Button
                  variant="secondary"
                  onClick={handleLeave}
                  disabled={leaving}
                  className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400"
                >
                  {leaving ? "Odhlasovanie..." : "✗ Odhlásiť sa"}
                </Button>
              )}
              {isOrganizer && (
                <>
                  <span className="px-4 py-2 text-sm font-medium bg-[color:var(--fluent-accent)]/10 text-[color:var(--fluent-accent)] rounded-lg">
                    👤 Organizátor
                  </span>
                  <Button
                    variant="secondary"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 border-red-300 dark:border-red-700"
                  >
                    {deleting ? "Mažem..." : "🗑️ Zmazať aktivitu"}
                  </Button>
                </>
              )}
            </div>

            {/* Add guests section for participants */}
            {isParticipating && activity.status === "OPEN" && (
              <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 max-w-xs">
                    <label htmlFor="guestCount" className="block text-xs font-medium text-[color:var(--fluent-text)] mb-2">
                      Počet hostí (okrem vás)
                    </label>
                    <input
                      id="guestCount"
                      type="number"
                      min="0"
                      max={activity.maxParticipants - activity.currentParticipants + (activity.participations.find(p => p.user.id === currentUserId)?.guestCount || 0)}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2 border border-[color:var(--fluent-border)] rounded-lg bg-[color:var(--fluent-card-background)] text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-xs text-[color:var(--fluent-text-secondary)] mt-2">
                  Celkom miest: Vy + {guestCount} {guestCount === 1 ? "hosť" : guestCount < 5 ? "hostia" : "hostí"} = {1 + guestCount}
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
                      Miesto konania
                    </p>
                    {activity.locationName && (
                      <p className="text-lg font-medium text-[color:var(--fluent-text)]">
                        📍 {activity.locationName}
                      </p>
                    )}
                    <p className={`${activity.locationName ? 'text-sm' : 'text-lg'} text-[color:var(--fluent-text-secondary)]`}>
                      {activity.location}
                    </p>
                    {(activity.locationName || activity.location || (activity.latitude && activity.longitude)) && (
                      <a
                        href={
                          activity.locationName
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.locationName + ', ' + activity.location)}`
                            : activity.location
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`
                            : `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Otvoriť v Mapách
                      </a>
                    )}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                        Pohlavie
                      </p>
                      <p className="text-lg text-[color:var(--fluent-text)]">
                        {genderLabels[activity.gender] || activity.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                        Vekové rozpätie
                      </p>
                      <p className="text-lg text-[color:var(--fluent-text)]">
                        {activity.minAge} - {activity.maxAge} rokov
                      </p>
                    </div>
                  </div>

                  {activity.price > 0 && (
                    <div>
                      <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-1">
                        Cena
                      </p>
                      <p className="text-lg font-semibold text-[color:var(--fluent-accent)]">
                        {activity.price.toFixed(2)} €
                      </p>
                    </div>
                  )}

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

            {/* Upcoming instances for recurring activities */}
            {((activity.isRecurring && activity.recurrenceFrequency !== "NONE") || activity.parentActivityId) && (
              <Card>
                <CardHeader 
                  className="cursor-pointer hover:bg-[color:var(--fluent-surface-secondary)] transition-colors"
                  onClick={() => setShowUpcoming(!showUpcoming)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Nadchádzajúce termíny
                      {upcomingInstances.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[color:var(--fluent-accent)]/20 text-[color:var(--fluent-accent)] rounded-full">
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
                      className={`transition-transform ${showUpcoming ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </CardTitle>
                </CardHeader>
                {showUpcoming && (
                  <CardContent>
                    {loadingUpcoming ? (
                      <p className="text-sm text-[color:var(--fluent-text-secondary)]">Načítavam...</p>
                    ) : upcomingInstances.length === 0 ? (
                      <p className="text-sm text-[color:var(--fluent-text-secondary)]">Žiadne nadchádzajúce termíny</p>
                    ) : (
                    <div className="space-y-3">
                      {upcomingInstances.map((instance) => {
                        const instanceDate = new Date(instance.date);
                        const formattedDate = instanceDate.toLocaleDateString("sk-SK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        const formattedTime = instanceDate.toLocaleTimeString("sk-SK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const isCurrentActivity = instance.id === activity.id;
                        const isParticipatingInInstance = instance.participations.some(
                          (p) => p.user.id === currentUserId
                        );

                        return (
                          <div
                            key={instance.id}
                            className={`p-4 rounded-lg border transition-all ${
                              isCurrentActivity
                                ? 'bg-[color:var(--fluent-accent)]/10 border-[color:var(--fluent-accent)]'
                                : 'bg-[color:var(--fluent-surface-secondary)] border-[color:var(--fluent-border)] hover:border-[color:var(--fluent-border-strong)]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[color:var(--fluent-accent)]">
                                    {instanceDate.getDate()}
                                  </div>
                                  <div className="text-xs text-[color:var(--fluent-text-secondary)] uppercase">
                                    {instanceDate.toLocaleDateString("sk-SK", { month: "short" })}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-[color:var(--fluent-text)]">
                                    {formattedDate} o {formattedTime}
                                  </p>
                                  <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                                    {instance.currentParticipants}/{instance.maxParticipants} účastníkov
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
                                <Link href={`/activities/${instance.id}`} className="flex-1">
                                  <Button variant="secondary" className="w-full text-sm py-2">
                                    Zobraziť detail
                                  </Button>
                                </Link>
                              )}
                              {!isParticipatingInInstance && instance.currentParticipants < instance.maxParticipants && (
                                <Button
                                  variant="primary"
                                  className="flex-1 text-sm py-2"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${instance.id}/join`,
                                        {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          credentials: "include",
                                          body: JSON.stringify({ guestCount: 0 }),
                                        }
                                      );
                                      if (response.ok) {
                                        fetchUpcomingInstances();
                                        alert("Prihlásený!");
                                      } else {
                                        const data = await response.json();
                                        alert(data.error || "Chyba pri prihlásení");
                                      }
                                    } catch (err) {
                                      alert("Chyba pri prihlásení");
                                    }
                                  }}
                                >
                                  Prihlásiť sa
                                </Button>
                              )}
                              {isParticipatingInInstance && (
                                <span className="flex-1 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  Prihlásený
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-[color:var(--fluent-surface-secondary)]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={
                        activity.locationName
                          ? `https://maps.google.com/maps?q=${encodeURIComponent(activity.locationName + ', ' + activity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
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
                <CardTitle>Prihlásení účastníci</CardTitle>
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
                        {participation.guestCount > 0 && (
                          <span className="ml-2 text-xs text-[color:var(--fluent-text-secondary)]">
                            +{participation.guestCount}
                          </span>
                        )}
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

