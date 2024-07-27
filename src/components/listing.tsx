import React from "react"
import { StyleSheet, Text, View } from "react-native"
import MDI from "@expo/vector-icons/MaterialCommunityIcons"
import { Link } from "expo-router"
import { type Content } from "@/hooks/usePages"
import { createThemedStylesheet, useTheme } from "@/hooks/useTheme"
import { strings } from "@/i18n"

export const PageListing: React.FC<{ content: Content["content"]; index: number; last: boolean }> = ({ content, index, last }) => {
  const theme = useTheme()
  const styles = useStyle()

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {content.map((data) => (
          <View key={data.slug} style={styles.post}>
            <Link href={`/post/${data.filename}`} style={styles.title}>
              {data.title}
              {"\n"}
            </Link>
            <Text style={styles.date}>{new Date(data.published).toLocaleString()}</Text>
          </View>
        ))}
      </View>
      <View style={styles.pager}>
        {index !== 1 && (
          <Link href={`/posts/${index - 1}`} style={styles.page}>
            <MDI name="chevron-left" size={24} color={theme.colors.link} style={styles.link_icon} />
            {strings.prev}
          </Link>
        )}
        {!last && (
          <Link href={`/posts/${index + 1}`} style={styles.page}>
            {strings.next}
            <MDI name="chevron-right" size={24} color={theme.colors.link} style={styles.link_icon} />
          </Link>
        )}
      </View>
    </View>
  )
}

const useStyle = createThemedStylesheet((theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      flexShrink: 1,
      alignItems: "center",
      paddingHorizontal: theme.spacing.medium,
    },
    post: {
      flex: 1,
      flexShrink: 0,
      width: "100%",
      marginBottom: theme.spacing.large,
    },
    title: {
      color: theme.colors.link,
      fontFamily: theme.fonts.bodyBold,
      fontSize: theme.size.heading,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: theme.spacing.medium,
    },
    date: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.tagline,
      textAlign: "center",
      width: "100%",
    },
    pager: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      gap: theme.spacing.small,
      marginBottom: theme.spacing.medium,
    },
    page: {
      color: theme.colors.link,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.tagline,
      lineHeight: 24,
    },
    link_icon: {
      verticalAlign: "bottom",
    },
  }),
)
