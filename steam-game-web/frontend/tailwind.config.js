/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        steam: {
          darkBg: "#0e1116",
          cardBg: "#1b2838",
          cardBgHover: "#223246",
          blue: "#66a6cc",
          green: "#9bb83d",
          darkBlue: "#171a21",
          accent: "#4c6275",
          priceGreen: "#4f6f1f",
          lightBg: "#2a475e",
          badgeBorder: "#536b80"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'steam-glow': '0 6px 18px rgba(0, 0, 0, 0.18)',
        'steam-glow-green': '0 6px 18px rgba(0, 0, 0, 0.16)'
      }
    },
  },
  plugins: [],
}
