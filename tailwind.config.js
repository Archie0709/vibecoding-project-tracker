/** @type {import('tailwindcss').Config} */
// Design tokens from DESIGN.md §2. All text colours are >= 4.5:1 on every surface.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5CC8B8',
          accent: '#8AB4F8',
        },
        surface: {
          page: '#0F1419',
          card: '#1A222C',
          raised: '#232D38',
        },
        text: {
          primary: '#E6EDF3',
          muted: '#9AA8B6',
        },
        border: {
          subtle: '#344150',
          strong: '#6B7B8C',
        },
        // M6 tag-style
        type: {
          feature: '#B39DFF',
          bug: '#FF8F85',
        },
        // M8 due-tint
        due: {
          safe: '#6CB6FF',
          warning: '#F2C14E',
          overdue: '#FF6B6B',
          neutral: '#8F9BA8',
        },
      },
      // DESIGN.md §4: a 200 ms fade only, applied with `motion-safe:` so it is
      // skipped for users who prefer reduced motion.
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
