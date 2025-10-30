'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

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

const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: 'Futbal',
  BASKETBALL: 'Basketbal',
  TENNIS: 'Tenis',
  VOLLEYBALL: 'Volejbal',
  BADMINTON: 'Bedminton',
  TABLE_TENNIS: 'Stolný tenis',
  RUNNING: 'Beh',
  CYCLING: 'Cyklistika',
  SWIMMING: 'Plávanie',
  GYM: 'Fitnes',
  OTHER: 'Iné',
};

const SKILL_LABELS: Record<string, string> = {
  BEGINNER: 'Začiatočník',
  INTERMEDIATE: 'Stredne pokročilý',
  ADVANCED: 'Pokročilý',
  EXPERT: 'Expert',
};

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Nepodarilo sa načítať profil');
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProfile}>Skúsiť znova</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--fluent-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--fluent-text)]">
            Môj profil
          </h1>
          <Link href="/profile/edit">
            <Button>Upraviť profil</Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  />
                ) : (
                  <div 
                    className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  >
                    <span className="text-5xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[color:var(--fluent-text)] mb-2">
                  {profile.name}
                </h2>
                <p className="text-[color:var(--fluent-text-secondary)] mb-4">
                  {profile.email}
                </p>

                {profile.profile?.bio && (
                  <p className="text-[color:var(--fluent-text)] mb-6">
                    {profile.profile.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  {profile.profile?.city && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[color:var(--fluent-surface-secondary)] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[color:var(--fluent-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--fluent-text-secondary)]">Mesto</p>
                        <p className="text-[color:var(--fluent-text)] font-medium">{profile.profile.city}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {profile.profile?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[color:var(--fluent-surface-secondary)] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[color:var(--fluent-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[color:var(--fluent-text-secondary)]">Telefón</p>
                        <p className="text-[color:var(--fluent-text)] font-medium">{profile.profile.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Skill Level */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[color:var(--fluent-surface-secondary)] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[color:var(--fluent-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[color:var(--fluent-text-secondary)]">Úroveň</p>
                      <p className="text-[color:var(--fluent-text)] font-medium">
                        {SKILL_LABELS[profile.profile?.skillLevel || 'BEGINNER']}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Sports */}
        {profile.profile?.favoriteSports && profile.profile.favoriteSports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Obľúbené športy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.profile.favoriteSports.map((sport) => (
                  <span
                    key={sport}
                    className="px-4 py-2 rounded-lg gradient-feature-1 text-white font-medium"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    {SPORT_LABELS[sport] || sport}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for No Info */}
        {!profile.profile?.bio && !profile.profile?.city && !profile.profile?.phone && 
         (!profile.profile?.favoriteSports || profile.profile.favoriteSports.length === 0) && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-[color:var(--fluent-surface-secondary)] rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-[color:var(--fluent-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[color:var(--fluent-text)] mb-2">
                Doplňte svoj profil
              </h3>
              <p className="text-[color:var(--fluent-text-secondary)] mb-6 max-w-md mx-auto">
                Pridajte informácie o sebe, aby ostatní vedeli viac o vás a vašich športových preferenciách.
              </p>
              <Link href="/profile/edit">
                <Button>Upraviť profil</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
