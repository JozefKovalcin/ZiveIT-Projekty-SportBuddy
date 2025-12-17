"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Chýbajúci reset token. Prosím, požiadaj o nový reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Heslá sa nezhodujú");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Heslo musí mať minimálne 8 znakov");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri resete hesla");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-5xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Neplatný link
                </h3>
                <p className="text-gray-300 mb-6">
                  Tento reset link je neplatný alebo expiroval.
                </p>
                <Link href="/auth/forgot-password">
                  <Button variant="primary">Požiadať o nový link</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔑</div>
              <CardTitle className="text-3xl">Nové heslo</CardTitle>
              <p className="text-gray-300 mt-2">Zadaj svoje nové heslo</p>
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-semibold text-green-600 mb-1">
                        Heslo zmenené!
                      </h3>
                      <p className="text-sm text-gray-300">
                        Tvoje heslo bolo úspešne zmenené. Budeš presmerovaný na
                        prihlasovaciu stránku...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div
                    className="p-4 rounded-2xl text-red-500"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Nové heslo *
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimálne 8 znakov"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Potvrdenie hesla *
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Zopakuj heslo"
                    required
                    minLength={8}
                  />
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <p className="text-sm text-gray-300">
                    <strong>💡 Tip:</strong> Použite silné heslo s kombináciou
                    písmen, čísiel a špeciálnych znakov.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Ukladá sa..." : "🔒 Zmeniť heslo"}
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
      </div>
    </div>
  );
}
