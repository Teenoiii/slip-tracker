/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'IBM Plex Sans Thai'", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
