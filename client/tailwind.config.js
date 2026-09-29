/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3fa',
          100: '#b3d9f0',
          200: '#80bfe6',
          300: '#4da5dc',
          400: '#1a8bd2',
          500: '#0077B6',
          600: '#005f92',
          700: '#00476e',
          800: '#002f4a',
          900: '#001726',
        },
        emergency: {
          50: '#fce8ea',
          100: '#f7b9bf',
          200: '#f28a94',
          300: '#ed5b69',
          400: '#e83c4e',
          500: '#E63946',
          600: '#b82e38',
          700: '#8a222a',
          800: '#5c171c',
          900: '#2e0b0e',
        },
        trust: {
          50: '#e9f5f3',
          100: '#bce3dc',
          200: '#8fd1c5',
          300: '#62bfae',
          400: '#35ad97',
          500: '#2A9D8F',
          600: '#227e72',
          700: '#195e56',
          800: '#113f39',
          900: '#081f1d',
        },
        dark: {
          800: '#1a1d23',
          900: '#0f1117',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(230, 57, 70, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(230, 57, 70, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
