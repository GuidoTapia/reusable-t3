import { getMantineTheme } from "./get-mantine-from-tailwind"
import tailwindcssConfig from "./tailwindcss-config"
import { MantineThemeOverride } from "@mantine/core"

export const mantineTheme: MantineThemeOverride = {
  colors: {
    indigo: [
      "#F5FBFF",
      "#A8DBFF",
      "#67BFFF",
      "#2FA8FF",
      "#0094FF",
      "#0080F0",
      "#006CC3",
      "#005BAA",
      "#004B8D",
      "#003E75",
    ],
  },
  fontSizes: {
    sm: "0.8rem",
    base: "1rem",
    xl: "1.25rem",
    "2xl": "1.563rem",
    "3xl": "1.953rem",
    "4xl": "2.441rem",
    "5xl": "3.052rem",
  },
  radius: {
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
}

/*export const mantineTheme: MantineThemeOverride =
  getMantineTheme(tailwindcssConfig)*/
