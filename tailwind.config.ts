import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8ff",
          100: "#dbeeff",
          200: "#b9deff",
          300: "#82c8ff",
          400: "#44aaff",
          500: "#1d8fff",
          600: "#0a70e6",
          700: "#0b59b5",
          800: "#124b8f",
          900: "#164076"
        }
      }
    }
  },
  plugins: []
};

export default config;
