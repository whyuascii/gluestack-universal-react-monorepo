/** @type {import('tailwindcss').Config} */
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: [
    "./app/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,mdx}",
  ],
  important: "html",
});
