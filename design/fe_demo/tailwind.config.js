/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#faf7f2',
        surface: '#f4efe6',
        pureWhite: '#ffffff',
        navy: '#0e2238',
        ochre: '#d99726',
        terracotta: '#bf5431',
        moss: '#264e41',
        ash: '#e6dfd3',
        ink: '#182230',
        graphite: '#3e4c59',
        muted: '#6b7a88',
        heart: '#e11d48'
      },
      fontFamily: {
        serif: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], // Replaced Playfair Display with crisp modern display
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
