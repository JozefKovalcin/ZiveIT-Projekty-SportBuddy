"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  sportTypes: string[];
}

const sportTypes = [
  { value: "FOOTBALL", label: "Futbal" },
  { value: "BASKETBALL", label: "Basketbal" },
  { value: "TENNIS", label: "Tenis" },
  { value: "VOLLEYBALL", label: "Volejbal" },
  { value: "BADMINTON", label: "Bedminton" },
  { value: "TABLE_TENNIS", label: "Stolný tenis" },
  { value: "RUNNING", label: "Beh" },
  { value: "CYCLING", label: "Cyklistika" },
  { value: "SWIMMING", label: "Plávanie" },
  { value: "GYM", label: "Posilňovňa" },
  { value: "OTHER", label: "Iné" },
];

const skillLevels = [
  { value: "BEGINNER", label: "Začiatočník" },
  { value: "INTERMEDIATE", label: "Mierne pokročilý" },
  { value: "ADVANCED", label: "Pokročilý" },
  { value: "EXPERT", label: "Expert" },
];

export default function CreateActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sportType: "FOOTBALL",
    skillLevel: "INTERMEDIATE",
    date: "",
    time: "",
    duration: 90,
    maxParticipants: 10,
    venueId: "",
    isPublic: true,
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/venues`
      );
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, venueId: data[0].id }));
        }
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            date: dateTime.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri vytváraní aktivity");
      }

      const activity = await response.json();
      router.push(`/activities/${activity.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  if (loadingVenues) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[color:var(--fluent-text-secondary)]">
            Načítavam...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[color:var(--fluent-text)]">
          Vytvoriť novú aktivitu
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {/* Názov */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                  Názov aktivity *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="napr. Futbal v parku"
                />
              </div>

              {/* Šport */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                  Typ športu *
                </label>
                <select
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {sportTypes.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dátum a čas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                    Dátum *
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                    Čas *
                  </label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Dĺžka trvania a max účastníci */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                    Dĺžka trvania (minúty) *
                  </label>
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min={15}
                    max={480}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                    Max počet hráčov *
                  </label>
                  <Input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                    min={2}
                    max={50}
                  />
                </div>
              </div>

              {/* Športovisko */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                  Športovisko *
                </label>
                {venues.length === 0 ? (
                  <p className="text-sm text-[color:var(--fluent-text-secondary)]">
                    Žiadne športoviská nie sú dostupné. Kontaktujte
                    administrátora.
                  </p>
                ) : (
                  <select
                    name="venueId"
                    value={formData.venueId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  >
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Úroveň */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                  Úroveň hráčov *
                </label>
                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                >
                  {skillLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Popis */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[color:var(--fluent-text)]">
                  Popis (voliteľné)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Pridajte podrobnosti o aktivite..."
                  className="w-full px-4 py-2.5 bg-[color:var(--fluent-surface-secondary)] border border-[color:var(--fluent-border)] rounded-lg text-[color:var(--fluent-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)] resize-none"
                />
              </div>

              {/* Public/Private */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[color:var(--fluent-border)] text-[color:var(--fluent-accent)] focus:ring-2 focus:ring-[color:var(--fluent-accent)]"
                  />
                  <span className="text-sm text-[color:var(--fluent-text)]">
                    Verejná aktivita (viditeľná pre všetkých)
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Zrušiť
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || venues.length === 0}
                >
                  {loading ? "Vytváranie..." : "Vytvoriť aktivitu"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
