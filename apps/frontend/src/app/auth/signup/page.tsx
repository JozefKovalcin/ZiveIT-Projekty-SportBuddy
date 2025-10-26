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
