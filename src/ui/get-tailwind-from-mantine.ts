import { type Config as TailwindConfig } from "tailwindcss"
import { MantineThemeColors, MantineThemeOverride } from "@mantine/core"
import {
  KeyValuePair,
  RecursiveKeyValuePair,
  ResolvableTo,
} from "tailwindcss/types/config"

function objectMantineToTailwind(
  mantineObject?: Record<string, string | undefined>,
): ResolvableTo<KeyValuePair> | undefined {
  /* Most of the cases, the only differnce between Tailwind and Mantine is that
     Tailwind uses two iterable KeyValuePair (overwrite and extend), and Mantine 
     uses a single Record<string, string>, this function uniform most of the config fields
  */
  if (mantineObject)
    return Object.fromEntries(
      Object.entries(mantineObject).filter(([key, value]) => key && value),
    ) as Record<string, string>

  return undefined
}

function getColors(
  mantineColors?: Partial<MantineThemeColors>,
): ResolvableTo<RecursiveKeyValuePair> | undefined {
  if (mantineColors) {
    return Object.fromEntries(
      Object.entries(mantineColors)
        .filter(([key, colorValue]) => key && colorValue)
        .map(([key, colorValue]) => {
          const shadeKeys = [
            "50",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
            ...(colorValue && colorValue.length > 10 ? ["950"] : []),
          ]

          return [
            key,
            Object.fromEntries(
              shadeKeys.map((shade, i) => [shade, colorValue?.at(i)]),
            ),
          ]
        }),
    ) as ResolvableTo<RecursiveKeyValuePair>
  }
  return undefined
}

export function getTailwindConfig(
  mantineTheme: MantineThemeOverride,
  overwriteValues: boolean = false,
): TailwindConfig {
  const colors = getColors(mantineTheme.colors)

  const fontSize = objectMantineToTailwind(mantineTheme.fontSizes)
  const breakpoints = objectMantineToTailwind(mantineTheme.breakpoints)
  const spacing = objectMantineToTailwind(mantineTheme.spacing)
  const borderRadius = objectMantineToTailwind(mantineTheme.radius)
  const shadows = objectMantineToTailwind(mantineTheme.shadows)
  const lineHeights = objectMantineToTailwind(mantineTheme.lineHeights)
  const fontFamily = mantineTheme.fontFamily
    ? { mantine: mantineTheme.fontFamily.split(" ") }
    : undefined

  return {
    content: ["./src/**/*.tsx"],
    theme: overwriteValues
      ? {
          colors: {
            ...colors,
            ...(mantineTheme.black ? { black: mantineTheme.black } : {}),
            ...(mantineTheme.white ? { white: mantineTheme.white } : {}),
          },
          spacing: spacing,
          borderRadius: borderRadius,
          shadows: shadows,
          breakpoints: breakpoints,
          lineHeights: lineHeights,
          fontSize: fontSize,
          fontFamily: fontFamily,
        }
      : {
          extend: {
            colors: {
              ...colors,
              ...(mantineTheme.black ? { black: mantineTheme.black } : {}),
              ...(mantineTheme.white ? { white: mantineTheme.white } : {}),
            },
            spacing: spacing,
            borderRadius: borderRadius,
            shadows: shadows,
            breakpoints: breakpoints,
            lineHeights: lineHeights,
            fontSize: fontSize,
            fontFamily: fontFamily,
          },
        },
  }
}
