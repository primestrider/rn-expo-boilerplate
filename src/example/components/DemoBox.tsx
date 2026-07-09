import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, View } from "react-native";

import { cx, tx, u } from "@/styles";

type Props = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function DemoBox({ label, style, children }: Props) {
  return (
    <View style={cx(u.bgGray50, u.border, u.borderGray200, u.roundedLg, u.p3, style)}>
      {label ? (
        <Text style={tx(u.textXs, u.textGray500, u.mb2, u.fontMono)}>{label}</Text>
      ) : null}
      {children}
    </View>
  );
}
