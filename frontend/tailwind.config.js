/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Crimson Text"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fdf8e7',
          100: '#faefc0',
          200: '#f5d96d',
          300: '#e8b84e',
          400: '#d4952a',
          500: '#b8750f',
          600: '#9a5c08',
          700: '#7a4506',
          800: '#5c3205',
          900: '#3d2003',
        },
        imperial: {
          dark: '#0a0a0f',
          darker: '#050508',
          surface: '#12121a',
          card: '#1a1a28',
          border: '#2a2a3d',
          muted: '#3d3d5c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'coin-spin': 'coinSpin 1.5s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        coinSpin: { '0%': { transform: 'rotateY(0deg)' }, '100%': { transform: 'rotateY(360deg)' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 149, 42, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(212, 149, 42, 0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
