import { Link, type LinkProps } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { styles, text, view } from "@/styles";

export default function Index() {
  return (
    <View
      style={view(styles.flex1, styles.bgBackground, styles.p6, styles.center)}
    >
      <Text
        style={text(
          styles.text2xl,
          styles.fontBold,
          styles.textForeground,
          styles.fontSans,
          styles.mb2,
        )}
      >
        RN Expo Boilerplate
      </Text>
      <Text
        style={text(
          styles.textSm,
          styles.textMuted,
          styles.mb8,
          styles.textCenter,
        )}
      >
        Tailwind-like utility styling with React Native's built-in StyleSheet
      </Text>

      <Link href={"/example" as LinkProps["href"]} asChild>
        <Pressable
          style={({ pressed }) =>
            view(
              styles.bgAmber100,
              styles.px6,
              styles.py4,
              styles.roundedXl,
              styles.shadowMd,
              pressed && styles.opacity75,
            )
          }
        >
          <Text
            style={text(
              styles.textBase,
              styles.fontSemibold,
              styles.textAmber900,
            )}
          >
            Open Style Examples →
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
