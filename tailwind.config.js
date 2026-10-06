/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ceylon: {
          950: '#07180D',
          900: '#0B2314',
          850: '#0D2818',
          800: '#0F331D',
          700: '#154A2B',
          600: '#1E683D',
          500: '#2A8B52'
        },
        sage: {
          50: '#F9FAF8',
          100: '#F4F7F4',
          200: '#EBF1EB',
          300: '#D8E2D8',
          400: '#B8CBB8'
        },
        obsidian: {
          900: '#070A12',
          800: '#0B0F19',
          700: '#111726',
          600: '#171E30',
          500: '#1F2840'
        },
        parchment: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5F2EB',
          300: '#EAE5DB'
        },
        espresso: {
          900: '#1C160E',
          800: '#2A2016',
          700: '#3D3123'
        },
        gold: {
          DEFAULT: '#F59E0B',
          hover: '#FBBF24',
          antique: '#C5A059',
          light: '#FDE68A'
        },
        amber: {
          brand: '#F59E0B',
          hover: '#FBBF24',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706'
        }
      },
      ringColor: {
        DEFAULT: '#F59E0B',
        gold: '#F59E0B',
        amber: '#F59E0B',
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
