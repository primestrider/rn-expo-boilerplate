import { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function AppGestureHandlerProvider({
  children,
}: Readonly<PropsWithChildren>) {
  return <GestureHandlerRootView>{children}</GestureHandlerRootView>;
}
