module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'vazirmatn': ['var(--font-vazirmatn)', 'sans-serif'], // استفاده از متغیر CSS
      },
    },
  },
  plugins: [],
}