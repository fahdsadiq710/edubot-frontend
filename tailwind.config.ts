import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce8ff',
          200: '#b9d0ff',
          300: '#85adff',
          400: '#507eff',
          500: '#2a52ff',
          600: '#1130f5',
          700: '#0e23e0',
          800: '#111db5',
          900: '#141f8e',
          950: '#0d1260',
        },
        neon: '#6366f1',
        glass: 'rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.35), transparent)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-18px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        float:        'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        shimmer:      'shimmer 2.5s linear infinite',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37), inset 0 1px 0 rgba(255,255,255,0.1)',
        neon:  '0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)',
        card:  '0 20px 60px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
