"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sk" className="dark">
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Nastala chyba</h1>
          <p className="text-gray-300 mb-6">
            Skúste obnoviť stránku alebo pokračovať na domovskú.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold transition-colors"
            >
              Skúsiť znova
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold transition-colors"
            >
              Domov
            </Link>
          </div>

          {process.env.NODE_ENV !== "production" && error?.message ? (
            <pre className="mt-6 text-left text-xs text-gray-300 bg-black/30 border border-white/10 rounded-lg p-3 overflow-auto">
              {error.message}
            </pre>
          ) : null}
        </div>
      </body>
    </html>
  );
}
