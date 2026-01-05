// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.1', fontWeight: '900' }],
        'display-lg': ['48px', { lineHeight: '1.1', fontWeight: '900' }],
        'h1': ['40px', { lineHeight: '1.2', fontWeight: '800' }],
        'h2': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-xl': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'btn-lg': ['16px', { lineHeight: '1', fontWeight: '700' }],
        'btn-md': ['14px', { lineHeight: '1', fontWeight: '600' }],
        'btn-sm': ['12px', { lineHeight: '1', fontWeight: '600' }],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(236, 72, 153, 0.1)',
        'soft-md': '0 4px 16px rgba(236, 72, 153, 0.15)',
        'soft-lg': '0 8px 24px rgba(236, 72, 153, 0.2)',
        'pink-sm': '0 4px 12px rgba(244, 114, 182, 0.3)',
        'pink-md': '0 8px 20px rgba(244, 114, 182, 0.4)',
        'purple-sm': '0 4px 12px rgba(192, 132, 252, 0.3)',
        'purple-md': '0 8px 20px rgba(192, 132, 252, 0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}