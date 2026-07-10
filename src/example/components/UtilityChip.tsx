import { Text, View } from "react-native";

import { styles, text, view } from "@/styles";

type Props = {
  name: string;
};

export function UtilityChip({ name }: Props) {
  return (
    <View
      style={view(styles.bgGray100, styles.px2, styles.py1, styles.rounded)}
    >
      <Text style={text(styles.textXs, styles.fontMono, styles.textGray700)}>
        {name}
      </Text>
    </View>
  );
}
