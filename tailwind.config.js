/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ignis Tactical Intelligence palette
        'surface': '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#3a3939',
        'surface-lowest': '#0e0e0e',
        'surface-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-high': '#2a2a2a',
        'surface-highest': '#353534',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#e4beb1',
        'outline': '#ab897d',
        'outline-variant': '#5b4137',
        'primary': '#ffb59a',
        'primary-container': '#ff5c00',
        'on-primary': '#5a1b00',
        'secondary': '#aec6ff',
        'secondary-container': '#508eff',
        'tertiary': '#a0c9ff',
        'tertiary-container': '#0096fd',
        'fire-orange': '#FF5C00',
        'fire-amber': '#FF8C00',
        'fire-red': '#FF2D00',
        'ember': '#FFB59A',
        'smoke': '#6B6560',
        'ash': '#3A3939',
      },
      fontFamily: {
        'display': ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'label-mono': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
      animation: {
        'pulse-fire': 'pulse-fire 2s ease-in-out infinite',
        'ember-float': 'ember-float 3s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'score-fill': 'score-fill 1.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'blink': 'blink 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-fire': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'ember-float': {
          '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-120px) rotate(360deg)', opacity: '0' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0.4' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'score-fill': {
          '0%': { 'stroke-dashoffset': '339.3' },
          '100%': { 'stroke-dashoffset': 'var(--target-offset)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-strong': '50px',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(135deg, #FF5C00 0%, #FF8C00 50%, #FFB59A 100%)',
        'fire-radial': 'radial-gradient(ellipse at center, rgba(255,92,0,0.3) 0%, transparent 70%)',
        'smoke-gradient': 'linear-gradient(180deg, rgba(19,19,19,0) 0%, rgba(19,19,19,0.95) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(32,31,31,0.8) 0%, rgba(26,27,27,0.6) 100%)',
      },
    },
  },
  plugins: [],
}
