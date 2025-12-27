/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // Green tones matching logo
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50", // Main green
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        accent: {
          // Orange tones matching logo
          50: "#fff3e0",
          100: "#ffe0b2",
          200: "#ffcc80",
          300: "#ffb74d",
          400: "#ffa726",
          500: "#ff9800", // Main orange
          600: "#fb8c00",
          700: "#f57c00",
          800: "#ef6c00",
          900: "#e65100",
        },
      },
      backgroundImage: {
        "gradient-submerged":
          "linear-gradient(135deg, #4caf50 0%, #66bb6a 25%, #ff9800 50%, #ffb74d 75%, #4caf50 100%)",
        "gradient-green-orange":
          "linear-gradient(135deg, #43a047 0%, #66bb6a 30%, #ff9800 60%, #ffb74d 100%)",
      },
    },
  },
  plugins: [],
};
