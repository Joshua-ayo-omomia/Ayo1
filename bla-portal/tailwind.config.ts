import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a2540",
        accent: "#635bff",
        golden: "#d4a012",
        background: "#ffffff",
        surface: "#f6f9fc",
        border: "#e6ebf1",
        text: {
          DEFAULT: "#0a2540",
          secondary: "#425466",
          muted: "#8898aa",
        },
        success: "#30b969",
        error: "#ed5f74",
        warning: "#f5a623",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        card: "8px",
        modal: "12px",
      },
      boxShadow: {
        sm: "0 2px 4px rgba(0, 0, 0, 0.05)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
