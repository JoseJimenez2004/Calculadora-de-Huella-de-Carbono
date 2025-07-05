/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0f7f4',
          100: '#e0f2e9',
          200: '#c8e6c9',
          300: '#a8d8b9',
          400: '#7ccba2',
          500: '#3aa76d',
          600: '#2e8b57',
          700: '#256f47',
          800: '#1d5738',
          900: '#16452e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}