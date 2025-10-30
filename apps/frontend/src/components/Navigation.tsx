'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useSession, signOut } from '@/lib/auth-client';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/', label: 'Domov' },
    { href: '/activities', label: 'Aktivity' },
    { href: '/venues', label: 'Športoviská' },
    { href: '/my-activities', label: 'Moje aktivity' },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto site-nav transition-colors duration-300 acrylic rounded-2xl px-4 sm:px-6 lg:px-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex justify-between items-center h-20 px-2">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <svg className="w-7 h-7 text-[color:var(--fluent-text-secondary)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="1.5" fill="rgba(250, 250, 250, 0.95)"/>
              </svg>
            </div>
            <span className="text-2xl font-semibold text-[color:var(--fluent-text)] hidden sm:block">
              SportBuddy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-6 py-2.5 rounded-md font-medium text-lg
                  hover-glow reveal-effect
                  transition-all duration-200 ease-out
                  ${pathname === link.href
                    ? 'bg-[color:var(--fluent-accent-light)] text-[color:var(--fluent-accent)] font-semibold'
                    : 'text-[color:var(--fluent-text-secondary)] hover:text-[color:var(--fluent-text)]'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover-glow reveal-effect transition-all duration-200"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[color:var(--fluent-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-[color:var(--fluent-text)]">{session.user?.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="fixed left-0 right-0 mt-3 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-50"
                    style={{
                      top: 'calc(3rem + 5rem)', // top-3 + navbar height
                      animation: 'slideDown 0.3s ease-out both'
                    }}
                  >
                    <div className="acrylic-strong border border-[color:var(--fluent-border)] rounded-xl overflow-hidden reveal-effect w-56 ml-auto"
                         style={{
                           boxShadow: 'var(--shadow-xl)'
                         }}>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-base font-medium text-[color:var(--fluent-text)] hover:bg-[color:var(--fluent-surface-secondary)]/50 transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Dashboard</span>
                        </div>
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-base font-medium text-[color:var(--fluent-text)] hover:bg-[color:var(--fluent-surface-secondary)]/50 transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profil</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Odhlásiť sa</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-6 py-2.5 text-lg font-semibold bg-blue-50/50 text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/60 rounded-lg hover-glow reveal-effect transition-all duration-200"
                  style={{
                    boxShadow: 'var(--shadow-sm)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  Prihlásiť sa
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2.5 text-lg bg-[color:var(--fluent-accent)]/90 text-[color:var(--fluent-text-secondary)] dark:text-[color:var(--fluent-text)] rounded-lg font-semibold hover:bg-[color:var(--fluent-accent-hover)] hover-glow reveal-effect transition-all duration-200"
                  style={{
                    boxShadow: 'var(--shadow-sm)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  Registrovať
                </Link>
              </>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-[color:var(--fluent-surface-secondary)] transition-all duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
                <span
                  className={`block w-6 h-0.5 bg-[color:var(--fluent-text)] transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-[color:var(--fluent-text)] transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-[color:var(--fluent-text)] transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-[color:var(--fluent-divider)] ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="pb-3 pt-2 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  block px-4 py-3 rounded-md font-medium text-base
                  transition-all duration-150
                  ${pathname === link.href
                    ? 'bg-[color:var(--fluent-accent-light)] text-[color:var(--fluent-accent)]'
                    : 'text-[color:var(--fluent-text-secondary)] hover:bg-[color:var(--fluent-surface-secondary)] hover:text-[color:var(--fluent-text)]'
                  }
                `}
                style={{
                  animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${index * 0.08}s both` : 'none'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[color:var(--fluent-divider)] space-y-3 mt-3">
              {session ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[color:var(--fluent-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-[color:var(--fluent-text)]">{session.user?.name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-base font-semibold bg-blue-50/50 text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/60 rounded-lg hover-glow reveal-effect transition-all duration-200"
                    style={{
                      boxShadow: 'var(--shadow-sm)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${navLinks.length * 0.08 + 0.08}s both` : 'none'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-base font-semibold bg-blue-50/50 text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/60 rounded-lg hover-glow reveal-effect transition-all duration-200"
                    style={{
                      boxShadow: 'var(--shadow-sm)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${navLinks.length * 0.08 + 0.12}s both` : 'none'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full block px-4 py-3 text-base text-left font-semibold text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg hover-glow reveal-effect transition-all duration-200"
                    style={{
                      boxShadow: 'var(--shadow-sm)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${navLinks.length * 0.08 + 0.20}s both` : 'none'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Odhlásiť sa</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-4 py-3 text-base font-semibold bg-blue-50/50 text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/60 rounded-lg hover-glow reveal-effect transition-all duration-200 text-center"
                    style={{
                      boxShadow: 'var(--shadow-sm)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${navLinks.length * 0.08 + 0.08}s both` : 'none'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Prihlásiť sa
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-3 text-base bg-[color:var(--fluent-accent)]/90 text-[color:var(--fluent-text-secondary)] dark:text-[color:var(--fluent-text)] rounded-lg text-center font-semibold hover:bg-[color:var(--fluent-accent-hover)] hover-glow reveal-effect transition-all duration-200"
                    style={{
                      boxShadow: 'var(--shadow-sm)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      animation: isMobileMenuOpen ? `slideDown 0.4s ease-out ${navLinks.length * 0.08 + 0.16}s both` : 'none'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrovať
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
