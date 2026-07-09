import { Text, View } from "react-native";

import { cx, tx, u } from "@/styles";

type Props = {
  name: string;
};

export function UtilityChip({ name }: Props) {
  return (
    <View style={cx(u.bgGray100, u.px2, u.py1, u.rounded)}>
      <Text style={tx(u.textXs, u.fontMono, u.textGray700)}>{name}</Text>
    </View>
  );
}
