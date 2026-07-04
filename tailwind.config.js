/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: '#07111f',
        ink: '#0b1220',
        electric: '#1369ff',
        skyglow: '#38bdf8',
        promo: '#f59e0b',
        surface: {
          DEFAULT: '#f8fafc',
          dark: '#0d1117',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#161b22',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#30363d',
        },
      },
      boxShadow: {
        premium: '0 22px 70px rgba(2, 8, 23, 0.14)',
        soft: '0 14px 40px rgba(15, 23, 42, 0.08)',
        glow: '0 0 20px rgba(19, 105, 255, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
