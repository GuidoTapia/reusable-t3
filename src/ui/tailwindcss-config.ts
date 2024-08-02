import { type Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        indigo: {
          "50": "#F5FBFF",
          "100": "#A8DBFF",
          "200": "#67BFFF",
          "300": "#2FA8FF",
          "400": "#0094FF",
          "500": "#0080F0",
          "600": "#006CC3",
          "700": "#005BAA",
          "800": "#004B8D",
          "900": "#003E75",
        },
      },
      fontSize: {
        sm: "0.8rem",
        base: "1rem",
        xl: "1.25rem",
        "2xl": "1.563rem",
        "3xl": "1.953rem",
        "4xl": "2.441rem",
        "5xl": "3.052rem",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "32px",
      },
      spacing: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        otro: "12px",
      },
      shadows: {
        sm: "0px 1px 4px rgba(0, 0, 0, 0.12)",
        md: "4px 8px 24px rgba(0, 0, 0, 0.04)",
        lg: "0px 7px 7px -5px rgba(0, 0, 0, 0.04), 0px 10px 15px -5px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
} satisfies Config
