/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
      },
      colors: {
        'gallery-wall': '#faf9f7',
        'gallery-matte': '#f5f4f2',
        'gallery-charcoal': '#2a2522',
        'gallery-muted': '#8a8580',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}
