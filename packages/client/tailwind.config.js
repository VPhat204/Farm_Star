/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#060913',
          800: '#0c1222',
          700: '#131e3a',
          600: '#1d2d54',
        },
        stellar: {
          cyan: '#00f0ff',
          purple: '#b026ff',
          gold: '#ffd700',
          emerald: '#00ff88',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
