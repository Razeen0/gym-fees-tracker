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
        // Electric lime — the gym accent
        accent: {
          50:  '#f7fde8',
          100: '#edfac5',
          200: '#d9f591',
          300: '#c8f135',   // PRIMARY ACCENT
          400: '#b8e020',
          500: '#9bc918',
          600: '#79a012',
          700: '#5b7a0e',
          800: '#3e5309',
          900: '#243006',
          950: '#111800',
        },
        // Obsidian dark scale
        zinc: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#888888',
          500: '#666666',
          600: '#444444',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#111111',
          950: '#0a0a0a',
        },
        // Keep dark alias for backward-compat
        dark: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#888888',
          500: '#666666',
          600: '#444444',
          700: '#2a2a2a',
          800: '#1a1a1a',
          900: '#111111',
          950: '#0a0a0a',
        },
        // Map old primary → accent for existing components
        primary: {
          50:  '#f7fde8',
          100: '#edfac5',
          200: '#d9f591',
          300: '#c8f135',
          400: '#b8e020',
          500: '#9bc918',
          600: '#c8f135',  // main CTA maps to lime
          700: '#b8e020',
          800: '#9bc918',
          900: '#79a012',
          950: '#243006',
        },
      },
      fontFamily: {
        display: ['Barlow', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'slide-left':  'slideLeft 0.3s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideLeft: {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 241, 53, 0)' },
          '50%':       { boxShadow: '0 0 20px 4px rgba(200, 241, 53, 0.15)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
