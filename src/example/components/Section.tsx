import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cx, tx, u } from "@/styles";

import { UtilityChip } from "./UtilityChip";

type Props = {
  title: string;
  description?: string;
  utilities?: string[];
  children: ReactNode;
};

export function Section({ title, description, utilities, children }: Props) {
  return (
    <View style={cx(u.mb8)}>
      <Text style={tx(u.textLg, u.fontSemibold, u.textForeground, u.mb1)}>
        {title}
      </Text>
      {description ? (
        <Text style={tx(u.textSm, u.textMuted, u.mb3)}>{description}</Text>
      ) : null}
      {utilities && utilities.length > 0 ? (
        <View style={cx(u.flexRow, u.flexWrap, u.gap1, u.mb3)}>
          {utilities.map((name) => (
            <UtilityChip key={name} name={name} />
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}
