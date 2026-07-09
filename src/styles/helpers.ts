import type {
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

type Falsy = false | null | undefined | "";

function filterStyles<T extends ViewStyle | TextStyle | ImageStyle>(
  styles: (StyleProp<T> | Falsy)[]
): StyleProp<T> {
  const filtered = styles.filter(
    (style): style is NonNullable<typeof style> =>
      style !== false && style != null && style !== ""
  );

  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return filtered as StyleProp<T>;
}

/**
 * Gabungkan style utilities untuk View / Pressable / ScrollView.
 *
 * @example
 * <View style={cx(u.flex1, u.p4, isActive && u.bgPrimary)} />
 */
export function cx(
  ...styles: (StyleProp<ViewStyle> | Falsy)[]
): StyleProp<ViewStyle> {
  return filterStyles(styles);
}

/**
 * Gabungkan style utilities untuk Text.
 *
 * @example
 * <Text style={tx(u.textLg, u.fontBold, u.textForeground, u.mb2)} />
 */
export function tx(
  ...styles: (StyleProp<TextStyle> | Falsy)[]
): StyleProp<TextStyle> {
  return filterStyles(styles);
}

/** @deprecated Gunakan `cx` — alias untuk kompatibilitas */
export const vx = cx;

/**
 * Buat style dinamis dari token spacing.
 *
 * @example
 * <View style={cx(u.p4, space('p', 6))} />
 */
export function space(
  type:
    | "p"
    | "m"
    | "px"
    | "py"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "mx"
    | "my"
    | "mt"
    | "mr"
    | "mb"
    | "ml",
  value: number
): ViewStyle & TextStyle {
  const map: Record<string, keyof (ViewStyle & TextStyle)> = {
    p: "padding",
    m: "margin",
    px: "paddingHorizontal",
    py: "paddingVertical",
    pt: "paddingTop",
    pr: "paddingRight",
    pb: "paddingBottom",
    pl: "paddingLeft",
    mx: "marginHorizontal",
    my: "marginVertical",
    mt: "marginTop",
    mr: "marginRight",
    mb: "marginBottom",
    ml: "marginLeft",
  };

  return { [map[type]]: value };
}
