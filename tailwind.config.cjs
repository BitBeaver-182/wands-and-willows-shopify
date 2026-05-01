/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.{json,liquid}',
    './assets/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f1f15',
          forest: '#1a3322',
          gold: '#c4a661',
          goldHover: '#d4b671',
          parchment: '#f8f5ee',
          sand: '#e8e2d2',
          text: '#2d3748',
          muted: '#718096',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  important: '.landing',
};

