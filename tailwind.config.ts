import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(14, 165, 233, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(14, 165, 233, 0.2)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#0ea5e9',
          'primary-content': '#ffffff',
          'secondary': '#14b8a6',
          'secondary-content': '#ffffff',
          'accent': '#6366f1',
          'accent-content': '#ffffff',
          'neutral': '#334155',
          'neutral-content': '#f8fafc',
          'base-100': '#fafbfc',
          'base-200': '#f1f5f9',
          'base-300': '#e2e8f0',
          'base-content': '#0f172a',
          'info': '#3b82f6',
          'info-content': '#ffffff',
          'success': '#22c55e',
          'success-content': '#ffffff',
          'warning': '#f59e0b',
          'warning-content': '#1f2937',
          'error': '#ef4444',
          'error-content': '#ffffff',
        },
      },
      {
        dark: {
          'primary': '#38bdf8',
          'primary-content': '#021526',
          'secondary': '#2dd4bf',
          'secondary-content': '#042f2e',
          'accent': '#818cf8',
          'accent-content': '#1e1b4b',
          'neutral': '#1e293b',
          'neutral-content': '#e2e8f0',
          'base-100': '#0a0f1a',
          'base-200': '#111827',
          'base-300': '#1e293b',
          'base-content': '#f1f5f9',
          'info': '#60a5fa',
          'info-content': '#1e3a5f',
          'success': '#34d399',
          'success-content': '#064e3b',
          'warning': '#fbbf24',
          'warning-content': '#451a03',
          'error': '#fb7185',
          'error-content': '#4c0519',
        },
      },
    ],
    darkTheme: 'dark',
  },
}
export default config
