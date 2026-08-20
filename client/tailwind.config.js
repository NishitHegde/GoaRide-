/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#fdfbf7',
          100: '#f7f3eb',
          200: '#efe8d8',
          300: '#e2d5c0',
          400: '#cfbca2',
          500: '#b89f81',
          600: '#9d8164',
          700: '#7f664e',
          800: '#675242',
          900: '#544438',
        },
        goa: {
          bg: '#f5f2eb',
          card: '#ffffff',
          border: '#e6dfd3',
          accent: '#0284c7',
          orange: '#ea580c',
          teal: '#0d9488',
        },
      },
    },
  },
  plugins: [],
};
