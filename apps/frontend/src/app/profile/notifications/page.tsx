"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NotificationPreferences {
  emailEnabled: boolean;
  emailFrequency: "INSTANT" | "DAILY_DIGEST" | "WEEKLY_DIGEST" | "NONE";
  pushEnabled: boolean;
  inAppEnabled: boolean;
  notifyNewActivities: boolean;
  notifyReminders: boolean;
  notifyParticipants: boolean; // Legacy
  notifyParticipantJoined: boolean;
  notifyParticipantLeft: boolean;
  notifyActivityFull: boolean;
  notifyActivityUpdated: boolean;
  notifyActivityCancelled: boolean;
  notifyMessages: boolean;
  notifyRatings: boolean;
  onlyFavoriteSports: boolean;
  maxDistance: number | null;
  maxPrice: number | null;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  maxNotificationsPerDay: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NotificationSettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>("default");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/auth/signin");
  }, [session, isPending, router]);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (session) fetchPreferences();
  }, [session]);

  const fetchPreferences = async () => {
    const res = await fetch(`${API_URL}/api/notifications/preferences`, {
      credentials: "include",
    });
    if (res.ok) setPrefs(await res.json());
    setLoading(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    await fetch(`${API_URL}/api/notifications/preferences`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaving(false);
  };

  const requestPushPermission = async () => {
    if (isRequestingPermission) {
      console.log('[Push] Already requesting permission, skipping...');
      return;
    }
    
    try {
      setIsRequestingPermission(true);
      console.log('[Push] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[Push] Permission result:', permission);
      setPushPermission(permission);
      
      if (permission === "granted") {
        console.log('[Push] Waiting for service worker...');
        const reg = await navigator.serviceWorker.ready;
        console.log('[Push] Service worker ready');
        
        // Convert VAPID key from base64url to Uint8Array
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('[Push] VAPID public key not found');
          alert('Chyba: VAPID kľúč nie je nakonfigurovaný');
          return;
        }
        
        console.log('[Push] VAPID key:', vapidPublicKey.substring(0, 20) + '...');
        
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };
        
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        
        console.log('[Push] Subscribing to push...');
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        console.log('[Push] Subscription created:', sub.endpoint);
        
        console.log('[Push] Sending subscription to server...');
        const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('[Push] Failed to save subscription:', error);
          alert('Chyba pri ukladaní subscription: ' + error);
          return;
        }
        
        console.log('[Push] Subscription saved successfully');
        alert('Push notifikácie boli úspešne povolené!');
      }
    } catch (error) {
      console.error('[Push] Error:', error);
      alert('Chyba pri povolení push notifikácií: ' + error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const update = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (prefs) setPrefs({ ...prefs, [key]: value });
  };

  if (isPending || loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--fluent-accent)]">
        Načítavam...
      </div>
    );
  if (!prefs) return null;

  const Toggle = ({
    checked,
    onChange,
    label,
    desc,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    desc?: string;
  }) => (
    <div className="flex items-center justify-between py-5 border-b border-white/10 last:border-0">
      <div>
        <p className="text-white font-semibold text-[15px]">{label}</p>
        {desc && <p className="text-gray-400 text-sm mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-14 h-8 rounded-full transition-all duration-300 relative"
        style={{
          background: checked
            ? "linear-gradient(135deg, #10b981, #059669)"
            : "rgba(255, 255, 255, 0.1)",
          boxShadow: checked
            ? "0 4px 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: checked
            ? "1px solid rgba(255, 255, 255, 0.2)"
            : "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          className="w-6 h-6 rounded-full absolute top-0.5 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #ffffff, #e5e7eb)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transform: checked ? "translateX(28px)" : "translateX(4px)",
          }}
        />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Nastavenia notifikácií
        </h1>
        <p className="text-gray-400 text-[15px]">
          Prispôsob si, ako a kedy chceš dostávať notifikácie
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-5">
            📬 Kanály notifikácií
          </h2>
          <Toggle
            checked={prefs.inAppEnabled}
            onChange={(v) => update("inAppEnabled", v)}
            label="In-app notifikácie"
            desc="Notifikácie priamo v aplikácii"
          />
          <Toggle
            checked={prefs.emailEnabled}
            onChange={(v) => update("emailEnabled", v)}
            label="Email notifikácie"
            desc="Dostávaj notifikácie na email"
          />
          {prefs.emailEnabled && (
            <div className="py-4 border-b border-white/10 pl-4">
              <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-2">
                Frekvencia emailov
              </p>
              <select
                value={prefs.emailFrequency}
                onChange={(e) =>
                  update("emailFrequency", e.target.value as any)
                }
                className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
              >
                <option value="INSTANT">Okamžite</option>
                <option value="DAILY_DIGEST">Denný súhrn</option>
                <option value="WEEKLY_DIGEST">Týždenný súhrn</option>
              </select>
            </div>
          )}
          <Toggle
            checked={prefs.pushEnabled}
            onChange={(v) => update("pushEnabled", v)}
            label="Push notifikácie"
            desc="Notifikácie aj keď nie si v aplikácii"
          />
          {prefs.pushEnabled &&
            pushSupported &&
            pushPermission !== "granted" && (
              <div className="py-4 pl-4">
                <Button onClick={requestPushPermission} variant="secondary">
                  Povoliť push notifikácie
                </Button>
              </div>
            )}
        </Card>

        {/* Notification Types */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">
            🔔 Typy notifikácií
          </h2>
          
          <div className="mb-4 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Nové aktivity</h3>
            <Toggle
              checked={prefs.notifyNewActivities}
              onChange={(v) => update("notifyNewActivities", v)}
              label="Nové aktivity v okolí"
              desc="Keď sa vytvorí aktivita podľa tvojich preferencií"
            />
          </div>

          {/* Radius Slider for New Activities */}
          {prefs.notifyNewActivities && (
            <div className="py-4 border-b border-[color:var(--fluent-divider)] pl-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[color:var(--fluent-text-secondary)] text-sm">
                  Vzdialenosť od mojej polohy
                </p>
                <span className="text-[color:var(--fluent-accent)] font-bold">
                  {prefs.maxDistance
                    ? `${prefs.maxDistance} km`
                    : "Neobmedzene"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={prefs.maxDistance || 100}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  update("maxDistance", val === 100 ? null : val);
                }}
                className="w-full h-2 bg-[color:var(--fluent-surface-secondary)] rounded-lg appearance-none cursor-pointer accent-[color:var(--fluent-accent)]"
              />
              <div className="flex justify-between text-xs text-[color:var(--fluent-text-secondary)] mt-1">
                <span>1 km</span>
                <span>50 km</span>
                <span>Neobmedzene</span>
              </div>
            </div>
          )}

          <div className="mb-4 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Moje aktivity</h3>
            <Toggle
              checked={prefs.notifyParticipantJoined}
              onChange={(v) => update("notifyParticipantJoined", v)}
              label="Niekto sa pridal"
              desc="Keď sa nový účastník pridá na tvoju aktivitu"
            />
            <Toggle
              checked={prefs.notifyParticipantLeft}
              onChange={(v) => update("notifyParticipantLeft", v)}
              label="Niekto odišiel"
              desc="Keď sa účastník odhlásite z tvojej aktivity"
            />
            <Toggle
              checked={prefs.notifyActivityFull}
              onChange={(v) => update("notifyActivityFull", v)}
              label="Aktivita je plná"
              desc="Keď sa naplní kapacita tvojej aktivity"
            />
          </div>

          <div className="mb-4 pb-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Prihlásené aktivity</h3>
            <Toggle
              checked={prefs.notifyReminders}
              onChange={(v) => update("notifyReminders", v)}
              label="Pripomienky"
              desc="Pripomienka 1 hodinu pred začiatkom aktivity"
            />
            <Toggle
              checked={prefs.notifyActivityUpdated}
              onChange={(v) => update("notifyActivityUpdated", v)}
              label="Zmeny v aktivite"
              desc="Keď organizátor zmení čas, miesto alebo iné detaily"
            />
            <Toggle
              checked={prefs.notifyActivityCancelled}
              onChange={(v) => update("notifyActivityCancelled", v)}
              label="Zrušenie aktivity"
              desc="Keď organizátor zruší aktivitu"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Sociálne</h3>
            <Toggle
              checked={prefs.notifyMessages}
              onChange={(v) => update("notifyMessages", v)}
              label="Správy"
              desc="Nové správy v chate aktivity"
            />
            <Toggle
              checked={prefs.notifyRatings}
              onChange={(v) => update("notifyRatings", v)}
              label="Hodnotenia"
              desc="Keď ťa niekto ohodnotí po aktivite"
            />
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">
            🎯 Filtre
          </h2>
          <Toggle
            checked={prefs.onlyFavoriteSports}
            onChange={(v) => update("onlyFavoriteSports", v)}
            label="Len obľúbené športy"
            desc="Notifikuj ma len o športoch z môjho profilu"
          />
          <div className="py-4 border-b border-[color:var(--fluent-divider)]">
            <p className="text-[color:var(--fluent-text)] font-medium mb-2">
              Maximálna cena aktivity
            </p>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() =>
                  update("maxPrice", Math.max(0, (prefs.maxPrice ?? 0) - 1))
                }
                className="absolute left-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-l-lg transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <input
                type="number"
                min="0"
                value={prefs.maxPrice ?? 0}
                onChange={(e) =>
                  update(
                    "maxPrice",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] w-full text-center focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "maxPrice",
                    Math.min(1000, (prefs.maxPrice ?? 0) + 1)
                  )
                }
                className="absolute right-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-r-lg transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">
            🌙 Nočný režim
          </h2>
          <Toggle
            checked={prefs.quietHoursEnabled}
            onChange={(v) => update("quietHoursEnabled", v)}
            label="Quiet hours"
            desc="Neposielať notifikácie v noci"
          />
          {prefs.quietHoursEnabled && (
            <div className="py-4 flex gap-4 items-center">
              <div>
                <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-1">
                  Od
                </p>
                <select
                  value={prefs.quietHoursStart}
                  onChange={(e) =>
                    update("quietHoursStart", Number(e.target.value))
                  }
                  className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-3 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-1">
                  Do
                </p>
                <select
                  value={prefs.quietHoursEnd}
                  onChange={(e) =>
                    update("quietHoursEnd", Number(e.target.value))
                  }
                  className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-3 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Rate Limit */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">
            ⚡ Limit notifikácií
          </h2>
          <div className="py-4">
            <p className="text-[color:var(--fluent-text)] font-medium mb-2">
              Maximum notifikácií denne
            </p>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() =>
                  update(
                    "maxNotificationsPerDay",
                    Math.max(1, prefs.maxNotificationsPerDay - 1)
                  )
                }
                className="absolute left-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-l-lg transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={prefs.maxNotificationsPerDay}
                onChange={(e) =>
                  update("maxNotificationsPerDay", Number(e.target.value))
                }
                className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] w-full text-center focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "maxNotificationsPerDay",
                    Math.min(100, prefs.maxNotificationsPerDay + 1)
                  )
                }
                className="absolute right-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-r-lg transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
          </div>
        </Card>

        <Button
          onClick={savePreferences}
          disabled={saving}
          className="w-full py-4 text-lg"
        >
          {saving ? "Ukladám..." : "💾 Uložiť nastavenia"}
        </Button>
      </div>
    </main>
  );
}
