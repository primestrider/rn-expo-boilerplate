import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { exampleScreens } from "@/example/data/navigation";
import { cx, tx, u } from "@/styles";

export default function ExampleIndex() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: "Style Examples" }} />
      <ScrollView
        style={cx(u.flex1, u.bgBackground)}
        contentContainerStyle={cx(u.p4, { paddingBottom: insets.bottom + 24 })}
      >
        <Text style={tx(u.text2xl, u.fontBold, u.textForeground, u.mb2, u.fontSans)}>
          Utility Styling
        </Text>
        <Text style={tx(u.textSm, u.textMuted, u.mb6)}>
          Koleksi contoh pemakaian seluruh utility class. Mirip Tailwind, tapi
          memakai StyleSheet bawaan React Native.
        </Text>

        <View style={cx(u.gap3)}>
          {exampleScreens.map((screen) => (
            <Link key={screen.title} href={screen.href} asChild>
              <Pressable
                style={({ pressed }) =>
                  cx(
                    u.bgCard,
                    u.p4,
                    u.roundedXl,
                    u.border,
                    u.borderBorder,
                    u.shadowSm,
                    pressed && u.opacity75
                  )
                }
              >
                <Text style={tx(u.textBase, u.fontSemibold, u.textForeground, u.mb1)}>
                  {screen.title}
                </Text>
                <Text style={tx(u.textSm, u.textMuted, u.mb3)}>{screen.description}</Text>
                <View style={cx(u.flexRow, u.flexWrap, u.gap1)}>
                  {screen.utilities.map((utility) => (
                    <View key={utility} style={cx(u.bgPrimary50, u.px2, u.py1, u.rounded)}>
                      <Text style={tx(u.textXs, u.fontMono, u.textPrimary500)}>{utility}</Text>
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
