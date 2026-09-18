import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { appFonts } from "@/plugins/fonts";
import { AppProvider } from "@/providers/AppProvider";
import { useTheme } from "@/styles";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const { colors, isDark } = useTheme();

  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Paints the window behind the React tree, so rotating or pushing a screen
  // never flashes the default white.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors]);

  // Keep the splash screen up rather than flashing fallback system fonts.
  if (!isReady) return null;

  return (
    <AppProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AppProvider>
  );
}
