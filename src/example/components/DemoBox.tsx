import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, View } from "react-native";

import { view, text, styles } from "@/styles";

type Props = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function DemoBox({ label, style, children }: Props) {
  return (
    <View style={view(styles.bgGray50, styles.border, styles.borderGray200, styles.roundedLg, styles.p3, style)}>
      {label ? (
        <Text style={text(styles.textXs, styles.textGray500, styles.mb2, styles.fontMono)}>{label}</Text>
      ) : null}
      {children}
    </View>
  );
}
