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
  const [_, setTitle] = useTitle()
  const {
    data: { content, index, last },
    loading,
    error,
  } = usePages()

  useFocusEffect(() => setTitle(strings.title))

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.blurb}>
            <Text style={styles.text}>{strings.welcome}</Text>
          </View>
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={theme.colors.link} size={256} />
            </View>
          ) : !!error ? (
            <View style={styles.error}>
              <Text style={styles.error_message}>{error.message}</Text>
              {!!error.cause && <Text style={styles.error_cause}>{(error.cause as any).message}</Text>}
            </View>
          ) : (
            <PageListing content={content} index={index} last={last} />
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
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      alignSelf: "center",
      backgroundColor: theme.colors.content,
      paddingHorizontal: theme.spacing.medium,
      borderRadius: 24,
      marginVertical: theme.spacing.medium,
      maxWidth: theme.size.container,
      width: "100%",
    },
    blurb: {
      flexShrink: 1,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      maxWidth: "80%",
      marginVertical: theme.spacing.large,
    },
    text: {
      color: theme.colors.text,
      fontFamily: theme.fonts.contentItalic,
      fontSize: theme.size.content,
      fontStyle: "italic",
      textAlign: "center",
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.large,
    },
    error: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.large,
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
  }),
)
