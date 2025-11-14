"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
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
              <Link
                key={sport.id}
                href={`/activities?sportType=${sport.id}`}
                className={`
                acrylic
                border border-[color:var(--fluent-border)]
                rounded-xl p-8 text-center
                transition-all duration-200 ease-out
                reveal-effect
                hover-glow hover:border-[color:var(--fluent-border-strong)]
                block
              `}
                style={{
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="text-5xl mb-3">{sport.icon}</div>
                <div className="text-base font-semibold text-[color:var(--fluent-text)]">
                  {sport.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-[color:var(--fluent-text)] text-center mb-10">
            Ako to funguje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Link href="/activities">
              <Card hover className="cursor-pointer h-full">
                <CardHeader>
                  <div
                    className="w-16 h-16 gradient-feature-1 rounded-xl mb-4 flex items-center justify-center transition-transform"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
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
            </Link>

            {/* Feature 2 */}
            <Link href="/activities/create">
              <Card hover className="cursor-pointer h-full">
                <CardHeader>
                  <div
                    className="w-16 h-16 gradient-feature-2 rounded-xl mb-4 flex items-center justify-center transition-transform"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
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
                  Jednoducho vytvárajte športové podujatia, nastavte čas, miesto
                  a počet účastníkov.
                </CardContent>
              </Card>
            </Link>

            {/* Feature 3 */}
            <Link href="/venues">
              <Card hover className="cursor-pointer h-full">
                <CardHeader>
                  <div
                    className="w-16 h-16 gradient-feature-3 rounded-xl mb-4 flex items-center justify-center transition-transform"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
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
                  <CardTitle>Aktivity vo vašej lokalite</CardTitle>
                </CardHeader>
                <CardContent>
                  Jednoducho nájdite dostupné aktivity vo vašom okolí pomocou
                  interaktívnej mapy.
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 mt-8 pb-2">
        <div className="max-w-7xl mx-auto">
          <div
            className="acrylic border border-[color:var(--fluent-border)] rounded-xl p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <p className="text-[color:var(--fluent-text-tertiary)] text-sm sm:text-base text-center sm:text-left">
                © 2025 SportBuddy. Všetky práva vyhradené.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                <Link
                  href="/about"
                  className="text-sm sm:text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
                >
                  O nás
                </Link>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
                >
                  Kontakt
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm sm:text-base text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)] transition-colors duration-150"
                >
                  Ochrana údajov
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
