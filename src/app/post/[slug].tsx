import React, { useCallback, useEffect, useMemo, type PropsWithChildren } from "react"
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import { useFocusEffect, Link } from "expo-router"
import Markdown, { ElementStyles, ImageRenderer, SyntaxHighlighter } from "exponent-markdown"
import RNSyntaxHighlighter from "react-native-syntax-highlighter"
// @ts-ignore
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/styles/hljs"
import { Footer } from "@/components/footer"
import { usePost } from "@/hooks/usePost"
import { createThemedStylesheet, useTheme } from "@/hooks/useTheme"
import { useTitle } from "@/hooks/useTitle"
import { strings } from "@/i18n"

export default function PostPage() {
  const theme = useTheme()
  const styles = useStyle()
  const [_, setTitle] = useTitle()
  const { content, data, loading, error } = usePost()
  const title = !!data
    ? `${data.title} | ${strings.title}`
    : loading
    ? `${strings.loading} | ${strings.title}`
    : !!error
    ? `${strings.error} ${error.code} | ${strings.title}`
    : `${strings.title}`
  const elementStyles: ElementStyles = useMemo(
    () => ({
      emphasis: {
        fontFamily: theme.fonts.contentItalic,
      },
      strong: {
        fontFamily: theme.fonts.contentBold,
      },
      link: {
        color: theme.colors.link,
      },
      paragraph: {
        fontFamily: theme.fonts.contentRegular,
        fontSize: theme.size.content,
      },
      heading: {
        fontFamily: theme.fonts.bodyBold,
        fontSize: theme.size.heading * 0.8,
      },
      codeBlock: {
        flexShrink: 0,
        fontFamily: theme.fonts.code,
        fontSize: 16,
      },
      table: {
        alignSelf: "flex-start",
        marginBottom: theme.spacing.medium,
        marginHorizontal: theme.spacing.medium,
        minWidth: "90%",
      },
      tableRow: {
        borderColor: theme.colors.text,
      },
      tableCell: {
        flex: 1,
        padding: theme.spacing.small,
        borderColor: theme.colors.text,
      },
    }),
    [theme],
  )
  const renderImage: ImageRenderer = useCallback(
    ({ source, alt }) => <Image source={source} alt={alt!} contentFit="contain" style={styles.image} />,
    [styles],
  )
  const highlightSyntax: SyntaxHighlighter = useCallback(
    ({ fontFamily, fontSize, language, children }) => (
      <RNSyntaxHighlighter
        fontFamily={fontFamily!}
        fontSize={fontSize!}
        language={language}
        highligter="hljs"
        style={theme.dark ? atomOneDark : atomOneLight}
        wrapLines={false}
        wrapLongLines={false}
        CodeTag={({ children }: PropsWithChildren) => <Text>{children}</Text>}
        PreTag={({ children }: PropsWithChildren) => <View style={styles.pre}>{children}</View>}
      >
        {children}
      </RNSyntaxHighlighter>
    ),
    [styles, theme],
  )

  useFocusEffect(() => setTitle(title))
  useEffect(() => setTitle(title), [title])

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loader}>
          <ActivityIndicator size={256} color={theme.colors.link} />
        </View>
        <Footer />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.error}>
          <Text style={styles.error_message}>{error.message}</Text>
          {!!error.cause && <Text style={styles.error_cause}>{(error.cause as any).message}</Text>}
        </View>
        <Footer />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView>
        <View style={styles.post}>
          <View style={styles.meta}>
            <Text style={styles.title}>{data!.title}</Text>
            <View style={styles.tagline}>
              <Text style={styles.author}>{data!.author ?? strings.me}</Text>
              <Text style={styles.date}>
                {new Date(data!.published).toLocaleString()}{" "}
                {!!data!.edited && `${strings.edited} ${new Date(data!.edited).toLocaleString()}`}
              </Text>
            </View>
          </View>
          <Markdown
            text={content!}
            style={styles.markdown}
            elementStyles={elementStyles}
            renderImage={renderImage}
            highlightSyntax={highlightSyntax}
          />
          {!!data?.source && (
            <Text style={styles.source}>
              {strings.source}{" "}
              <Link href={data.source} target="_blank" style={styles.source_link}>
                {data.source}
              </Link>
            </Text>
          )}
        </View>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyle = createThemedStylesheet((theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.content,
      opacity: 0.6,
    },
    error: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.content,
      opacity: 0.6,
    },
    error_message: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.heading,
    },
    error_cause: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.heading * 0.8,
    },
    post: {
      flex: 1,
      alignSelf: "center",
      backgroundColor: theme.colors.content,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: 24,
      paddingVertical: theme.spacing.medium,
      marginVertical: theme.spacing.medium,
      maxWidth: theme.size.container,
      width: "100%",
    },
    meta: {},
    title: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyBold,
      fontSize: theme.size.heading,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: theme.spacing.medium,
    },
    tagline: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.medium,
    },
    author: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.tagline,
      opacity: 0.6,
    },
    date: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.tagline,
      opacity: 0.6,
    },
    markdown: {
      color: theme.colors.text,
      fontFamily: theme.fonts.contentRegular,
      fontSize: 18,
    },
    image: {
      width: "100%",
      minHeight: 420,
    },
    pre: {
      flex: 1,
    },
    source: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.tagline,
      opacity: 0.6,
    },
    source_link: {
      color: theme.colors.link,
    },
  }),
)
