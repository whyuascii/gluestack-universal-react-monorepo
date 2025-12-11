/** @type {import('tailwindcss').Config} */
const createTailwindConfig = require("tailwind-config");

module.exports = createTailwindConfig({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
});
