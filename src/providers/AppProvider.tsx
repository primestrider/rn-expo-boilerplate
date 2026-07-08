import type { PropsWithChildren } from "react";

import { AppKeyboardProvider } from "@/plugins/keyboard/provider";
import { AppQueryProvider } from "@/plugins/react-query/provider";
import { AppSafeAreaProvider } from "@/plugins/safe-area/provider";

export function AppProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <AppSafeAreaProvider>
      <AppQueryProvider>
        <AppKeyboardProvider>{children}</AppKeyboardProvider>
      </AppQueryProvider>
    </AppSafeAreaProvider>
  );
}
