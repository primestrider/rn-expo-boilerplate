import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { useTheme } from "@/styles";

import { NativeHost } from "./NativeHost";
import type { ProgressIndicatorProps } from "./ProgressIndicator.types";

export type { ProgressIndicatorProps };

/**
 * Material 3 progress indicator (Jetpack Compose). iOS and web use the
 * `ProgressIndicator.tsx` sibling, which falls back to the app's own
 * `ProgressBar` / `Spinner`.
 */
export function ProgressIndicator({
  type = "linear",
  value,
  style,
  testID,
}: Readonly<ProgressIndicatorProps>) {
  const { colors } = useTheme();

  // `null` is Compose's indeterminate mode.
  const progress =
    value === undefined ? null : Math.min(1, Math.max(0, value));

  return (
    <NativeHost
      testID={testID}
      style={style}
      // A bar spans its parent's width; a ring keeps its own size.
      matchContents={type === "linear" ? { vertical: true } : true}
    >
      {type === "linear" ? (
        <LinearProgressIndicator
          progress={progress}
          color={colors.primary}
          trackColor={colors.secondary}
          modifiers={[fillMaxWidth()]}
        />
      ) : (
        <CircularProgressIndicator
          progress={progress}
          color={colors.primary}
          trackColor={colors.secondary}
        />
      )}
    </NativeHost>
  );
}
