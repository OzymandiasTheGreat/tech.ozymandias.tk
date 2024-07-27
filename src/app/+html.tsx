import { ScrollViewStyleReset } from "expo-router/html"
import { type PropsWithChildren } from "react"
import { Colors } from "@/constants/colors"

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <link rel="shortcut icon" href="/images/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
        <link rel="apple-touch-icon" href="/images/favicon.png" />
        <link rel="mask-icon" href="/images/favicon.png" color="#efefef" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  )
}

const responsiveBackground = `
body {
  background-color: ${Colors.light.background};
  background-image: url("/images/pattern.png");
  background-size: 432px 216px;
  background-repeat: round;
}
@supports (scrollbar-width: auto) and (scrollbar-color: auto) {
  * {
    scrollbar-width: thin;
    scrollbar-color: ${Colors.light.text} transparent;
  }
}
@supports selector(::-webkit-scrollbar) {
  ::-webkit-scrollbar {
    background: transparent;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    background: ${Colors.light.text};
    border-radius: 13px;
  }
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: ${Colors.dark.background};
  }
  @supports (scrollbar-width: auto) and (scrollbar-color: auto) {
    * {
      scrollbar-width: thin;
      scrollbar-color: ${Colors.dark.text} transparent;
    }
  }
  @supports selector(::-webkit-scrollbar) {
    ::-webkit-scrollbar {
      background: transparent;
      width: 7px;
    }
    ::-webkit-scrollbar-thumb {
      background: ${Colors.dark.text};
      border-radius: 13px;
    }
  }
}`
