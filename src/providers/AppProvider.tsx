import type { PropsWithChildren } from "react";

import { AppGestureHandlerProvider } from "@/plugins/gesture-handler/provider";
import { AppI18nProvider } from "@/plugins/i18n/provider";
import { AppKeyboardProvider } from "@/plugins/keyboard/provider";
import { AppQueryProvider } from "@/plugins/react-query/provider";
import { AppSafeAreaProvider } from "@/plugins/safe-area/provider";

/**
 * Root provider that composes all app-level context providers.
 * Order matters: GestureHandler → SafeArea → I18n → Query → Keyboard
 */
export function AppProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <AppGestureHandlerProvider>
      <AppSafeAreaProvider>
        <AppI18nProvider>
          <AppQueryProvider>
            <AppKeyboardProvider>{children}</AppKeyboardProvider>
          </AppQueryProvider>
        </AppI18nProvider>
      </AppSafeAreaProvider>
    </AppGestureHandlerProvider>
  );
}
