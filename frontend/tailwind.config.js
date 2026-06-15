/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        slate: "#1f2a44",
        mist: "#e6edf8",
        aqua: "#4fd1c5",
      },
    },
  },
  plugins: [],
}

