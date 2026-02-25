import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          card: "rgba(255,255,255,0.04)",
        },
        accent: {
          DEFAULT: "#7c5cfc",
          light: "#a78bfa",
        },
        gold: {
          DEFAULT: "#d4a853",
          light: "#e8cc8c",
        },
        txt: {
          primary: "#f0ece4",
          secondary: "#9a9590",
          muted: "#5a5550",
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
      },
    },
  },
  plugins: [],
};
export default config;
