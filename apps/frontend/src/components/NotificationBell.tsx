"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  activityId?: string;
  activity?: { id: string; title: string; sportType: string; date: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface NotificationBellProps {
  scrolled?: boolean;
}

export default function NotificationBell({
  scrolled = false,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastLatestIdRef = useRef<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=10`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const newNotifs = data.notifications as Notification[];

        // Check for new notifications to show toast
        if (newNotifs.length > 0) {
          const latest = newNotifs[0];
          // If we have a previous latest ID, and the current latest is different, it's new
          if (
            lastLatestIdRef.current &&
            latest.id !== lastLatestIdRef.current
          ) {
            // Only show toast if it's unread and reasonably recent (e.g. created in last minute)
            // We assume the backend returns sorted by date desc
            const isRecent =
              Date.now() - new Date(latest.createdAt).getTime() < 60000;
            if (!latest.read && isRecent) {
              showToast(`${latest.title}: ${latest.message}`, "info");
            }
          }
          lastLatestIdRef.current = latest.id;
        }

        setNotifications(newNotifs);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Poll for new notifications every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mark single as read
  const markAsRead = async (id: string) => {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setLoading(true);
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PUT",
      credentials: "include",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  // Handle notification click
  const handleClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);
    setSelectedNotification(notification);
    setIsOpen(false);
  };

  // Time ago formatter
  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "práve teraz";
    if (mins < 60) return `pred ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `pred ${hrs}h`;
    return `pred ${Math.floor(hrs / 24)}d`;
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-[color:var(--fluent-surface-secondary)] transition-all duration-200 cursor-pointer"
        aria-label="Notifikácie"
      >
        <svg
          className="w-6 h-6 text-[color:var(--fluent-text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[color:var(--fluent-accent)] rounded-full text-xs font-bold text-white flex items-center justify-center"
            style={{
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 max-h-[70vh] rounded-3xl overflow-hidden z-50 border transition-all duration-300
             ${
               scrolled
                 ? "bg-[#021a14]/90 backdrop-blur-2xl border-emerald-500/30 shadow-2xl"
                 : "bg-black/40 backdrop-blur-xl border-white/10 shadow-xl"
             }`}
          style={{ animation: "slideDown 0.2s ease-out both" }}
        >
          <div
            className={`px-4 py-3 border-b flex justify-between items-center ${
              scrolled
                ? "border-emerald-500/20 bg-emerald-900/20"
                : "border-white/10 bg-white/5"
            }`}
          >
            <h3 className="font-bold text-white text-base">Notifikácie</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50 font-medium"
                >
                  Označiť všetko
                </button>
              )}
              <button
                onClick={() => {
                  router.push("/notifications");
                  setIsOpen(false);
                }}
                className="text-xs text-gray-400 hover:text-white font-medium"
              >
                Zobraziť všetky
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[50vh]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <span className="text-4xl block mb-2">🔔</span>
                Žiadne notifikácie
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`px-4 py-3 border-b cursor-pointer transition-all hover:bg-white/5
                    ${scrolled ? "border-emerald-500/10" : "border-white/10"}
                    ${
                      !n.read
                        ? scrolled
                          ? "bg-emerald-500/20"
                          : "bg-emerald-500/10"
                        : ""
                    }`}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl">{getIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          !n.read ? "text-white font-semibold" : "text-gray-400"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-500 opacity-70 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNotification(null)}
          />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">
              {selectedNotification.title}
            </h3>
            <p className="text-gray-300 mb-6 whitespace-pre-wrap">
              {selectedNotification.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-5 py-2.5 rounded-full font-semibold backdrop-blur-xl transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#9ca3af",
                }}
              >
                Zavrieť
              </button>
              {selectedNotification.activityId && (
                <button
                  onClick={() => {
                    router.push(
                      `/activities/${selectedNotification.activityId}`
                    );
                    setSelectedNotification(null);
                  }}
                  className="px-5 py-2.5 rounded-full font-semibold backdrop-blur-xl transition-colors"
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    color: "#34d399",
                  }}
                >
                  Otvoriť aktivitu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
