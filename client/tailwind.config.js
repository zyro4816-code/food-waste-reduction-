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
        saveplate: {
          black: '#050705',
          darkest: '#030503',
          forest: '#123524',
          deep: '#071A11',
          neon: '#39FF14',
          'neon-glow': 'rgba(57, 255, 20, 0.35)',
          cream: '#F4F0E6',
          muted: '#A6AEA8',
          card: 'rgba(18, 53, 36, 0.35)',
          glass: 'rgba(7, 26, 17, 0.75)',
          border: 'rgba(57, 255, 20, 0.18)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 25px rgba(57, 255, 20, 0.25)',
        'neon-strong': '0 0 40px rgba(57, 255, 20, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

