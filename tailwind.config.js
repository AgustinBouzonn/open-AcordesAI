/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#FF6B00',
          dark: '#CC5500',
        },
        dark: {
          900: '#121212',
          800: '#1E1E1E',
          700: '#2C2C2C',
          600: '#3A3A3A',
        }
      }
    },
  },
  plugins: [],
}
