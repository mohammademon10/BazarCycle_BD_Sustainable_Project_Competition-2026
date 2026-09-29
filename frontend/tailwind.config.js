/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4ede4',
          200: '#e8dcce',
          300: '#d6c0ab',
          400: '#bf9f82',
          500: '#a7815f',
          600: '#926a4c',
          700: '#77523d',
          800: '#624436',
          900: '#523a30',
        },
        bazar: {
          gold: '#eab308',
          amber: '#f59e0b',
          emerald: '#10b981',
          teal: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
