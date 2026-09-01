/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#0F172A', light: '#1E293B', lighter: '#334155' },
        surface: { DEFAULT: '#F8FAFC', paper: '#FFFFFF' },
        accent: { emerald: '#10B981', crimson: '#EF4444' },
      },
      boxShadow: {
        float: '0 8px 30px rgb(0 0 0 / 0.04)',
        floatlg: '0 24px 60px -12px rgb(15 23 42 / 0.25)',
      },
      keyframes: {
        scan: { '0%': { top: '0%', opacity: '0' }, '10%': { opacity: '1' }, '90%': { opacity: '1' }, '100%': { top: '100%', opacity: '0' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgb(239 68 68 / 0.55)' }, '70%': { boxShadow: '0 0 0 14px rgb(239 68 68 / 0)' }, '100%': { boxShadow: '0 0 0 0 rgb(239 68 68 / 0)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.45)' }, '50%': { boxShadow: '0 0 24px 4px rgb(16 185 129 / 0.5)' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        scan: 'scan 1.6s ease-in-out forwards',
        pulseRing: 'pulseRing 1.6s ease-out infinite',
        glowPulse: 'glowPulse 2.2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
