"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = useSession();

  const sports = [
    { id: "FOOTBALL", name: "Futbal", icon: "⚽" },
    { id: "BASKETBALL", name: "Basketbal", icon: "🏀" },
    { id: "TENNIS", name: "Tenis", icon: "🎾" },
    { id: "VOLLEYBALL", name: "Volejbal", icon: "🏐" },
    { id: "RUNNING", name: "Beh", icon: "🏃" },
    { id: "CYCLING", name: "Cyklistika", icon: "🚴" },
  ];

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden pt-24">
      {/* Background Effects (Orbs) */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[130px] pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <div className="relative px-6 sm:px-8 lg:px-12 py-20 flex flex-col items-center text-center z-10">
        <div className="animate-float">
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 drop-shadow-2xl text-white">
            Nájdi svoj tím.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Športuj naplno.
            </span>
          </h1>
        </div>

        <Link href="/activities">
          <Button
            variant="primary"
            size="lg"
            className="text-3xl px-16 py-6 text-gray-100 mb-8"
          >
            Hľadať aktivity
          </Button>
        </Link>

        <p className="max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed font-light">
          Najlepšia platforma na hľadanie spoluhráčov a organizáciu športových
          aktivít vo tvojom meste.
        </p>
      </div>

      {/* Sports Selection */}
      <div className="px-6 sm:px-8 lg:px-12 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12 gap-6 opacity-80">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent flex-1"></div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              Vyber si šport
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent flex-1"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/activities?sportType=${sport.id}`}
                className="acrylic p-8 text-center transition-all duration-300 flex flex-col items-center justify-center aspect-square group hover:border-emerald-500/40 border border-white/10"
              >
                <div className="text-6xl mb-6 transform transition-transform drop-shadow-lg opacity-90">
                  {sport.icon}
                </div>
                <div className="font-bold text-lg tracking-wide text-gray-200 group-hover:text-emerald-400 transition-colors">
                  {sport.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 sm:px-8 lg:px-12 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-12 gap-6 opacity-80">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent flex-1"></div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              Ako to funguje
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link href="/activities" className="block h-full">
              <div className="acrylic p-10 hover:bg-white/5 h-full transition-colors group border border-white/10">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Nájdi spoluhráčov
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Pripojte sa k existujúcim aktivitám alebo vytvorte vlastné
                  podujatie a nájdite ľudí s podobnými záujmami.
                </p>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/activities/create" className="block h-full">
              <div className="acrylic p-10 hover:bg-white/5 h-full transition-colors group border border-white/10">
                <div className="text-6xl mb-6">📅</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Organizujte aktivity
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Jednoducho vytvárajte športové podujatia, nastavte čas, miesto
                  a počet účastníkov.
                </p>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/venues" className="block h-full">
              <div className="acrylic p-10 hover:bg-white/5 h-full transition-colors group border border-white/10">
                <div className="text-6xl mb-6">📍</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Aktivity vo vašej lokalite
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Jednoducho nájdite dostupné aktivity vo vašom okolí pomocou
                  interaktívnej mapy.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-lg py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <p className="text-white/40 text-sm">© 2025 SportBuddy.</p>
          </div>

          <div className="flex gap-8 text-sm text-white/50 font-medium">
            <Link href="/about" className="hover:text-white transition-colors">
              O nás
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Kontakt
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Ochrana údajov
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
