import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { exampleScreens } from "@/example/data/navigation";
import { styles, text, view } from "@/styles";

export default function ExampleIndex() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: "Style Examples" }} />
      <ScrollView
        style={view(styles.flex1, styles.bgBackground)}
        contentContainerStyle={view(styles.p4, {
          paddingBottom: insets.bottom + 24,
        })}
      >
        <Text
          style={text(
            styles.text2xl,
            styles.fontBold,
            styles.textForeground,
            styles.mb2,
          )}
        >
          Utility Styling
        </Text>
        <Text style={text(styles.textSm, styles.textMuted, styles.mb6)}>
          Collection of examples showcasing all utility classes. Tailwind-like
          styling using React Native's built-in StyleSheet.
        </Text>

        <View style={view(styles.gap3)}>
          {exampleScreens.map((screen) => (
            <Link key={screen.title} href={screen.href} asChild>
              <Pressable
                style={({ pressed }) =>
                  view(
                    styles.bgCard,
                    styles.p4,
                    styles.roundedXl,
                    styles.border,
                    styles.borderBorder,
                    styles.shadowSm,
                    pressed && styles.opacity75,
                  )
                }
              >
                <Text
                  style={text(
                    styles.textBase,
                    styles.fontSemiBold,
                    styles.textForeground,
                    styles.mb1,
                  )}
                >
                  {screen.title}
                </Text>
                <Text style={text(styles.textSm, styles.textMuted, styles.mb3)}>
                  {screen.description}
                </Text>
                <View
                  style={view(styles.flexRow, styles.flexWrap, styles.gap1)}
                >
                  {screen.utilities.map((utility) => (
                    <View
                      key={utility}
                      style={view(
                        styles.bgPrimary50,
                        styles.px2,
                        styles.py1,
                        styles.rounded,
                      )}
                    >
                      <Text
                        style={text(
                          styles.textXs,
                          styles.fontMono,
                          styles.textPrimary500,
                        )}
                      >
                        {utility}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
