import { View } from "react-native";

import { AppText, Card, Divider, ListItem } from "@/shared/components";
import { useStyles, view } from "@/styles";

export type NavSectionItem = {
  key: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

type Props = {
  title: string;
  description?: string;
  items: NavSectionItem[];
};

/**
 * A titled group of navigation rows in one outlined card — the directory
 * layout the example hubs share, so every page is one tap from its group.
 */
export function NavSection({ title, description, items }: Readonly<Props>) {
  const styles = useStyles();

  return (
    <View style={view(styles.gap2)}>
      <View>
        <AppText variant="title">{title}</AppText>
        {description ? (
          <AppText variant="caption" color="muted">
            {description}
          </AppText>
        ) : null}
      </View>

      <Card variant="outlined" padded={false}>
        {items.map((item, index) => (
          <View key={item.key}>
            {index > 0 ? <Divider /> : null}
            <ListItem
              title={item.title}
              subtitle={item.subtitle}
              onPress={item.onPress}
              showChevron
            />
          </View>
        ))}
      </Card>
    </View>
  );
}
