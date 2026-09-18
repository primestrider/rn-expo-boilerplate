import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { appFonts } from "@/plugins/fonts";
import { AppProvider } from "@/providers/AppProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Keep the splash screen up rather than flashing fallback system fonts.
  if (!isReady) return null;

  return (
    <AppProvider>
      <Stack />
    </AppProvider>
  );
}
