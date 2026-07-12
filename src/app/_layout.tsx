import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AppProvider } from "@/providers/AppProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack />
    </AppProvider>
  );
}
