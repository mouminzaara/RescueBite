/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FAF4EB',
          100: '#F5EBDD',
          200: '#EAD9C4',
          300: '#DEC4A9',
          400: '#CFAD8C',
        },
        forest: {
          50: '#F2F7F4',
          100: '#DDE8D8',
          200: '#B8D1C3',
          500: '#407B61',
          600: '#285C46',
          700: '#1E4736',
          800: '#153327',
          900: '#0C1F17',
        },
        sage: {
          50: '#F4F7F4',
          100: '#DDE8D8',
          300: '#A3BCA8',
          500: '#78977D',
          700: '#526D57',
        },
        charcoal: {
          50: '#F4F6F5',
          100: '#E3E7E4',
          500: '#5C6A62',
          700: '#2E3933',
          900: '#1C2A23',
        },
        sand: {
          100: '#F3EADB',
          200: '#E6D9C5',
          300: '#D6C4AC',
        }
      }
    },
  },
  plugins: [],
}
