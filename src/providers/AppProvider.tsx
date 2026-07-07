import type { PropsWithChildren } from "react";

import { AppKeyboardProvider } from "@/plugins/keyboard/provider";
import { AppQueryProvider } from "@/plugins/react-query/provider";

export function AppProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <AppQueryProvider>
      <AppKeyboardProvider>{children}</AppKeyboardProvider>
    </AppQueryProvider>
  );
}
