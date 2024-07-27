export const Colors = {
  light: {
    background: "#B2FF59",
    content: "#FAFAFA",
    text: "#424242",
    link: "#2962FF",
  },
  dark: {
    background: "#33691E",
    content: "#424242",
    text: "#FAFAFA",
    link: "#82B1FF",
  },
}

export type Colors = (typeof Colors)["dark"] | (typeof Colors)["light"]
