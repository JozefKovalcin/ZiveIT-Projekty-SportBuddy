"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import NotificationBell from "./NotificationBell";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // iOS 26 style - detect scroll to adjust navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Domov" },
    { href: "/activities", label: "Aktivity" },
    { href: "/venues", label: "Mapa aktivít" },
  ];

  // Conditionally add "Moje aktivity" only if user is logged in
  const displayNavLinks = session
    ? [...navLinks, { href: "/my-activities", label: "Moje aktivity" }]
    : navLinks;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    // Fixed position, centered, full width minus padding
    <div className="fixed top-3 sm:top-6 left-2 right-2 sm:left-4 sm:right-4 z-50 flex justify-center pointer-events-none">
      <nav
        className={`pointer-events-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between w-full max-w-7xl transition-all duration-300 rounded-2xl sm:rounded-full border nav-capsule overflow-visible ${
          scrolled
            ? "backdrop-blur-2xl border-white/20 shadow-2xl nav-scrolled"
            : ""
        }`}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 sm:gap-4 group shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-white/10">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
            </svg>
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            SportBuddy
          </span>
        </Link>

        {/* DESKTOP LINKY */}
        <div className="hidden lg:flex items-center gap-4">
          {displayNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-6 py-3 rounded-full text-xl font-semibold transition-all duration-200
                ${
                  pathname === link.href
                    ? "bg-white/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* PRAVÁ STRANA */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          {session ? (
            <>
              <div className="hidden sm:block">
                <NotificationBell scrolled={scrolled} />
              </div>
              <div className="hidden lg:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-emerald-500/50 p-[2px] cursor-pointer hover:scale-105 transition-transform bg-black/50 flex items-center justify-center overflow-hidden group"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-900 flex items-center justify-center text-emerald-200 font-bold text-lg sm:text-xl group-hover:bg-emerald-800 transition-colors">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className={`absolute right-0 mt-4 w-80 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50 border transition-all duration-300
                       ${scrolled 
                         ? "bg-[#021a14]/90 backdrop-blur-2xl border-emerald-500/30 shadow-2xl" 
                         : "bg-black/40 backdrop-blur-xl border-white/10 shadow-xl"}`}>
                    <div className={`px-6 py-5 border-b ${scrolled ? "border-emerald-500/20 bg-emerald-900/20" : "border-white/10 bg-white/5"}`}>
                      <p className="text-white font-bold text-xl truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-emerald-400 text-sm truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="p-3 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 font-medium transition-colors flex items-center gap-3"
                      >
                        <span className="text-xl">👤</span> Môj Profil
                      </Link>
                      <Link
                        href="/my-activities"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 font-medium transition-colors flex items-center gap-3"
                      >
                        <span className="text-xl">🏆</span> Moje Aktivity
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 text-gray-200 font-medium transition-colors flex items-center gap-3"
                      >
                        <span className="text-xl">📊</span> Dashboard
                      </Link>
                      <div className="h-px bg-white/10 my-2 mx-2"></div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center gap-3"
                      >
                        <span className="text-xl">🚪</span> Odhlásiť sa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/signup">
                <button className="px-6 lg:px-8 py-2.5 lg:py-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold text-base lg:text-lg transition-all backdrop-blur-md shadow-lg hover:shadow-emerald-500/20">
                  Registrovať
                </button>
              </Link>
              <Link href="/auth/signin">
                <button className="px-6 lg:px-10 py-2.5 lg:py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-base lg:text-lg transition-all backdrop-blur-md shadow-lg">
                  Prihlásiť
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 sm:p-3 rounded-full hover:bg-white/10 text-white"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 rounded-2xl p-4 sm:p-6 pointer-events-auto animate-in fade-in slide-in-from-top-5 duration-200 lg:hidden z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex flex-col gap-3 sm:gap-4">
            {displayNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold text-center ${
                  pathname === link.href
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {session ? (
              <>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-center py-2">
                  <NotificationBell scrolled={scrolled} />
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold text-center text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-center gap-3"
                >
                  <span className="text-xl">👤</span> Môj Profil
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold text-center text-gray-300 hover:bg-white/5 hover:text-white flex items-center justify-center gap-3"
                >
                  <span className="text-xl">📊</span> Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold text-center bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🚪</span> Odhlásiť sa
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-white/10 my-2"></div>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-center"
                >
                  Registrovať
                </Link>
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold bg-white/10 text-white border border-white/10 text-center"
                >
                  Prihlásiť sa
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
