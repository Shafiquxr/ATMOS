/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nostalgic: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        'mono': ['Courier New', 'Courier', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'retro-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'retro-lg': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
