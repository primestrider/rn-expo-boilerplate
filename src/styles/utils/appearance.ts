import { StyleSheet } from "react-native";

import { colors, palette, radii } from "../tokens";

type ColorShadeObject = {
  [shade: string]: string;
};

/**
 * Generate background, text, or border color utilities from the palette.
 * Creates entries like `bgRed500`, `textBlue200`, `borderGray300` for every color×shade combination.
 */
function buildColorUtilities<K extends string>(
  prefix: K,
  property: "backgroundColor" | "color" | "borderColor"
): Record<string, { [P in typeof property]: string }> {
  const styles: Record<string, { [P in typeof property]: string }> = {};

  for (const [colorName, value] of Object.entries(palette)) {
    if (typeof value === "string") {
      // Single color value (white, black, transparent)
      styles[`${prefix}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`] = {
        [property]: value,
      } as any;
    } else {
      // Color shade object (red, blue, gray, etc.)
      const shades = value as Record<string, string | ColorShadeObject>;
      for (const [shade, colorValue] of Object.entries(shades)) {
        if (typeof colorValue === "string") {
          styles[`${prefix}${colorName.charAt(0).toUpperCase() + colorName.slice(1)}${shade}`] = {
            [property]: colorValue,
          } as any;
        }
      }
    }
  }

  return styles;
}

export const appearance = StyleSheet.create({
  ...buildColorUtilities("bg", "backgroundColor"),
  ...buildColorUtilities("text", "color"),
  ...buildColorUtilities("border", "borderColor"),

  // Background — semantic
  bgBackground: { backgroundColor: colors.background },
  bgForeground: { backgroundColor: colors.foreground },
  bgPrimary: { backgroundColor: colors.primary },
  bgSecondary: { backgroundColor: colors.secondary },
  bgMuted: { backgroundColor: colors.muted },
  bgCard: { backgroundColor: colors.card },
  bgDestructive: { backgroundColor: colors.destructive },
  bgError: { backgroundColor: colors.destructive },
  bgSuccess: { backgroundColor: colors.success },
  bgWarning: { backgroundColor: colors.warning },
  bgInfo: { backgroundColor: colors.info },

  // Text color — semantic
  textForeground: { color: colors.foreground },
  textPrimary: { color: colors.primary },
  textSecondary: { color: colors.secondaryForeground },
  textMuted: { color: colors.muted },
  textMutedForeground: { color: colors.mutedForeground },
  textDestructive: { color: colors.destructive },
  textSuccess: { color: colors.success },
  textWarning: { color: colors.warning },
  textError: { color: colors.destructive },

  // Border — semantic
  borderBorder: { borderColor: colors.border },
  borderPrimary: { borderColor: colors.primary },
  borderDestructive: { borderColor: colors.destructive },
  borderSuccess: { borderColor: colors.success },
  borderWarning: { borderColor: colors.warning },
  borderInfo: { borderColor: colors.info },

  // Border Width
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  borderT: { borderTopWidth: 1 },
  borderR: { borderRightWidth: 1 },
  borderB: { borderBottomWidth: 1 },
  borderL: { borderLeftWidth: 1 },

  // Border Radius
  roundedNone: { borderRadius: radii.none },
  roundedSm: { borderRadius: radii.sm },
  rounded: { borderRadius: radii.DEFAULT },
  roundedMd: { borderRadius: radii.md },
  roundedLg: { borderRadius: radii.lg },
  roundedXl: { borderRadius: radii.xl },
  rounded2xl: { borderRadius: radii["2xl"] },
  rounded3xl: { borderRadius: radii["3xl"] },
  roundedFull: { borderRadius: radii.full },

  // Individual corners
  roundedT: {
    borderTopLeftRadius: radii.DEFAULT,
    borderTopRightRadius: radii.DEFAULT,
  },
  roundedB: {
    borderBottomLeftRadius: radii.DEFAULT,
    borderBottomRightRadius: radii.DEFAULT,
  },
  roundedL: {
    borderTopLeftRadius: radii.DEFAULT,
    borderBottomLeftRadius: radii.DEFAULT,
  },
  roundedR: {
    borderTopRightRadius: radii.DEFAULT,
    borderBottomRightRadius: radii.DEFAULT,
  },

  // Opacity
  opacity0: { opacity: 0 },
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opacity100: { opacity: 1 },

  // Shadow
  shadowSm: {
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    elevation: 1,
  },
  shadow: {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    elevation: 3,
  },
  shadowMd: {
    boxShadow: "0 4px 6px rgba(0,0,0,0.12)",
    elevation: 5,
  },
  shadowLg: {
    boxShadow: "0 8px 12px rgba(0,0,0,0.15)",
    elevation: 8,
  },
  shadowNone: {
    boxShadow: "none",
    elevation: 0,
  },
});
