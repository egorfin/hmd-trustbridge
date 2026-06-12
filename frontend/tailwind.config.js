/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hmd: {
          blue: "#0057B8",
          teal: "#00A99D",
          light: "#F5F7FA",
        },
      },
    },
  },
  plugins: [],
};
