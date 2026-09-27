import { Stack } from "expo-router";

// Routes cannot take a `.android.tsx` suffix, so the Compose tree lives in the
// feature folder and platform resolution happens on this import.
import { ComposeShowcase } from "@/features/example/components/ComposeShowcase";
import { Screen } from "@/shared/components";

export default function NativeAndroidComponents() {
  return (
    <>
      <Stack.Screen options={{ title: "Native UI · Android" }} />
      <Screen>
        <ComposeShowcase />
      </Screen>
    </>
  );
}
