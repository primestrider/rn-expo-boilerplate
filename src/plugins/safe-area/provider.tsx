import type { PropsWithChildren } from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";

export function AppSafeAreaProvider({ children }: Readonly<PropsWithChildren>) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
