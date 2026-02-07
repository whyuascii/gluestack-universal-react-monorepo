/** @type {import('tailwindcss').Config} */
import createTailwindConfig from "@app/tailwind-config";

export default createTailwindConfig({
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  important: "html",
});
