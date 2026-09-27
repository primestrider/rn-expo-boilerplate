import { Host, type UniversalHostProps } from "@expo/ui";

import { useTheme } from "@/styles";

export type NativeHostProps = UniversalHostProps;

/**
 * `@expo/ui`'s `Host`, pre-themed: it follows the app's light/dark choice
 * (not just the device's) and seeds the native palette from `colors.primary`,
 * so SwiftUI tints and the Material 3 scheme match the rest of the app.
 *
 * Every `@expo/ui` tree needs a host — use this one instead of the bare
 * `Host`. Either prop can still be overridden per tree.
 *
 * @example
 * <NativeHost matchContents>
 *   <Slider value={volume} onValueChange={setVolume} />
 * </NativeHost>
 */
export function NativeHost(props: Readonly<NativeHostProps>) {
  const { colors, scheme } = useTheme();

  return <Host colorScheme={scheme} seedColor={colors.primary} {...props} />;
}
