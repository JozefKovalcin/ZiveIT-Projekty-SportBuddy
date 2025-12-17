"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SkillSlider } from "@/components/SkillSlider";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  profile: {
    bio: string | null;
    phone: string | null;
    city: string | null;
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
}

const SPORT_OPTIONS = [
  { value: "FOOTBALL", label: "Futbal" },
  { value: "BASKETBALL", label: "Basketbal" },
  { value: "TENNIS", label: "Tenis" },
  { value: "VOLLEYBALL", label: "Volejbal" },
  { value: "BADMINTON", label: "Bedminton" },
  { value: "TABLE_TENNIS", label: "Stolný tenis" },
  { value: "RUNNING", label: "Beh" },
  { value: "CYCLING", label: "Cyklistika" },
  { value: "SWIMMING", label: "Plávanie" },
  { value: "GYM", label: "Fitnes" },
];

const SKILL_OPTIONS = [
  { value: "BEGINNER", label: "Začiatočník" },
  { value: "INTERMEDIATE", label: "Stredne pokročilý" },
  { value: "ADVANCED", label: "Pokročilý" },
  { value: "EXPERT", label: "Expert" },
  { value: "PROFESSIONAL", label: "Profesionál" },
];

export default function ProfileEditPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    city: "",
    skillLevel: "BEGINNER",
    favoriteSports: [] as string[],
    image: "",
    footballSkill: 1,
    basketballSkill: 1,
    tennisSkill: 1,
    volleyballSkill: 1,
    badmintonSkill: 1,
    tableTennisSkill: 1,
    runningSkill: 1,
    cyclingSkill: 1,
    swimmingSkill: 1,
    gymSkill: 1,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || "",
        bio: data.profile?.bio || "",
        phone: data.profile?.phone || "",
        city: data.profile?.city || "",
        skillLevel: data.profile?.skillLevel || "BEGINNER",
        favoriteSports: data.profile?.favoriteSports || [],
        image: data.image || "",
        footballSkill: data.profile?.footballSkill || 1,
        basketballSkill: data.profile?.basketballSkill || 1,
        tennisSkill: data.profile?.tennisSkill || 1,
        volleyballSkill: data.profile?.volleyballSkill || 1,
        badmintonSkill: data.profile?.badmintonSkill || 1,
        tableTennisSkill: data.profile?.tableTennisSkill || 1,
        runningSkill: data.profile?.runningSkill || 1,
        cyclingSkill: data.profile?.cyclingSkill || 1,
        swimmingSkill: data.profile?.swimmingSkill || 1,
        gymSkill: data.profile?.gymSkill || 1,
      });
      setImagePreview(data.image);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Nepodarilo sa načítať profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Nepodarilo sa aktualizovať profil");
    } finally {
      setSaving(false);
    }
  };

  const handleSportToggle = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteSports: prev.favoriteSports.includes(sport)
        ? prev.favoriteSports.filter((s) => s !== sport)
        : [...prev.favoriteSports, sport],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Obrázok je príliš veľký. Maximum je 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Môžete nahrať iba obrázky.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, image: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
  };

  if (isPending || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Načítavam profil...</p>
        </div>
      </main>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-radial from-emerald-900/40 via-[#022c22] to-black pt-36 relative">
      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <p className="text-emerald-300 font-semibold text-sm tracking-wide">
              Profil bol úspešne aktualizovaný!
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Upraviť profil
            </h1>
            <p className="text-gray-300">
              Aktualizujte svoje informácie a športové preferencie
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              disabled={saving}
              className="acrylic text-center transition-all duration-300 border border-white/10 hover:border-red-500/40 font-bold tracking-wide text-gray-200 hover:text-red-400 inline-block"
              style={{
                borderRadius: "9999px",
                padding: "14px 40px",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={saving}
              onClick={handleSubmit}
              className="acrylic text-center transition-all duration-300 border border-white/10 hover:border-emerald-500/40 font-bold tracking-wide text-gray-200 hover:text-emerald-400 inline-block"
              style={{
                borderRadius: "9999px",
                padding: "14px 40px",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              {saving ? "Ukladám..." : "Uložiť zmeny"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <label className="block text-[15px] font-semibold text-white mb-3 tracking-wide">
                    Profilová fotka
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Náhľad"
                          className="w-24 h-24 rounded-full object-cover shadow-lg shadow-black/30"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-black/30">
                          <span className="text-3xl font-bold text-white">
                            {formData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex gap-3">
                        <label
                          htmlFor="imageUpload"
                          className="acrylic text-center transition-all duration-300 border border-white/10 hover:border-emerald-500/40 font-bold tracking-wide text-gray-200 hover:text-emerald-400 cursor-pointer"
                          style={{
                            borderRadius: "9999px",
                            padding: "10px 24px",
                            fontSize: "14px",
                            textDecoration: "none",
                            background: "rgba(255, 255, 255, 0.03)",
                            backdropFilter: "blur(24px) saturate(180%)",
                            WebkitBackdropFilter: "blur(24px) saturate(180%)",
                            boxShadow:
                              "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          }}
                        >
                          Nahrať obrázok
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="acrylic text-center transition-all duration-300 border border-white/10 hover:border-red-500/40 font-bold tracking-wide text-gray-200 hover:text-red-400"
                            style={{
                              borderRadius: "9999px",
                              padding: "10px 24px",
                              fontSize: "14px",
                              textDecoration: "none",
                              background: "rgba(255, 255, 255, 0.03)",
                              backdropFilter: "blur(24px) saturate(180%)",
                              WebkitBackdropFilter: "blur(24px) saturate(180%)",
                              boxShadow:
                                "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            }}
                          >
                            Odstrániť
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        JPG, PNG alebo GIF. Maximum 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-[15px] font-semibold text-white mb-2 tracking-wide"
                  >
                    Meno <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Vaše meno"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-[15px] font-semibold text-white mb-2 tracking-wide"
                  >
                    O mne
                  </label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Niečo o vás..."
                    rows={4}
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-[15px] font-semibold text-white mb-2 tracking-wide"
                  >
                    Mesto
                  </label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Bratislava"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[15px] font-semibold text-white mb-2 tracking-wide"
                  >
                    Telefón
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+421 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-white mb-3 tracking-wide">
                    Obľúbené športy
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_OPTIONS.map((sport) => {
                      const isSelected = formData.favoriteSports.includes(
                        sport.value
                      );
                      return (
                        <button
                          key={sport.value}
                          type="button"
                          onClick={() => handleSportToggle(sport.value)}
                          className={`px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                          }`}
                          style={{
                            border: isSelected
                              ? "1px solid rgba(16, 185, 129, 0.45)"
                              : "1px solid rgba(255, 255, 255, 0.12)",
                            boxShadow: "none",
                            color: isSelected ? "#a7f3d0" : "white",
                          }}
                        >
                          {sport.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-5">
                <label className="block text-[15px] font-semibold text-white tracking-wide">
                  Úroveň zručností v jednotlivých športoch
                </label>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Futbal
                    </label>
                    <SkillSlider
                      value={formData.footballSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, footballSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Basketbal
                    </label>
                    <SkillSlider
                      value={formData.basketballSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, basketballSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Tenis
                    </label>
                    <SkillSlider
                      value={formData.tennisSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, tennisSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Volejbal
                    </label>
                    <SkillSlider
                      value={formData.volleyballSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, volleyballSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Bedminton
                    </label>
                    <SkillSlider
                      value={formData.badmintonSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, badmintonSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Stolný tenis
                    </label>
                    <SkillSlider
                      value={formData.tableTennisSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, tableTennisSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Beh
                    </label>
                    <SkillSlider
                      value={formData.runningSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, runningSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Cyklistika
                    </label>
                    <SkillSlider
                      value={formData.cyclingSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, cyclingSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Plávanie
                    </label>
                    <SkillSlider
                      value={formData.swimmingSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, swimmingSkill: value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] text-gray-300 mb-2 font-medium">
                      Fitnes
                    </label>
                    <SkillSlider
                      value={formData.gymSkill}
                      onChange={(value) =>
                        setFormData({ ...formData, gymSkill: value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
