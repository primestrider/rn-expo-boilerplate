import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { view, text, styles } from "@/styles";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ExampleScreen({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={view(styles.flex1, styles.bgBackground)}
      contentContainerStyle={view(styles.p4, { paddingBottom: insets.bottom + 24 })}
    >
      <View style={view(styles.mb6)}>
        <Text style={text(styles.text2xl, styles.fontBold, styles.textForeground, styles.fontSans)}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={text(styles.textSm, styles.textMuted, styles.mt1)}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
