import { createMMKV } from "react-native-mmkv";

export const mmkvStorage = createMMKV({
  id: "app-mmkv-storage",
});

export * from "./keys";
