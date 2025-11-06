"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const { data: session } = useSession();

  const sports = [
    {
      id: "FOOTBALL",
      name: "Futbal",
      icon: "⚽",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "BASKETBALL",
      name: "Basketbal",
      icon: "🏀",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "TENNIS",
      name: "Tenis",
      icon: "🎾",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "VOLLEYBALL",
      name: "Volejbal",
      icon: "🏐",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "RUNNING",
      name: "Beh",
      icon: "🏃",
      color: "from-red-500 to-pink-600",
    },
    {
      id: "CYCLING",
      name: "Cyklistika",
      icon: "🚴",
      color: "from-purple-500 to-indigo-600",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Sports Selection */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-[color:var(--fluent-text)] text-center mb-10">
            Vyberte si váš šport
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() =>
                  setSelectedSport(sport.id === selectedSport ? null : sport.id)
                }
                className={`
                acrylic
                border border-[color:var(--fluent-border)]
                rounded-xl p-8 text-center
                transition-all duration-200 ease-out
                reveal-effect
                ${
                  selectedSport === sport.id
                    ? "border-[color:var(--fluent-accent)] border-2 bg-[color:var(--fluent-accent-light)] scale-105"
                    : "hover-glow hover:border-[color:var(--fluent-border-strong)]"
                }
              `}
                style={{
                  boxShadow:
                    selectedSport === sport.id
                      ? "var(--shadow-lg)"
                      : "var(--shadow-md)",
                }}
              >
                <div className="text-5xl mb-3">{sport.icon}</div>
                <div className="text-base font-semibold text-[color:var(--fluent-text)]">
                  {sport.name}
                </div>
              </button>
            ))}
          </div>
          {selectedSport && (
            <div className="mt-6 text-center animate-fade-in">
              <Link href={`/activities?sport=${selectedSport}`}>
                <Button size="lg">
                  Zobraziť {sports.find((s) => s.id === selectedSport)?.name}{" "}
                  aktivity
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-semibold text-[color:var(--fluent-text)] text-center mb-10">
          Ako to funguje
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card hover>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-1 rounded-xl mb-4 flex items-center justify-center transition-transform"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-[color:var(--fluent-text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <CardTitle>Nájdi spoluhráčov</CardTitle>
            </CardHeader>
            <CardContent>
              Pripojte sa k existujúcim aktivitám alebo vytvorte vlastné
              podujatie a nájdite ľudí s podobnými záujmami.
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card hover>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-2 rounded-xl mb-4 flex items-center justify-center transition-transform"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-[color:var(--fluent-text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle>Organizujte aktivity</CardTitle>
            </CardHeader>
            <CardContent>
              Jednoducho vytvárajte športové podujatia, nastavte čas, miesto a
              počet účastníkov.
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card hover>
            <CardHeader>
              <div
                className="w-16 h-16 gradient-feature-3 rounded-xl mb-4 flex items-center justify-center transition-transform"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg
                  className="w-8 h-8 text-[color:var(--fluent-text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <CardTitle>Športoviská v meste</CardTitle>
            </CardHeader>
            <CardContent>
              Prehľad všetkých dostupných športovísk vo vašom okolí s
              hodnoteniami a recenziami.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="relative overflow-hidden acrylic-strong rounded-xl p-12 text-center border-2 border-[color:var(--fluent-accent)]/30"
          style={{ boxShadow: "var(--shadow-xl)" }}
        >
          <div className="relative z-10">
            {session ? (
              <>
                <h2 className="text-3xl font-bold mb-4 text-[color:var(--fluent-text)]">
                  Objavte nové športové zážitky
                </h2>
                <p className="text-[color:var(--fluent-text-secondary)] mb-8 max-w-2xl mx-auto text-lg">
                  Preskúmajte aktivity vo vašom okolí a pripojte sa k športovej komunite.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/activities">
                    <Button
                      size="lg"
                      className="!bg-[color:var(--fluent-accent)] !text-white hover:!bg-[color:var(--fluent-accent-hover)] font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      Preskúmať aktivity
                    </Button>
                  </Link>
                  <Link href="/activities/create">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-[color:var(--fluent-border-strong)] !text-[color:var(--fluent-text)] hover:!bg-[color:var(--fluent-surface)] font-semibold text-lg px-8 py-6"
                    >
                      Vytvoriť aktivitu
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4 text-[color:var(--fluent-text)]">
                  Pripravení začať?
                </h2>
                <p className="text-[color:var(--fluent-text-secondary)] mb-8 max-w-2xl mx-auto text-lg">
                  Zaregistrujte sa ešte dnes a staňte sa súčasťou aktívnej športovej
                  komunity.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="!bg-[color:var(--fluent-accent)] !text-white hover:!bg-[color:var(--fluent-accent-hover)] font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      Vytvoriť účet zadarmo
                    </Button>
                  </Link>
                  <Link href="/activities">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-[color:var(--fluent-border-strong)] !text-[color:var(--fluent-text)] hover:!bg-[color:var(--fluent-surface)] font-semibold text-lg px-8 py-6"
                    >
                      Preskúmať aktivity
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[color:var(--fluent-divider)] mt-auto bg-[color:var(--fluent-surface-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[color:var(--fluent-text-tertiary)] text-base text-center md:text-left">
              © 2025 SportBuddy. Všetky práva vyhradené.
            </p>
            <div className="flex gap-8">
              <Link
                href="/about"
                className="text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
              >
                O nás
              </Link>
              <Link
                href="/contact"
                className="text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
              >
                Kontakt
              </Link>
              <Link
                href="/privacy"
                className="text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
              >
                Ochrana údajov
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
