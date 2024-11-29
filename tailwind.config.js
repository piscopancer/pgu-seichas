/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        neutral: {
          850: '#1E1E1E',
          925: '#111113',
        },
      },
      fontFamily: {
        sans: 'Geist-Regular',
        'sans-bold': 'Geist-Bold',
        mono: 'GeistMono-Regular',
        'mono-bold': 'GeistMono-Bold',
      },
    },
  },
}
