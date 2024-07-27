import { StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "expo-router"
import { createThemedStylesheet } from "@/hooks/useTheme"
import { useTitle } from "@/hooks/useTitle"
import { strings } from "@/i18n"

export default function NotFoundScreen() {
  const styles = useStyle()
  const [_, setTitle] = useTitle()

  useFocusEffect(() => setTitle(`${strings.err404.title} | ${strings.title}`))

  return (
    <View style={styles.root}>
      <Text style={styles.text}>{strings.err404.message}</Text>
    </View>
  )
}

const useStyle = createThemedStylesheet((theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.content,
      opacity: 0.6,
    },
    text: {
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyRegular,
      fontSize: theme.size.heading,
    },
  }),
)
