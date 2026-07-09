import { Stack } from "expo-router";

export default function ExampleLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#0F172A",
        headerTitleStyle: { fontWeight: "600" },
        headerBackTitle: "Back",
      }}
    />
  );
}
