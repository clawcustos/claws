import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E63946",
        secondary: "#1D3557",
        accent: "#FFD700",
        background: "#0D1117",
      },
    },
  },
  plugins: [],
};
export default config;
