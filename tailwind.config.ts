import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#06080E',
          900: '#0B0E17',
          850: '#101420',
          800: '#171D2D',
          700: '#232B40',
        },
        star: {
          white: '#F5F7FB',
          silver: '#C5CCD9',
          dim: '#8590A6',
          faint: '#4A5568',
        },
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 45s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
