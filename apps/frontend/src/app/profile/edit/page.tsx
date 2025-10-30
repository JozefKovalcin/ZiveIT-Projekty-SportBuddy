'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

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
  } | null;
}

const SPORT_OPTIONS = [
  { value: 'FOOTBALL', label: 'Futbal' },
  { value: 'BASKETBALL', label: 'Basketbal' },
  { value: 'TENNIS', label: 'Tenis' },
  { value: 'VOLLEYBALL', label: 'Volejbal' },
  { value: 'BADMINTON', label: 'Bedminton' },
  { value: 'TABLE_TENNIS', label: 'Stolný tenis' },
  { value: 'RUNNING', label: 'Beh' },
  { value: 'CYCLING', label: 'Cyklistika' },
  { value: 'SWIMMING', label: 'Plávanie' },
  { value: 'GYM', label: 'Fitnes' },
  { value: 'OTHER', label: 'Iné' },
];

const SKILL_OPTIONS = [
  { value: 'BEGINNER', label: 'Začiatočník' },
  { value: 'INTERMEDIATE', label: 'Stredne pokročilý' },
  { value: 'ADVANCED', label: 'Pokročilý' },
  { value: 'EXPERT', label: 'Expert' },
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
    name: '',
    bio: '',
    phone: '',
    city: '',
    skillLevel: 'BEGINNER',
    favoriteSports: [] as string[],
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/auth/signin');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.profile?.bio || '',
        phone: data.profile?.phone || '',
        city: data.profile?.city || '',
        skillLevel: data.profile?.skillLevel || 'BEGINNER',
        favoriteSports: data.profile?.favoriteSports || [],
        image: data.image || '',
      });
      setImagePreview(data.image);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Nepodarilo sa načítať profil');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Nepodarilo sa aktualizovať profil');
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
      setError('Obrázok je príliš veľký. Maximum je 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Môžete nahrať iba obrázky.');
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
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview(null);
  };

  if (isPending || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--fluent-text-secondary)]">Načítavam profil...</p>
        </div>
      </main>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--fluent-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--fluent-text)] mb-2">
            Upraviť profil
          </h1>
          <p className="text-[color:var(--fluent-text-secondary)]">
            Aktualizujte svoje informácie a športové preferencie
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-3">
                  Profilová fotka
                </label>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Náhľad"
                        className="w-24 h-24 rounded-full object-cover"
                        style={{ boxShadow: 'var(--shadow-lg)' }}
                      />
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center"
                        style={{ boxShadow: 'var(--shadow-lg)' }}
                      >
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
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-600 transition-colors"
                      >
                        Nahrať obrázok
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        >
                          Odstrániť
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--fluent-text-secondary)] mt-2">
                      JPG, PNG alebo GIF. Maximum 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Meno <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Vaše meno"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  O mne
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Niečo o vás..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[color:var(--fluent-border)] bg-[color:var(--fluent-surface)] text-[color:var(--fluent-text)] focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Mesto
                </label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bratislava"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Telefón
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+421 XXX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="skillLevel" className="block text-sm font-medium text-[color:var(--fluent-text)] mb-2">
                  Športová úroveň
                </label>
                <select
                  id="skillLevel"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[color:var(--fluent-border)] bg-[color:var(--fluent-surface)] text-[color:var(--fluent-text)] focus:border-blue-500 focus:outline-none transition-colors"
                >
                  {SKILL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--fluent-text)] mb-3">
                  Obľúbené športy
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPORT_OPTIONS.map((sport) => (
                    <button
                      key={sport.value}
                      type="button"
                      onClick={() => handleSportToggle(sport.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.favoriteSports.includes(sport.value)
                          ? 'border-blue-500 bg-blue-500 text-white font-medium'
                          : 'border-[color:var(--fluent-border)] bg-[color:var(--fluent-surface)] text-[color:var(--fluent-text)] hover:border-blue-300'
                      }`}
                    >
                      {sport.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                  <p className="text-green-600 dark:text-green-400">
                    Profil bol úspešne aktualizovaný! Presmerovávam...
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Ukladám...' : 'Uložiť zmeny'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/profile')}
                  disabled={saving}
                >
                  Zrušiť
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
