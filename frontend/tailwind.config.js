/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d7ecff',
          200: '#b5dcff',
          300: '#83c6ff',
          400: '#49a8ff',
          500: '#1d84ff',
          600: '#0a67df',
          700: '#0a53b5',
          800: '#0f498f',
          900: '#143f73'
        }
      }
    }
  },
  plugins: []
};
