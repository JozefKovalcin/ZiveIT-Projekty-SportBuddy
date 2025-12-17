"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({ general: "Všetky polia sú povinné" });
      setIsLoading(false);
      return;
    }

    try {
      await signIn.email(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            setErrors({
              general: ctx.error.message || "Nesprávny email alebo heslo",
            });
          },
        }
      );
    } catch (error) {
      setErrors({ general: "Nastala chyba. Skúste to znova." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors duration-150 mb-6 group"
        >
          <svg
            className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-[15px] font-medium">
            Späť na hlavnú stránku
          </span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl mb-5 shadow-lg shadow-emerald-900/30">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="7" r="1.5" fill="rgba(250, 250, 250, 0.95)" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Vitajte späť!</h1>
          <p className="text-lg text-gray-300">Prihláste sa do svojho účtu</p>
        </div>

        {/* Form */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-10 transition-all duration-200 shadow-xl">
          {errors.general && (
            <div
              className="mb-6 p-4 rounded-2xl text-red-400 text-[15px] font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-white mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jan.novak@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-white mb-2"
              >
                Heslo
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-base">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-emerald-600 border-2 border-white/20 rounded-full focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer hover:border-emerald-500 bg-transparent"
                />
                <span className="ml-2.5 text-gray-300 font-medium group-hover:text-white transition-colors">
                  Zapamätať si ma
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-colors"
              >
                Zabudli ste heslo?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full !rounded-2xl"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Prihlasovanie..." : "Prihlásiť sa"}
            </Button>
          </form>

          {/* OAuth Divider */}
          <div className="mt-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-300 font-medium">
                  Alebo sa prihláste pomocou
                </span>
              </div>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                await signIn.social({
                  provider: "google",
                  callbackURL: "http://localhost:3000/dashboard",
                });
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-[15px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Pokračovať s Google
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-300">
              Nemáte účet?{" "}
              <Link
                href="/auth/signup"
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Zaregistrujte sa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
