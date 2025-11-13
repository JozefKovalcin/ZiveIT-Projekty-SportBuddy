'use client';

import { useState } from 'react';
import { signUp, signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Meno je povinné';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Meno musí mať aspoň 2 znaky';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email je povinný';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Heslo je povinné';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Heslo musí mať aspoň 8 znakov';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Heslo musí obsahovať malé písmeno';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Heslo musí obsahovať veľké písmeno';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Heslo musí obsahovať číslo';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Heslá sa nezhodujú';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Register user with Better Auth
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }, {
        onSuccess: async () => {
          // Auto sign in after registration
          await signIn.email({
            email: formData.email,
            password: formData.password,
          }, {
            onSuccess: () => {
              router.push('/dashboard');
              router.refresh();
            },
            onError: () => {
              // Registration successful but login failed
              router.push('/auth/signin?registered=true');
            },
          });
        },
        onError: (ctx) => {
          setErrors({ general: ctx.error.message || 'Registrácia zlyhala' });
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
            Vytvorte si účet
          </h1>
          <p className="text-lg text-[color:var(--fluent-text-secondary)]">
            Pripojte sa k športovej komunite
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
              <label htmlFor="name" className="block text-base font-semibold text-[color:var(--fluent-text)] mb-2">
                Meno
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ján Novák"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.name}</p>
              )}
            </div>

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
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
              )}
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
                className={errors.password ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
              )}
              <p className="mt-2 text-sm text-[color:var(--fluent-text-tertiary)]">
                Min. 8 znakov, veľké písmeno, malé písmeno a číslo
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-base font-semibold text-[color:var(--fluent-text)] mb-2">
                Potvrďte heslo
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Vytváram účet...' : 'Vytvoriť účet'}
            </Button>
          </form>

          {/* OAuth Divider */}
          <div className="mt-8 mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[color:var(--fluent-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[color:var(--fluent-card-background)] text-[color:var(--fluent-text-secondary)] font-medium">
                  Alebo sa zaregistrujte pomocou
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
                  provider: 'google',
                  callbackURL: 'http://localhost:3000/dashboard',
                });
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-[color:var(--fluent-border-strong)] rounded-lg font-semibold text-base text-[color:var(--fluent-text)] hover:bg-[color:var(--fluent-subtle)] hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Pokračovať s Google
            </button>

            <button
              type="button"
              onClick={async () => {
                await signIn.social({
                  provider: 'facebook',
                  callbackURL: 'http://localhost:3000/dashboard',
                });
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-[color:var(--fluent-border-strong)] rounded-lg font-semibold text-base text-[color:var(--fluent-text)] hover:bg-[color:var(--fluent-subtle)] hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Pokračovať s Facebook
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-base text-[color:var(--fluent-text-secondary)]">
              Už máte účet?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline">
                Prihláste sa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
