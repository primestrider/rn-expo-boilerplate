import type { PropsWithChildren } from "react";

import { AppGestureHandlerProvider } from "@/plugins/gesture-handler/provider";
import { AppKeyboardProvider } from "@/plugins/keyboard/provider";
import { AppQueryProvider } from "@/plugins/react-query/provider";
import { AppSafeAreaProvider } from "@/plugins/safe-area/provider";

/**
 * Root provider that composes all app-level context providers.
 * Order matters: GestureHandler → SafeArea → Query → Keyboard
 */
export function AppProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <AppGestureHandlerProvider>
      <AppSafeAreaProvider>
        <AppQueryProvider>
          <AppKeyboardProvider>{children}</AppKeyboardProvider>
        </AppQueryProvider>
      </AppSafeAreaProvider>
    </AppGestureHandlerProvider>
  );
}
