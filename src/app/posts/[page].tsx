import { useEffect } from "react"
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "expo-router"
import { Footer } from "@/components/footer"
import { PageListing } from "@/components/listing"
import { usePages } from "@/hooks/usePages"
import { createThemedStylesheet, useTheme } from "@/hooks/useTheme"
import { useTitle } from "@/hooks/useTitle"
import { strings } from "@/i18n"

export default function HomeScreen() {
  const theme = useTheme()
  const styles = useStyle()
  const {
    data: { content, index, last },
    loading,
    error,
  } = usePages()
  const [_, setTitle] = useTitle()

  useFocusEffect(() => setTitle(`${strings.page} ${index} | ${strings.title}`))
  useEffect(() => setTitle(`${strings.page} ${index} | ${strings.title}`), [index, strings])

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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <PageListing content={content} index={index} last={last} />
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
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      alignSelf: "center",
      backgroundColor: theme.colors.content,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: 24,
      paddingTop: theme.spacing.medium,
      marginVertical: theme.spacing.medium,
      maxWidth: theme.size.container,
      width: "100%",
    },
  }),
)
