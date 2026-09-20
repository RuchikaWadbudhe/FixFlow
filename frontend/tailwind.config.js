/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#1a56db', hover: '#1648c8', light: '#dbeafe', dark: '#1341b5' },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
      borderRadius: { lg: '8px', xl: '10px', '2xl': '14px' },
      screens: { xs: '375px' },
    },
  },
  plugins: [],
}
