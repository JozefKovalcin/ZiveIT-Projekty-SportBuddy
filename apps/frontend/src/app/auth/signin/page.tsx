'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Všetky polia sú povinné' });
      setIsLoading(false);
      return;
    }

    try {
      await signIn.email({
        email: formData.email,
        password: formData.password,
      }, {
        onSuccess: () => {
          router.push('/dashboard');
          router.refresh();
        },
        onError: (ctx) => {
          setErrors({ general: ctx.error.message || 'Nesprávny email alebo heslo' });
        },
      });
    } catch (error) {
      setErrors({ general: 'Nastala chyba. Skúste to znova.' });
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
          className="inline-flex items-center gap-2 text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-accent)] transition-colors duration-150 mb-6 group"
        >
          <svg className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[15px] font-medium">Späť na hlavnú stránku</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-xl mb-5" style={{ boxShadow: 'var(--shadow-md)' }}>
            <svg className="w-10 h-10 text-[color:var(--fluent-text-secondary)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="1.5" fill="rgba(250, 250, 250, 0.95)"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[color:var(--fluent-text)] mb-3">
            Vitajte späť!
          </h1>
          <p className="text-lg text-[color:var(--fluent-text-secondary)]">
            Prihláste sa do svojho účtu
          </p>
        </div>

        {/* Form */}
        <div className="acrylic-strong border border-[color:var(--fluent-border)] rounded-xl p-10 reveal-effect transition-all duration-200" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50/80 border-2 border-red-200 rounded-lg text-red-600 text-base font-medium dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-[color:var(--fluent-text)] mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jan.novak@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-[color:var(--fluent-text)] mb-2">
                Heslo
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-base">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-2 border-[color:var(--fluent-border-strong)] rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer hover:border-blue-500"
                />
                <span className="ml-2.5 text-[color:var(--fluent-text-secondary)] font-medium group-hover:text-[color:var(--fluent-text)] transition-colors">Zapamätať si ma</span>
              </label>
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors">
                Zabudli ste heslo?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-[color:var(--fluent-text-secondary)]">
              Nemáte účet?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline">
                Zaregistrujte sa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
