/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // Habilitamos modo oscuro manual por si acaso
  theme: {
    extend: {
      colors: {
        primary: '#135bec', // Azul eléctrico para acciones principales (botones)

        mako: {
          50: '#f5f6f6',
          100: '#e4e6e9',
          200: '#cdd2d4',
          300: '#a9b1b7',
          400: '#7f8991',
          500: '#646e76',
          600: '#555d65',
          700: '#494e55',
          800: '#42464b',
          900: '#393c40',
          950: '#232529', // fondo principal oscuro
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
