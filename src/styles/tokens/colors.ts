export const palette = {
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Brand — dari splash screen (#208AEF)
  primary: {
    50: "#E8F4FE",
    100: "#C5E4FC",
    200: "#9ED0FA",
    300: "#6BB8F7",
    400: "#3A9FF2",
    500: "#208AEF",
    600: "#1A73D4",
    700: "#155CB0",
    800: "#10478C",
    900: "#0B3368",
  },

  // Neutral (slate-like)
  gray: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },

  // Semantic
  success: {
    50: "#F0FDF4",
    500: "#22C55E",
    700: "#15803D",
  },
  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    700: "#B45309",
  },
  error: {
    50: "#FEF2F2",
    500: "#EF4444",
    700: "#B91C1C",
  },
  info: {
    50: "#EFF6FF",
    500: "#3B82F6",
    700: "#1D4ED8",
  },
} as const;

/** Semantic color aliases untuk light mode */
export const colors = {
  background: palette.white,
  foreground: palette.gray[900],
  muted: palette.gray[500],
  mutedForeground: palette.gray[400],
  border: palette.gray[200],
  card: palette.white,
  cardForeground: palette.gray[900],
  primary: palette.primary[500],
  primaryForeground: palette.white,
  secondary: palette.gray[100],
  secondaryForeground: palette.gray[900],
  destructive: palette.error[500],
  destructiveForeground: palette.white,
  success: palette.success[500],
  warning: palette.warning[500],
  info: palette.info[500],
} as const;

/** Semantic color aliases untuk dark mode */
export const darkColors = {
  background: palette.gray[950],
  foreground: palette.gray[50],
  muted: palette.gray[400],
  mutedForeground: palette.gray[500],
  border: palette.gray[800],
  card: palette.gray[900],
  cardForeground: palette.gray[50],
  primary: palette.primary[400],
  primaryForeground: palette.gray[950],
  secondary: palette.gray[800],
  secondaryForeground: palette.gray[50],
  destructive: palette.error[500],
  destructiveForeground: palette.white,
  success: palette.success[500],
  warning: palette.warning[500],
  info: palette.info[500],
} as const;

export type ColorToken = keyof typeof colors;
export type PaletteColor = keyof typeof palette;
