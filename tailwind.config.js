/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fondo beige (tema claro premium)
        sand: {
          50: '#FBF8F2',
          100: '#F5EFE6',
          200: '#EDE4D3',
          300: '#E1D4BC',
          400: '#D2BF9E',
          500: '#C0A87E',
        },
        // Acento verde oscuro
        forest: {
          50: '#EAF1ED',
          100: '#CDDED4',
          200: '#9FBFAE',
          300: '#6E9A82',
          400: '#46715B',
          500: '#2F4A3C',
          600: '#263D31',
          700: '#1E3A2B',
          800: '#162C20',
          900: '#0F1E16',
        },
        // Texto carbón
        ink: {
          DEFAULT: '#26241F',
          soft: '#4A463E',
          muted: '#7A746A',
        },
        clay: {
          // acento cálido secundario (terracota suave para alertas/CTA secundarios)
          400: '#C97B5A',
          500: '#B5653F',
        },
      },
      spacing: {
        4.5: '1.125rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(38, 36, 31, 0.06)',
        card: '0 8px 30px rgba(38, 36, 31, 0.08)',
        lift: '0 16px 40px rgba(38, 36, 31, 0.14)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}
