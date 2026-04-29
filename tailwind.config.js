/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
      },
      baseFontSize: {
        light: '300',
      },
      colors: {
        'muted-white': '#F5F1EB',
        'muted-light': '#E8E3DB',
        'muted-grey':  '#D4CEC6',
        'muted-dark':  '#2A2522',
        'warm-cream':  '#F5F1EB',
        'warm-beige':  '#E8E3DB',
        'warm-taupe':  '#D4CEC6',
      },
    },
  },
  plugins: [],
}