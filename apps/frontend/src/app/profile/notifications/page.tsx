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
  notifyParticipants: boolean;
  notifyActivityFull: boolean;
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
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

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
    const res = await fetch(`${API_URL}/api/notifications/preferences`, { credentials: "include" });
    if (res.ok) setPrefs(await res.json());
    setLoading(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    await fetch(`${API_URL}/api/notifications/preferences`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaving(false);
  };

  const requestPushPermission = async () => {
    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    if (permission === "granted") {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    }
  };

  const update = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    if (prefs) setPrefs({ ...prefs, [key]: value });
  };

  if (isPending || loading) return <div className="min-h-screen flex items-center justify-center text-[color:var(--fluent-accent)]">Načítavam...</div>;
  if (!prefs) return null;

  const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-[color:var(--fluent-divider)] last:border-0">
      <div>
        <p className="text-[color:var(--fluent-text)] font-medium">{label}</p>
        {desc && <p className="text-[color:var(--fluent-text-secondary)] text-sm">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`w-14 h-8 rounded-full transition-all relative ${checked ? "bg-[color:var(--fluent-accent)]" : "bg-[color:var(--fluent-surface-secondary)]"}`}>
        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${checked ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-2">Nastavenia notifikácií</h1>
        <p className="text-[color:var(--fluent-text-secondary)]">Prispôsob si, ako a kedy chceš dostávať notifikácie</p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">📬 Kanály notifikácií</h2>
          <Toggle checked={prefs.inAppEnabled} onChange={(v) => update("inAppEnabled", v)} label="In-app notifikácie" desc="Notifikácie priamo v aplikácii" />
          <Toggle checked={prefs.emailEnabled} onChange={(v) => update("emailEnabled", v)} label="Email notifikácie" desc="Dostávaj notifikácie na email" />
          {prefs.emailEnabled && (
            <div className="py-4 border-b border-[color:var(--fluent-divider)] pl-4">
              <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-2">Frekvencia emailov</p>
              <select value={prefs.emailFrequency} onChange={(e) => update("emailFrequency", e.target.value as any)}
                className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]">
                <option value="INSTANT">Okamžite</option>
                <option value="DAILY_DIGEST">Denný súhrn</option>
                <option value="WEEKLY_DIGEST">Týždenný súhrn</option>
              </select>
            </div>
          )}
          <Toggle checked={prefs.pushEnabled} onChange={(v) => update("pushEnabled", v)} label="Push notifikácie" desc="Notifikácie aj keď nie si v aplikácii" />
          {prefs.pushEnabled && pushSupported && pushPermission !== "granted" && (
            <div className="py-4 pl-4">
              <Button onClick={requestPushPermission} variant="secondary">Povoliť push notifikácie</Button>
            </div>
          )}
        </Card>

        {/* Notification Types */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">🔔 Typy notifikácií</h2>
          <Toggle checked={prefs.notifyNewActivities} onChange={(v) => update("notifyNewActivities", v)} label="Nové aktivity" desc="Keď sa vytvorí aktivita podľa tvojich preferencií" />
          
          {/* Radius Slider for New Activities */}
          {prefs.notifyNewActivities && (
            <div className="py-4 border-b border-[color:var(--fluent-divider)] pl-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[color:var(--fluent-text-secondary)] text-sm">Vzdialenosť od mojej polohy</p>
                <span className="text-[color:var(--fluent-accent)] font-bold">
                  {prefs.maxDistance ? `${prefs.maxDistance} km` : "Neobmedzene"}
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

          <Toggle checked={prefs.notifyReminders} onChange={(v) => update("notifyReminders", v)} label="Pripomienky" desc="Pripomienka pred začiatkom aktivity" />
          <Toggle checked={prefs.notifyParticipants} onChange={(v) => update("notifyParticipants", v)} label="Účastníci" desc="Keď sa niekto pridá alebo odíde z tvojej aktivity" />
          <Toggle checked={prefs.notifyActivityFull} onChange={(v) => update("notifyActivityFull", v)} label="Aktivita je plná" desc="Keď sa naplní kapacita aktivity, ktorú sleduješ" />
        </Card>

        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">🎯 Filtre</h2>
          <Toggle checked={prefs.onlyFavoriteSports} onChange={(v) => update("onlyFavoriteSports", v)} label="Len obľúbené športy" desc="Notifikuj ma len o športoch z môjho profilu" />
          <div className="py-4 border-b border-[color:var(--fluent-divider)]">
            <p className="text-[color:var(--fluent-text)] font-medium mb-2">Maximálna cena aktivity</p>
            <div className="flex items-center gap-3">
              <input type="number" min="0" value={prefs.maxPrice ?? ""} onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : null)}
                placeholder="Bez limitu" className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] w-32 focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]" />
              <span className="text-[color:var(--fluent-text-secondary)]">€</span>
            </div>
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">🌙 Nočný režim</h2>
          <Toggle checked={prefs.quietHoursEnabled} onChange={(v) => update("quietHoursEnabled", v)} label="Quiet hours" desc="Neposielať notifikácie v noci" />
          {prefs.quietHoursEnabled && (
            <div className="py-4 flex gap-4 items-center">
              <div>
                <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-1">Od</p>
                <select value={prefs.quietHoursStart} onChange={(e) => update("quietHoursStart", Number(e.target.value))}
                  className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-3 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
                </select>
              </div>
              <div>
                <p className="text-[color:var(--fluent-text-secondary)] text-sm mb-1">Do</p>
                <select value={prefs.quietHoursEnd} onChange={(e) => update("quietHoursEnd", Number(e.target.value))}
                  className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-3 py-2 text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Rate Limit */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-[color:var(--fluent-text)] mb-4">⚡ Limit notifikácií</h2>
          <div className="py-4">
            <p className="text-[color:var(--fluent-text)] font-medium mb-2">Maximum notifikácií denne</p>
            <input type="number" min="1" max="100" value={prefs.maxNotificationsPerDay}
              onChange={(e) => update("maxNotificationsPerDay", Number(e.target.value))}
              className="bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg px-4 py-2 text-[color:var(--fluent-text)] w-24 focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]" />
          </div>
        </Card>

        <Button onClick={savePreferences} disabled={saving} className="w-full py-4 text-lg">
          {saving ? "Ukladám..." : "💾 Uložiť nastavenia"}
        </Button>
      </div>
    </main>
  );
}