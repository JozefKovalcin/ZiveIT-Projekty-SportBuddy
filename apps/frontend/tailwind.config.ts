import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        // Modern Glassmorphism colors
        'fluent-bg': '#f3f3f3',
        'fluent-surface': '#ffffff',
        'fluent-accent': '#0078d4',
        'fluent-accent-dark': '#005a9e',
        'fluent-text': '#323130',
        'fluent-text-secondary': '#605e5c',
        'fluent-border': '#e1dfdd',
      },
      backdropBlur: {
        'fluent': '40px',
        'xl': '24px',
      },
      boxShadow: {
        'fluent': '0 8px 16px rgba(0, 0, 0, 0.14)',
        'fluent-hover': '0 16px 32px rgba(0, 0, 0, 0.18)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'fluent': '8px',
        'fluent-lg': '12px',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-from-top': 'slideInFromTop 0.3s ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromTop: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};
export default config;
