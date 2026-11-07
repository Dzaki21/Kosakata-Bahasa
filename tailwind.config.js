/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0e8ce4',
          600: '#026fc3',
          700: '#03589e',
          800: '#074a82',
          900: '#0c3f6d',
          950: '#082848',
        },
        der: '#3b82f6', // blue for der (masculine)
        die: '#ec4899', // pink/rose for die (feminine)
        das: '#10b981', // green/emerald for das (neuter)
        plural: '#8b5cf6', // purple for plurals
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

