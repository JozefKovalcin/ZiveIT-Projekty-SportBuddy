"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  activityId?: string;
  activity?: {
    id: string;
    title: string;
    sportType: string;
    date: string;
    location: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NotificationsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/signin");
  }, [session, isPending, router]);

  const fetchNotifications = async (reset = false) => {
    setLoading(true);
    const newOffset = reset ? 0 : offset;
    const res = await fetch(
      `${API_URL}/api/notifications?limit=20&offset=${newOffset}`,
      { credentials: "include" }
    );
    if (res.ok) {
      const data = await res.json();
      setNotifications(
        reset ? data.notifications : [...notifications, ...data.notifications]
      );
      setHasMore(data.hasMore);
      setOffset(newOffset + data.notifications.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchNotifications(true);
  }, [session]);

  const markAsRead = async (id: string) => {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PUT",
      credentials: "include",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`${API_URL}/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAll = async () => {
    if (!confirm("Naozaj chcete vymazať všetky notifikácie?")) return;
    await fetch(`${API_URL}/api/notifications`, {
      method: "DELETE",
      credentials: "include",
    });
    setNotifications([]);
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.activityId) router.push(`/activities/${n.activityId}`);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_ACTIVITY: "🎉",
      ACTIVITY_REMINDER: "⏰",
      ACTIVITY_CANCELLED: "❌",
      PARTICIPANT_JOINED: "👋",
      PARTICIPANT_LEFT: "👤",
      ACTIVITY_FULL: "✅",
      SYSTEM: "📢",
    };
    return icons[type] || "🔔";
  };

  if (isPending)
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--fluent-accent)]">
        Načítavam...
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-2">
            Notifikácie
          </h1>
          <p className="text-[color:var(--fluent-text-secondary)]">
            {unreadCount > 0
              ? `${unreadCount} neprečítaných`
              : "Všetky prečítané"}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/profile/notifications">
            <Button variant="secondary">⚙️ Nastavenia</Button>
          </Link>
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead}>
              Označiť všetko
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="secondary" onClick={deleteAll}>
              Vymazať všetky
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && !loading ? (
          <div
            className="acrylic p-16 text-center rounded-2xl border border-[color:var(--fluent-border)]"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <span className="text-6xl block mb-4">🔔</span>
            <p className="text-[color:var(--fluent-text-secondary)] text-xl">
              Žiadne notifikácie
            </p>
            <p className="text-[color:var(--fluent-text-secondary)] opacity-70 mt-2">
              Keď sa niečo zaujímavé udeje, uvidíte to tu.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`acrylic p-5 rounded-xl border transition-all cursor-pointer hover:border-[color:var(--fluent-accent)]/30 hover-glow reveal-effect
                ${
                  !n.read
                    ? "border-[color:var(--fluent-accent)]/20 bg-[color:var(--fluent-accent-light)]/5"
                    : "border-[color:var(--fluent-border)]"
                }`}
              onClick={() => handleClick(n)}
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex gap-4">
                <span className="text-3xl">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`text-lg ${
                        !n.read
                          ? "text-[color:var(--fluent-text)] font-bold"
                          : "text-[color:var(--fluent-text-secondary)]"
                      }`}
                    >
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <div className="w-2 h-2 bg-[color:var(--fluent-accent)] rounded-full" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="text-[color:var(--fluent-text-secondary)] opacity-50 hover:opacity-100 hover:text-red-500 p-1 transition-all"
                        title="Vymazať"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-2">
                    {n.message}
                  </p>
                  {n.activity && (
                    <div className="bg-[color:var(--fluent-surface-secondary)]/50 rounded-lg p-3 mt-2 border border-[color:var(--fluent-border)]">
                      <p className="text-[color:var(--fluent-text)] font-medium">
                        {n.activity.title}
                      </p>
                      <p className="text-[color:var(--fluent-text-secondary)] text-sm">
                        📅 {formatDate(n.activity.date)} • 📍{" "}
                        {n.activity.location}
                      </p>
                    </div>
                  )}
                  <p className="text-[color:var(--fluent-text-secondary)] opacity-70 text-xs mt-2">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <button
            onClick={() => fetchNotifications()}
            disabled={loading}
            className="w-full py-4 text-[color:var(--fluent-accent)] hover:text-[color:var(--fluent-accent-hover)] font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? "Načítavam..." : "Načítať ďalšie"}
          </button>
        )}
      </div>
    </main>
  );
}
