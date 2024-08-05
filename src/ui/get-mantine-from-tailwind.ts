import { type Config as TailwindConfig } from "tailwindcss"
import {
  MantineColorsTuple,
  MantineThemeColors,
  MantineThemeOverride,
} from "@mantine/core"
import {
  KeyValuePair,
  RecursiveKeyValuePair,
  ResolvableTo,
  Screen,
  ScreensConfig,
} from "tailwindcss/types/config"

function objectTailwindToMantine(
  tailwindObject?: ResolvableTo<KeyValuePair>,
  tailwindExtendObject?: ResolvableTo<KeyValuePair>,
): Record<string, string> | undefined {
  /* Most of the cases, the only differnce between Tailwind and Mantine is that
     Tailwind uses two iterable KeyValuePair (overwrite and extend), and Mantine 
     uses a single Record<string, string>, this function uniform most of the config fields
  */
  if (tailwindObject || tailwindExtendObject)
    return {
      ...(tailwindObject ? tailwindObject : {}),
      ...(tailwindExtendObject ? tailwindExtendObject : {}),
    }
  return undefined
}

function getFontSizes(
  tailwindFontSizeObject?: ResolvableTo<
    KeyValuePair<string, string | [fontSize: string, rest: unknown]>
  >,
  tailwindFontSizeExtendObject?: ResolvableTo<
    KeyValuePair<string, string | [fontSize: string, rest: unknown]>
  >,
): Record<string, string> | undefined {
  /* Tailwind fontSizes could be a string or an array that includes lineHeight or a config 
     obj (lineHeight, letterSpacing, fontWeight), so if the fontSize is an array we only care 
     for the first value
  */
  if (tailwindFontSizeObject || tailwindFontSizeExtendObject)
    return Object.fromEntries(
      [
        ...(tailwindFontSizeObject
          ? Object.entries(tailwindFontSizeObject)
          : []),
        ...(tailwindFontSizeExtendObject
          ? Object.entries(tailwindFontSizeExtendObject)
          : []),
      ].map(([key, tailwindFontSize]) => [
        key,
        typeof tailwindFontSize === "string"
          ? tailwindFontSize
          : tailwindFontSize[0],
      ]),
    )
  return undefined
}

function getBreakpoints(
  tailwindScreenObject?: ResolvableTo<ScreensConfig>,
  tailwindScreenExtendObject?: ResolvableTo<ScreensConfig>,
): Record<string, string> | undefined {
  /* Tailwind breakpoints could be a string, a number (for pixels) or an object with the 
     attributtes min, max and/or raw, string and number are trivial, but deffining wich uses 
     with min max and raw still need development
  */
  if (tailwindScreenObject || tailwindScreenExtendObject)
    return Object.fromEntries(
      [
        ...(tailwindScreenObject ? Object.entries(tailwindScreenObject) : []),
        ...(tailwindScreenExtendObject
          ? Object.entries(tailwindScreenExtendObject)
          : []),
      ].map(([key, breakpointValue]: [string, string | Screen | Screen[]]) => {
        if (typeof breakpointValue === "number")
          return [key, `${breakpointValue}px`]

        if (typeof breakpointValue === "string") return [key, breakpointValue]

        if ("min" in breakpointValue) return [key, breakpointValue.min]

        if ("raw" in breakpointValue) return [key, breakpointValue.raw]

        return [key, ""]
      }),
    )
  return undefined
}

function getColors(
  tailwindColorsObject?: ResolvableTo<RecursiveKeyValuePair>,
  tailwindColorsExtendObject?: ResolvableTo<RecursiveKeyValuePair>,
): Partial<MantineThemeColors> | undefined {
  /* Tailwind can overwrite all colors using tailwindConfig.theme?.colors or 
     extend existing colors with tailwindConfig.theme?.extend?.colors in case 
     there are none of theme, we don't need to pass anything for mantine config
  */
  if (tailwindColorsObject || tailwindColorsExtendObject) {
    /* First we split and merge all colors in both overwrite and extend */
    return Object.fromEntries(
      [
        ...(tailwindColorsObject ? Object.entries(tailwindColorsObject) : []),
        ...(tailwindColorsExtendObject
          ? Object.entries(tailwindColorsExtendObject)
          : []),
      ].map(([key, colorValue]) => {
        let colorsArray = Array.from({ length: 10 }, () => "")
        /* Tailwind expects colors to be strings or objects with number keys usually been 11 values: 
           ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]
        */

        /* Mantine requires an array with at least 10 values so if Tailwind color is a single string
           we need to generate an array of size 10 with same value
        */
        if (typeof colorValue === "string") {
          colorsArray = Array.from({ length: 10 }, () => colorValue)
        }

        /* As Mantine require at least 10 shades of a color, and Tailwind support to have more or less, 
           we need to convert into an array and in case there aren't enough values we need to fill the 
           array, and in this case the last value is used.
        */
        if (typeof colorValue === "object") {
          const tailwindColorsArray = Object.values(colorValue)

          colorsArray =
            tailwindColorsArray.length >= 10
              ? tailwindColorsArray.map((value) => String(value))
              : colorsArray.map((_, index) =>
                  index > tailwindColorsArray.length
                    ? String(tailwindColorsArray[index])
                    : String(tailwindColorsArray.at(-1)),
                )
        }

        return [key, colorsArray as unknown as MantineColorsTuple]
      }),
    )
  }
  return undefined
}

export function getMantineTheme(
  tailwindConfig: TailwindConfig,
): MantineThemeOverride {
  const colors = getColors(
    tailwindConfig.theme?.colors,
    tailwindConfig.theme?.extend?.colors,
  )

  const breakpoints = getBreakpoints(
    tailwindConfig.theme?.screens,
    tailwindConfig.theme?.extend?.screens,
  )

  const fontSizes = getFontSizes(
    tailwindConfig.theme?.fontSize,
    tailwindConfig.theme?.extend?.fontSize,
  )

  const spacing = objectTailwindToMantine(
    tailwindConfig.theme?.spacing,
    tailwindConfig.theme?.extend?.spacing,
  )
  const radius = objectTailwindToMantine(
    tailwindConfig.theme?.borderRadius,
    tailwindConfig.theme?.extend?.borderRadius,
  )
  const shadows = objectTailwindToMantine(
    tailwindConfig.theme?.boxShadow,
    tailwindConfig.theme?.extend?.boxShadow,
  )
  const lineHeights = objectTailwindToMantine(
    tailwindConfig.theme?.lineHeight,
    tailwindConfig.theme?.extend?.lineHeight,
  )

  return {
    colors: colors,
    spacing: spacing,
    radius: radius,
    shadows: shadows,
    breakpoints: breakpoints,
    lineHeights: lineHeights,
    fontSizes: fontSizes,

    /* 
    fontFamily works completely different, as Mantine has a single global fontFamily config and 
    Tailwind supports multiple fonts to be selected and define the order is difficult
    */

    /*
    defaultRadius, defaultGradient, white and black are not considered as there aren't default values
    in Tailwind
    */
  }
}
