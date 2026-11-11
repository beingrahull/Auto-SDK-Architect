/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        american: {
          red: '#D92D20',
          darkred: '#991B1B',
          navy: '#0A192F',
          blue: '#175CD3',
          cream: '#FAFAF9',
          border: '#E2E8F0',
          amber: '#D97706',
          emerald: '#059669',
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(15, 23, 42, 1)',
        'brutal-sm': '2px 2px 0px 0px rgba(15, 23, 42, 1)',
        'brutal-lg': '6px 6px 0px 0px rgba(15, 23, 42, 1)',
        'brutal-active': '1px 1px 0px 0px rgba(15, 23, 42, 1)',
      }
    },
  },
  plugins: [],
}
