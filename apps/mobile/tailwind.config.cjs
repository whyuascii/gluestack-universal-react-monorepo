/** @type {import('tailwindcss').Config} */
const createTailwindConfig = require("@app/tailwind-config");

module.exports = createTailwindConfig({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    "../../packages/components/src/**/*.{js,jsx,ts,tsx}",
  ],
});
