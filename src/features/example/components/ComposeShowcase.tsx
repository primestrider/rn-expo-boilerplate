import { Platform } from "react-native";

import { Alert } from "@/shared/components";

/**
 * iOS and web stand-in for `ComposeShowcase.android.tsx`. Jetpack Compose only
 * exists on Android — importing it anywhere else crashes — so this says where
 * to look instead of rendering it.
 */
export function ComposeShowcase() {
  return (
    <Alert
      variant="info"
      title="Android only"
      description={`These are Jetpack Compose components, so they render on Android only (this is ${Platform.OS}). The Universal page shows the cross-platform set.`}
    />
  );
}
