/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0F',
        surface: '#15151D',
        surfaceHighlight: '#1E1E28',
        primary: '#8A2BE2', // Vibrant Purple
        secondary: '#5865F2', // Discord Blue
        accent: '#D946EF', // Fuchsia
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(138, 43, 226, 0.5)',
      },
      backdropBlur: {
        glass: '10px',
      }
    },
  },
  plugins: [],
}
