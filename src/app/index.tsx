import { Link, type LinkProps } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { cx, tx, u } from "@/styles";

export default function Index() {
  return (
    <View style={cx(u.flex1, u.bgBackground, u.p6, u.center)}>
      <Text style={tx(u.text2xl, u.fontBold, u.textForeground, u.fontSans, u.mb2)}>
        RN Expo Boilerplate
      </Text>
      <Text style={tx(u.textSm, u.textMuted, u.mb8, u.textCenter)}>
        Utility styling mirip Tailwind dengan StyleSheet bawaan React Native
      </Text>

      <Link href={"/example" as LinkProps["href"]} asChild>
        <Pressable
          style={({ pressed }) =>
            cx(
              u.bgPrimary,
              u.px6,
              u.py4,
              u.roundedXl,
              u.shadowMd,
              pressed && u.opacity75
            )
          }
        >
          <Text style={tx(u.textBase, u.fontSemibold, u.textWhite)}>
            Buka Style Examples →
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
