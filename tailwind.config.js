/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-body)'],
        body:  ['var(--font-body)'],
        sans:  ['var(--font-body)'],
      },
      fontSize: {
        'xs':   ['var(--fs-xs, 12px)',   { lineHeight: '1.5' }],
        'sm':   ['var(--fs-sm, 14px)',   { lineHeight: '1.55' }],
        'base': ['var(--fs-base, 16px)', { lineHeight: '1.75' }],
        'lg':   ['var(--fs-lg, 19px)',   { lineHeight: '1.4' }],
        'xl':   ['var(--fs-xl, 23px)',   { lineHeight: '1.3' }],
      },
      borderRadius: {
        'none': '0',
        'sm':   'var(--radius, 3px)',
        DEFAULT:'calc(var(--radius, 3px) * 2)',
        'md':   'calc(var(--radius, 3px) * 3)',
        'lg':   'calc(var(--radius, 3px) * 4)',
        'full': '9999px',
      },
      colors: {
        paper:  { DEFAULT: 'var(--color-paper)', warm: 'var(--color-paper-warm)', border: 'var(--color-paper-border)', card: 'var(--color-paper-card)' },
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
