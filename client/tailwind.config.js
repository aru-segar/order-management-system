/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],       // For body text
        heading: ['Poppins', 'sans-serif'],  // For headings
      },
      colors: {
        burgundy: '#872341',                 // Primary burgundy
        ivory: '#FDFDFD',                    // Clean white-ish background
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.25)',  // Glassmorphism white base
      },
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.2)',
      },
      backdropBlur: {
        glass: '12px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(135, 35, 65, 0.4)' },
          '50%': { boxShadow: '0 0 15px 8px rgba(135, 35, 65, 0.3)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        zoomIn: 'zoomIn 0.4s ease-out',
        pulseGlow: 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
};
