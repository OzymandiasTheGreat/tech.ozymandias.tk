declare module "react-native-syntax-highlighter" {
  const SyntaxHighlighter: React.FC<{
    fontFamily?: string
    fontSize?: number
    highligter: "prism" | "hljs"
    language: string
    style?: any
    wrapLines?: boolean
    wrapLongLines?: boolean
    PreTag?: any
    CodeTag?: any
    children: string
  }>

  export default SyntaxHighlighter
}
