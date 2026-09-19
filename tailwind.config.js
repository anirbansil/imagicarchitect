/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./portfolio.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        "imagic-yellow": "#FFC813",
        "imagic-gold": "#E8B412",
        burgundy: "#5A1720",
        "burgundy-light": "#7A2430",
        ivory: "#FFF8ED",
        cream: "#F3E8D6",
        charcoal: "#211518",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: {
        "1440": "1440px",
      },
    },
  },
  plugins: [],
};
