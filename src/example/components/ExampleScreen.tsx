import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cx, tx, u } from "@/styles";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ExampleScreen({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={cx(u.flex1, u.bgBackground)}
      contentContainerStyle={cx(u.p4, { paddingBottom: insets.bottom + 24 })}
    >
      <View style={cx(u.mb6)}>
        <Text style={tx(u.text2xl, u.fontBold, u.textForeground, u.fontSans)}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={tx(u.textSm, u.textMuted, u.mt1)}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
