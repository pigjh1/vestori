/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)'],
        body:  ['var(--font-body)'],
        sans:  ['"Noto Sans KR"', 'sans-serif'],
      },
      colors: {
        paper:  { DEFAULT: 'var(--color-paper)', warm: 'var(--color-paper-warm)', border: 'var(--color-paper-border)' },
        ink:    { DEFAULT: 'var(--color-ink)', muted: 'var(--color-ink-muted)', faint: 'var(--color-ink-faint)' },
        accent: { DEFAULT: 'var(--color-accent)', light: 'var(--color-accent-light)', pale: 'var(--color-accent-pale)' },
      },
      animation: { 'fade-slide': 'fadeSlide 0.35s ease-out' },
      keyframes: {
        fadeSlide: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
