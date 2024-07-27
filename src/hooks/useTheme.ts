import { createContext, useContext, useMemo } from "react"
import { Appearance, type ColorSchemeName, type ImageStyle, type TextStyle, type ViewStyle } from "react-native"
import { useMediaQuery } from "react-responsive"
import { Colors } from "@/constants/colors"
import { ColorScheme } from "@/lib/storage"

interface Theme {
  dark: boolean
  small: boolean
  colors: Colors
  spacing: {
    small: number
    medium: number
    large: number
  }
  size: {
    heading: number
    tagline: number
    content: number
    container: number
  }
  fonts: {
    bodyBold: string
    bodyRegular: string
    code: string
    contentBold: string
    contentBoldItalic: string
    contentItalic: string
    contentRegular: string
  }
}

export const ColorSchemeContext = createContext<ColorSchemeName>("light")
export const UpdateColorSchemeContext = createContext<(colorScheme: ColorSchemeName) => void>(() => {})

export const getColorScheme = (user?: ColorSchemeName | null, system?: ColorSchemeName | null): ColorSchemeName => {
  if (!user) {
    user = ColorScheme.get()
  }
  if (!system) {
    system = Appearance.getColorScheme()
  }
  return user ?? system ?? "light"
}

export const useColorScheme = (): [ColorSchemeName, (colorScheme: ColorSchemeName) => void] => {
  const scheme = useContext(ColorSchemeContext)
  const update = useContext(UpdateColorSchemeContext)
  return [scheme, update]
}

const generateTheme = (options: { scheme: ColorSchemeName; phone: boolean; tablet: boolean; desktop: boolean }): Theme => {
  const colors = Colors[options.scheme!]
  const theme: Theme = {
    dark: options.scheme === "dark",
    small: options.phone,
    colors,
    spacing: {
      small: options.phone ? 5 : options.tablet ? 8 : options.desktop ? 12 : 16,
      medium: options.phone ? 12 : options.tablet ? 18 : options.desktop ? 24 : 48,
      large: options.phone ? 28 : options.tablet ? 32 : options.desktop ? 64 : 96,
    },
    size: {
      heading: options.phone ? 22 : 26,
      tagline: options.phone ? 12 : 14,
      content: options.phone ? 16 : 18,
      container: options.phone ? 380 : 720,
    },
    fonts: {
      bodyBold: "Inter_700Bold",
      bodyRegular: "Inter_400Regular",
      code: "FiraCode_400Regular",
      contentBold: "Merriweather_700Bold",
      contentBoldItalic: "Merriweather_700Bold_Italic",
      contentItalic: "Merriweather_400Regular_Italic",
      contentRegular: "Merriweather_400Regular",
    },
  }
  return theme
}

export const getTheme = () => {
  const scheme = getColorScheme()
  const phone = globalThis.matchMedia("(max-width: 420px)").matches
  const tablet = globalThis.matchMedia("(max-width: 810px)").matches
  const desktop = globalThis.matchMedia("(max-width: 1920px)").matches
  return generateTheme({
    scheme,
    phone,
    tablet,
    desktop,
  })
}

export const useTheme = () => {
  const [scheme] = useColorScheme()
  const phone = useMediaQuery({ maxWidth: 420 })
  const tablet = useMediaQuery({ maxWidth: 810 })
  const desktop = useMediaQuery({ maxWidth: 1920 })
  const theme: Theme = useMemo(
    () =>
      generateTheme({
        scheme,
        phone,
        tablet,
        desktop,
      }),
    [scheme, phone, tablet, desktop],
  )
  return theme
}

export const createThemedStylesheet = <T extends Record<string, ImageStyle | TextStyle | ViewStyle>>(builder: (theme: Theme) => T) => {
  return () => {
    const theme = useTheme()
    const stylesheet = useMemo(() => builder(theme), [theme])
    return stylesheet
  }
}
