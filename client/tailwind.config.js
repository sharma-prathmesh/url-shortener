/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f0f0f",
        darker: "#1a1a1a",
        border: "#2a2a2a",
      },
    },
  },
  plugins: [],
}