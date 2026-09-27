import { ProgressBar } from "@/shared/components/ProgressBar";
import { Spinner } from "@/shared/components/Spinner";

import type { ProgressIndicatorProps } from "./ProgressIndicator.types";

export type { ProgressIndicatorProps };

/**
 * Progress indicator. Android renders Material 3's own (see
 * `ProgressIndicator.android.tsx`); `@expo/ui` has no universal equivalent, so
 * iOS and web fall back to the app's `ProgressBar` and `Spinner`.
 *
 * `Spinner` is always indeterminate, so a circular `value` only shows on
 * Android.
 *
 * @example
 * <ProgressIndicator value={0.4} />
 * <ProgressIndicator type="circular" />
 */
export function ProgressIndicator({
  type = "linear",
  value,
  style,
  testID,
}: Readonly<ProgressIndicatorProps>) {
  if (type === "circular") return <Spinner style={style} testID={testID} />;

  return (
    <ProgressBar
      style={style}
      testID={testID}
      value={value}
      indeterminate={value === undefined}
    />
  );
}
