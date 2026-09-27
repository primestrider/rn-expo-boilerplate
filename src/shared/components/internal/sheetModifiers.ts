import type { BottomSheetProps } from "@expo/ui";

/**
 * Android and web have no swipe to disable here — `BottomSheet` turns off the
 * scrim and back press through its own props instead.
 */
export const lockedSheetModifiers: NonNullable<BottomSheetProps["modifiers"]> = [];
