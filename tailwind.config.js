/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', '"Noto Serif KR"', 'serif'],
        body: ['"Noto Serif KR"', 'serif'],
        sans: ['"Noto Sans KR"', 'sans-serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#f9f6f1',
          warm: '#f4efe6',
          border: '#e2dbd0',
        },
        ink: {
          DEFAULT: '#1a1714',
          muted: '#5c574f',
          faint: '#a09890',
        },
        accent: {
          DEFAULT: '#8b5e3c',
          light: '#c49a6c',
          pale: '#f0e6d8',
        },
      },
      animation: {
        'fade-slide': 'fadeSlide 0.4s ease-out',
      },
      keyframes: {
        fadeSlide: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
