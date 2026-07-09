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
import { cx, space, tx, vx } from "./helpers";
import type { Utilities } from "./types";

/**
 * Utility styles — API mirip Tailwind, tapi pakai StyleSheet bawaan React Native.
 *
 * @example
 * import { u, cx } from '@/styles';
 *
 * <View style={cx(u.flex1, u.p4, u.bgBackground)}>
 *   <Text style={tx(u.textLg, u.fontBold, u.textForeground)}>Hello</Text>
 * </View>
 */
export const u = {
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

export { cx, space, tx, vx, gridCol };

// Re-export tokens untuk akses langsung
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
