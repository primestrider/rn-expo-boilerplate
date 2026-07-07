import { PropsWithChildren } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export function AppKeyboardProvider({ children }: Readonly<PropsWithChildren>) {
  return <KeyboardProvider>{children}</KeyboardProvider>;
}
