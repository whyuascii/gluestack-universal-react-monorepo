/** @type {import('tailwindcss').Config} */
import createTailwindConfig from "tailwind-config";

export default createTailwindConfig({
  content: [
    "./app/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./components/**/*.{html,js,jsx,ts,tsx,mdx}",
    "./src/**/*.{html,js,jsx,ts,tsx,mdx}",
  ],
  important: "html",
});
