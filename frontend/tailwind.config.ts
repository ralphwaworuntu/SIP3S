import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        "biru-pemerintah": "oklch(0.45 0.15 250)",
        "hijau-hutan": "oklch(0.55 0.12 145)",
        "slate-netral": "oklch(0.65 0.02 250)",
        "oranye-hangat": "oklch(0.68 0.15 45)",
        "abu-kartu": "oklch(0.98 0.005 250)",
        "teks-gelap": "oklch(0.2 0.02 250)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 250ms ease-in-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
