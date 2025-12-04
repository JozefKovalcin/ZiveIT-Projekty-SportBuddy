"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { LocationPicker } from "@/components/LocationPicker";
import { useSession } from "@/lib/auth-client";
import AIActivityAssistant from "@/components/AIActivityAssistant";

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
  { value: "PROFESSIONAL", label: "Profesionál" },
];

const genderOptions = [
  { value: "MIXED", label: "Bez preferencie" },
  { value: "MALE", label: "Muži" },
  { value: "FEMALE", label: "Ženy" },
];

export default function CreateActivityPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
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
    gender: "MIXED" as "MALE" | "FEMALE" | "MIXED",
    minAge: 18,
    maxAge: 99,
    price: 0,
    isPublic: true,
    isRecurring: false,
    recurrenceFrequency: "NONE" as "NONE" | "DAILY" | "WEEKLY" | "MONTHLY",
    recurrenceDays: [] as number[],
    recurrenceEndDate: "",
    autoJoinAll: false,
    autoJoinGuestCount: 0,
  });

  const [location, setLocation] = useState({
    address: "",
    name: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8 pt-36">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-300">Načítavam...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 pt-36">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔒</p>
              <h3 className="text-xl font-semibold text-white mb-2">
                Prihlásenie potrebné
              </h3>
              <p className="text-gray-300 mb-6">
                Pre vytvorenie aktivity sa musíte prihlásiť
              </p>
              <Link href="/auth/signin?redirect=/activities/create">
                <Button variant="primary">Prihlásiť sa</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.address) {
      setError("Prosím zadajte adresu aktivity");
      return;
    }

    if (formData.minAge > formData.maxAge) {
      setError("Minimálny vek nemôže byť väčší ako maximálny vek");
      return;
    }

    if (
      formData.isRecurring &&
      formData.recurrenceFrequency === "WEEKLY" &&
      formData.recurrenceDays.length === 0
    ) {
      setError(
        "Pre týždenné opakovanie musíte vybrať aspoň jeden deň v týždni"
      );
      return;
    }

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
            location: location.address,
            locationName: location.name || undefined,
            latitude: location.latitude,
            longitude: location.longitude,
            gender: formData.gender,
            minAge: formData.minAge,
            maxAge: formData.maxAge,
            price: formData.price,
            isRecurring: formData.isRecurring,
            recurrenceFrequency: formData.isRecurring
              ? formData.recurrenceFrequency
              : "NONE",
            recurrenceDays:
              formData.isRecurring && formData.recurrenceFrequency === "WEEKLY"
                ? formData.recurrenceDays
                : [],
            recurrenceEndDate:
              formData.isRecurring && formData.recurrenceEndDate
                ? new Date(formData.recurrenceEndDate).toISOString()
                : undefined,
            autoJoinAll: formData.isRecurring ? formData.autoJoinAll : false,
            autoJoinGuestCount:
              formData.isRecurring && formData.autoJoinAll
                ? formData.autoJoinGuestCount
                : 0,
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

  const handleAIData = async (aiData: any) => {
    console.log("AI Data received:", aiData);

    // Update form data with AI generated values
    const updates: any = {};

    if (aiData.title) updates.title = aiData.title;
    if (aiData.description) updates.description = aiData.description;
    if (aiData.sportType) updates.sportType = aiData.sportType;
    if (aiData.skillLevel) updates.skillLevel = aiData.skillLevel;
    if (aiData.maxParticipants)
      updates.maxParticipants = aiData.maxParticipants;
    if (aiData.price !== undefined) updates.price = aiData.price;
    if (aiData.gender) updates.gender = aiData.gender;
    if (aiData.minAge) updates.minAge = aiData.minAge;
    if (aiData.maxAge) updates.maxAge = aiData.maxAge;
    if (aiData.date) updates.date = aiData.date;
    if (aiData.time) updates.time = aiData.time;
    if (aiData.duration) updates.duration = aiData.duration;

    // Recurring activity fields
    if (aiData.isRecurring !== undefined)
      updates.isRecurring = aiData.isRecurring;
    if (aiData.recurrenceFrequency)
      updates.recurrenceFrequency = aiData.recurrenceFrequency;
    if (aiData.recurrenceDays && Array.isArray(aiData.recurrenceDays)) {
      updates.recurrenceDays = aiData.recurrenceDays;
    }

    // For recurring activities without a specific date, set to next occurrence
    if (
      aiData.isRecurring &&
      !aiData.date &&
      aiData.recurrenceDays?.length > 0
    ) {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday
      const targetDays = aiData.recurrenceDays.sort(
        (a: number, b: number) => a - b
      );

      // Find the next occurrence day
      let daysUntilNext = 7;
      for (const day of targetDays) {
        const diff = (day - currentDay + 7) % 7;
        if (diff > 0 && diff < daysUntilNext) {
          daysUntilNext = diff;
        }
      }
      if (daysUntilNext === 7) daysUntilNext = targetDays[0] - currentDay + 7;

      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilNext);
      updates.date = nextDate.toISOString().split("T")[0];
    }

    console.log("Applying updates:", updates);

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    // If location is provided, geocode it to get coordinates for map display
    if (aiData.location) {
      // Geocode the address to get coordinates
      if (window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        try {
          const result = await geocoder.geocode({ address: aiData.location });
          if (result.results && result.results[0]) {
            const { lat, lng } = result.results[0].geometry.location;
            const formattedAddress = result.results[0].formatted_address;
            setLocation({
              address: formattedAddress || aiData.location,
              name: aiData.location,
              latitude: lat(),
              longitude: lng(),
            });
          } else {
            // No geocoding result, just set the address
            setLocation((prev) => ({
              ...prev,
              address: aiData.location,
            }));
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocation((prev) => ({
            ...prev,
            address: aiData.location,
          }));
        }
      } else {
        setLocation((prev) => ({
          ...prev,
          address: aiData.location,
        }));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-36">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Vytvoriť novú aktivitu
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* AI Assistant */}
        <div className="mb-6">
          <AIActivityAssistant onActivityDataReceived={handleAIData} />
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {/* Názov */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">
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
                <label className="block text-sm font-medium mb-2 text-white">
                  Typ športu *
                </label>
                <Select
                  name="sportType"
                  value={formData.sportType}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, sportType: value }))
                  }
                  options={sportTypes}
                  required
                />
              </div>

              {/* Dátum a čas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Dátum *
                  </label>
                  <DatePicker
                    name="date"
                    value={formData.date}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, date: value }))
                    }
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Čas *
                  </label>
                  <TimePicker
                    name="time"
                    value={formData.time}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, time: value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Dĺžka trvania a max účastníci */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Dĺžka trvania (minúty) *
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: Math.max(15, prev.duration - 15),
                        }))
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
                    <Input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min={15}
                      max={480}
                      step={15}
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: Math.min(480, prev.duration + 15),
                        }))
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
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Max počet hráčov *
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          maxParticipants: Math.max(
                            2,
                            prev.maxParticipants - 1
                          ),
                        }))
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
                    <Input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      required
                      min={2}
                      max={50}
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          maxParticipants: Math.min(
                            50,
                            prev.maxParticipants + 1
                          ),
                        }))
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
              </div>

              {/* Miesto konania */}
              <div className="mb-6">
                <LocationPicker value={location} onChange={setLocation} />
              </div>

              {/* Pohlavie */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">
                  Pohlavie *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {genderOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          formData.gender === option.value
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                            : "border-white/10 bg-white/[0.03] text-white hover:border-white/20"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vekové rozpätie a cena */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Min. vek *
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          minAge: Math.max(6, prev.minAge - 1),
                        }))
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
                    <Input
                      type="number"
                      name="minAge"
                      value={formData.minAge}
                      onChange={handleChange}
                      required
                      min={6}
                      max={99}
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          minAge: Math.min(99, prev.minAge + 1),
                        }))
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
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Max. vek *
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          maxAge: Math.max(6, prev.maxAge - 1),
                        }))
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
                    <Input
                      type="number"
                      name="maxAge"
                      value={formData.maxAge}
                      onChange={handleChange}
                      required
                      min={6}
                      max={99}
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          maxAge: Math.min(99, prev.maxAge + 1),
                        }))
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
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Cena (€)
                  </label>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          price: Math.max(0, prev.price - 0.5),
                        }))
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
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min={0}
                      step={0.5}
                      placeholder="0 = zadarmo"
                      className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          price: Math.round((prev.price + 0.5) * 10) / 10,
                        }))
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
              </div>

              {/* Úroveň */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">
                  Úroveň hráčov *
                </label>
                <Select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, skillLevel: value }))
                  }
                  options={skillLevels}
                  required
                />
              </div>

              {/* Popis */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">
                  Popis (voliteľné)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Pridajte podrobnosti o aktivite..."
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-gray-500"
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
                    className="w-5 h-5 rounded border-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500 bg-white/[0.03]"
                  />
                  <span className="text-sm text-white">
                    Verejná aktivita (viditeľná pre všetkých)
                  </span>
                </label>
              </div>

              {/* Recurring Activity */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500 bg-white/[0.03]"
                  />
                  <span className="text-sm text-white">
                    Pravidelne opakovaná aktivita
                  </span>
                </label>

                {formData.isRecurring && (
                  <div className="ml-8 space-y-4 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Frekvencia opakovania *
                      </label>
                      <Select
                        name="recurrenceFrequency"
                        value={formData.recurrenceFrequency}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrenceFrequency: value as
                              | "NONE"
                              | "DAILY"
                              | "WEEKLY"
                              | "MONTHLY",
                          }))
                        }
                        options={[
                          { value: "NONE", label: "Nevybrané" },
                          { value: "DAILY", label: "Denne" },
                          { value: "WEEKLY", label: "Týždenne" },
                          { value: "MONTHLY", label: "Mesačne" },
                        ]}
                        required={formData.isRecurring}
                      />
                    </div>

                    {/* Days of week for WEEKLY */}
                    {formData.recurrenceFrequency === "WEEKLY" && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Dni v týždni *
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {["Ne", "Po", "Ut", "St", "Št", "Pi", "So"].map(
                            (day, index) => {
                              const isSelected =
                                formData.recurrenceDays.includes(index);
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      recurrenceDays: isSelected
                                        ? prev.recurrenceDays.filter(
                                            (d) => d !== index
                                          )
                                        : [
                                            ...prev.recurrenceDays,
                                            index,
                                          ].sort(),
                                    }));
                                  }}
                                  className={`
                                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                                  ${
                                    isSelected
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white/[0.03] border border-white/10 text-white hover:border-white/20"
                                  }
                                `}
                                >
                                  {day}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* End date */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Dátum ukončenia opakovania (voliteľné)
                      </label>
                      <DatePicker
                        name="recurrenceEndDate"
                        value={formData.recurrenceEndDate}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurrenceEndDate: value,
                          }))
                        }
                        min={
                          formData.date ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Ak nezadáte, aktivity sa budú generovať na 2 mesiace
                        dopredu (max 20 aktivít)
                      </p>
                    </div>

                    {/* Auto-join checkbox */}
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={formData.autoJoinAll}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              autoJoinAll: e.target.checked,
                              autoJoinGuestCount: e.target.checked
                                ? prev.autoJoinGuestCount
                                : 0,
                            }));
                          }}
                          className="w-5 h-5 rounded border-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500 bg-white/[0.03]"
                        />
                        <span className="text-sm text-white">
                          Automaticky sa prihlás na všetky vygenerované aktivity
                        </span>
                      </label>

                      {formData.autoJoinAll && (
                        <div className="ml-8">
                          <label className="block text-sm font-medium mb-2 text-white">
                            Počet hostí (okrem teba)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={formData.maxParticipants - 1}
                            value={formData.autoJoinGuestCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const maxGuests = formData.maxParticipants - 1;
                              setFormData((prev) => ({
                                ...prev,
                                autoJoinGuestCount: Math.min(value, maxGuests),
                              }));
                            }}
                            placeholder="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Počet ľudí, ktorých berieš so sebou (hosťa) - max{" "}
                            {formData.maxParticipants - 1}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  disabled={loading || !location.address}
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
