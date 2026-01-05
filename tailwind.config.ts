
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FFF5FA',
          100: '#FFE4F2',
          200: '#FFC9E5',
          300: '#FF9ECE',
          400: '#FF78C4',
          500: '#FF47B0',
        },
        purple: {
          600: '#9333ea',
        }
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(255, 120, 196, 0.2)',
      }
    },
  },
  plugins: [],
} satisfies Config
