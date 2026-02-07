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
        heading: ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif'],
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
          'accent': '#f59e0b',
          'accent-content': '#1f2937',
          'neutral': '#374151',
          'neutral-content': '#f3f4f6',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'base-content': '#1f2937',
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
          'primary': '#0ea5e9',
          'primary-content': '#0c1a2e',
          'secondary': '#2dd4bf',
          'secondary-content': '#0c1a2e',
          'accent': '#f59e0b',
          'accent-content': '#0c1a2e',
          'neutral': '#1e2a3a',
          'neutral-content': '#e2e8f0',
          'base-100': '#0f1523',
          'base-200': '#161d2e',
          'base-300': '#1e2738',
          'base-content': '#e2e8f0',
          'info': '#3b82f6',
          'info-content': '#e2e8f0',
          'success': '#22c55e',
          'success-content': '#0c1a2e',
          'warning': '#f59e0b',
          'warning-content': '#0c1a2e',
          'error': '#ef4444',
          'error-content': '#e2e8f0',
        },
      },
    ],
    darkTheme: 'dark',
  },
}
export default config
