import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ice: {
          900: "#064e3b", // Emerald 900
          800: "#065f46", // Emerald 800
          600: "#10b981", // Emerald 500
        },
        // Override fluent colors to match new theme
        "fluent-text": "#ffffff",
        "fluent-text-secondary": "#9ca3af", // Gray 400
        "fluent-accent": "#10b981", // Emerald primary
        "fluent-accent-hover": "#059669", // Emerald 600
        "fluent-surface": "rgba(20, 20, 20, 0.6)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
      },
      backdropBlur: {
        fluent: "40px",
        xl: "24px",
      },
      boxShadow: {
        fluent: "0 8px 16px rgba(0, 0, 0, 0.14)",
        "fluent-hover": "0 16px 32px rgba(0, 0, 0, 0.18)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      borderRadius: {
        fluent: "8px",
        "fluent-lg": "12px",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in-from-top": "slideInFromTop 0.3s ease-out",
        "slide-in-from-bottom": "slideInFromBottom 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      scale: {
        "102": "1.02",
      },
    },
  },
  plugins: [],
};
export default config;
