import type { ColorSchemeName } from "react-native"

const LocalStorage = globalThis.localStorage

export default LocalStorage

const COLORSCHEME = "__colorScheme"

export const ColorScheme = {
  get(): ColorSchemeName {
    return LocalStorage.getItem(COLORSCHEME) as ColorSchemeName
  },
  set(scheme: ColorSchemeName) {
    return LocalStorage.setItem(COLORSCHEME, scheme as string)
  },
  clear() {
    return LocalStorage.removeItem(COLORSCHEME)
  },
}
