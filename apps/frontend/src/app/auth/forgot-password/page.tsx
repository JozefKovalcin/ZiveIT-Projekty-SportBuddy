"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri odosielaní emailu");
      }

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <CardTitle className="text-3xl">Zabudnuté heslo?</CardTitle>
              <p className="text-gray-300 mt-2">
                Žiadny problém! Zadaj svoj email a pošleme ti link na reset
                hesla.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-semibold text-green-600 mb-1">
                        Email odoslaný!
                      </h3>
                      <p className="text-sm text-gray-300">
                        Ak email existuje v našej databáze, poslali sme ti
                        inštrukcie na reset hesla. Skontroluj si emailovú
                        schránku.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>💡 Tip:</strong> Nezabudni skontrolovať aj SPAM
                    priečinok. Link je platný iba 1 hodinu.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Link href="/auth/signin">
                    <Button variant="secondary" className="w-full">
                      ← Späť na prihlásenie
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvoj@email.sk"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Zadaj email, ktorý si použil pri registrácii
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Odosiela sa..." : "📧 Odoslať reset link"}
                </Button>

                <div className="text-center pt-4">
                  <Link href="/auth/signin">
                    <Button variant="secondary" className="w-full">
                      ← Späť na prihlásenie
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Nemáš ešte účet?{" "}
            <Link
              href="/auth/signup"
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
            >
              Zaregistruj sa
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
