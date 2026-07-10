import {
  appearance,
  fixedSize,
  gap,
  grid,
  gridCol,
  layout,
  margin,
  negativeMargin,
  padding,
  sizing,
  typography,
} from "./utils";
import { space, view, vx, text } from "./helpers";
import type { Utilities } from "./types";

/**
 * Utility styles — Tailwind-like API using React Native's built-in StyleSheet.
 *
 * @example
 * import { styles, view } from '@/styles';
 *
 * <View style={view(styles.flex1, styles.p4, styles.bgBackground)}>
 *   <Text style={text(styles.textLg, styles.fontBold, styles.textForeground)}>Hello</Text>
 * </View>
 */
export const styles = {
  ...layout,
  ...gap,
  ...grid,
  ...padding,
  ...margin,
  ...negativeMargin,
  ...sizing,
  ...fixedSize,
  ...typography,
  ...appearance,
} as Utilities;

export { view, space, text, vx, gridCol };

// Re-export tokens for direct access
export * from "./tokens";

// Re-export individual utility groups
export {
  layout,
  gap,
  grid,
  padding,
  margin,
  negativeMargin,
  sizing,
  fixedSize,
  typography,
  appearance,
} from "./utils";
