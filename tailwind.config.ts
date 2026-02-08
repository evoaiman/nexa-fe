import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.125rem',
        md: '0.125rem',
        lg: '0.125rem',
        xl: '0.125rem',
        '2xl': '0.125rem',
        '3xl': '0.125rem',
      },
      colors: {
        primary: {
          50: '#fbe9e7',
          100: '#ffccbc',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#e53935',
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#7f0000',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
