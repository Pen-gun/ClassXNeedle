/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        brand: {
          50: '#f5f6ff',
          100: '#e6e8ff',
          200: '#cfd2ff',
          300: '#b5b9ff',
          400: '#8f96ff',
          500: '#6d74ff',
          600: '#4c55f3',
          700: '#333dd1',
          800: '#262ea6',
          900: '#202a7d'
        }
      },
      boxShadow: {
        card: '0 20px 60px rgba(0,0,0,0.22)'
      }
    }
  },
  plugins: []
};
