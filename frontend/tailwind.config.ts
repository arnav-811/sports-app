import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sport accent colors — static, same in both themes
        'sport-football': '#00E5B4',
        'sport-tennis': '#C8F135',
        'sport-cricket': '#FFD23F',
        'sport-f1': '#FF0038',
        'sport-badminton': '#FF6B35',
        // Aliases used in economy/newer components
        football: '#00E5B4',
        tennis: '#C8F135',
        cricket: '#FFD23F',
        f1: '#FF0038',
        badminton: '#FF6B35',

        // Surfaces — CSS var backed, theme-aware, support opacity modifiers
        'surface-0': 'rgb(var(--c-s0) / <alpha-value>)',
        'surface-1': 'rgb(var(--c-s1) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-s2) / <alpha-value>)',
        'surface-3': 'rgb(var(--c-s3) / <alpha-value>)',
        'surface-4': 'rgb(var(--c-s4) / <alpha-value>)',

        // Text — CSS var backed
        'text-1': 'rgb(var(--c-t1) / <alpha-value>)',
        'text-2': 'rgb(var(--c-t2) / var(--t2-opacity))',
        'text-3': 'rgb(var(--c-t3) / var(--t3-opacity))',

        // Aliases used in newer components
        'text-primary': 'rgb(var(--c-t1) / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-t2) / var(--t2-opacity))',
        'text-muted': 'rgb(var(--c-t3) / var(--t3-opacity))',

        // Border utilities
        border: 'var(--border-color)',
        'border-2': 'var(--border-color-2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        nav: 'var(--shadow-nav)',
        elevated: 'var(--shadow-elevated)',
      },
      animation: {
        'live-pulse': 'livePulse 1.5s ease-in-out infinite',
        'score-pop': 'scorePop 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
