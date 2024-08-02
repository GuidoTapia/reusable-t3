import { getMantineTheme } from "./get-mantine-from-tailwind"
import tailwindcssConfig from "./tailwindcss-config"
import { MantineThemeOverride } from "@mantine/core"

export const mantineTheme: MantineThemeOverride =
  getMantineTheme(tailwindcssConfig)
