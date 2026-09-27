import { interactiveDismissDisabled } from "@expo/ui/swift-ui/modifiers";

/**
 * Modifiers that pin a native sheet open. iOS only: the SwiftUI modifier
 * module must never load on Android, where it crashes at import.
 */
export const lockedSheetModifiers = [interactiveDismissDisabled()];
