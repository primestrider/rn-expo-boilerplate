import { StyleSheet } from "react-native";

import { colors, palette, radii } from "../tokens";

export const appearance = StyleSheet.create({
  // Background — semantic
  bgBackground: { backgroundColor: colors.background },
  bgForeground: { backgroundColor: colors.foreground },
  bgPrimary: { backgroundColor: colors.primary },
  bgSecondary: { backgroundColor: colors.secondary },
  bgMuted: { backgroundColor: colors.muted },
  bgCard: { backgroundColor: colors.card },
  bgDestructive: { backgroundColor: colors.destructive },
  bgTransparent: { backgroundColor: palette.transparent },
  bgWhite: { backgroundColor: palette.white },
  bgBlack: { backgroundColor: palette.black },

  // Background — palette primary
  bgPrimary50: { backgroundColor: palette.primary[50] },
  bgPrimary100: { backgroundColor: palette.primary[100] },
  bgPrimary500: { backgroundColor: palette.primary[500] },
  bgPrimary600: { backgroundColor: palette.primary[600] },

  // Background — palette gray
  bgGray50: { backgroundColor: palette.gray[50] },
  bgGray100: { backgroundColor: palette.gray[100] },
  bgGray200: { backgroundColor: palette.gray[200] },
  bgGray500: { backgroundColor: palette.gray[500] },
  bgGray800: { backgroundColor: palette.gray[800] },
  bgGray900: { backgroundColor: palette.gray[900] },

  // Background — semantic colors
  bgSuccess: { backgroundColor: palette.success[500] },
  bgWarning: { backgroundColor: palette.warning[500] },
  bgError: { backgroundColor: palette.error[500] },
  bgInfo: { backgroundColor: palette.info[500] },

  // Text color — semantic
  textForeground: { color: colors.foreground },
  textPrimary: { color: colors.primary },
  textSecondary: { color: colors.secondaryForeground },
  textMuted: { color: colors.muted },
  textMutedForeground: { color: colors.mutedForeground },
  textDestructive: { color: colors.destructive },
  textWhite: { color: palette.white },
  textBlack: { color: palette.black },

  // Text color — palette
  textPrimary500: { color: palette.primary[500] },
  textGray400: { color: palette.gray[400] },
  textGray500: { color: palette.gray[500] },
  textGray600: { color: palette.gray[600] },
  textGray700: { color: palette.gray[700] },
  textGray900: { color: palette.gray[900] },
  textSuccess: { color: palette.success[700] },
  textWarning: { color: palette.warning[700] },
  textError: { color: palette.error[700] },

  // Border
  border0: { borderWidth: 0 },
  border: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border4: { borderWidth: 4 },
  borderT: { borderTopWidth: 1 },
  borderR: { borderRightWidth: 1 },
  borderB: { borderBottomWidth: 1 },
  borderL: { borderLeftWidth: 1 },

  borderBorder: { borderColor: colors.border },
  borderPrimary: { borderColor: colors.primary },
  borderGray200: { borderColor: palette.gray[200] },
  borderGray300: { borderColor: palette.gray[300] },
  borderTransparent: { borderColor: palette.transparent },

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

  // Shadow (iOS + Android elevation)
  shadowSm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadow: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowMd: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  shadowLg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowNone: {
    shadowColor: palette.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
