import { ExpoConfig } from "expo/config";

import { fontPlugin } from "./font.config";
import { localesPlugin } from "./locales.config";

export const plugins: NonNullable<ExpoConfig["plugins"]> = [
  "expo-router",

  [
    "expo-splash-screen",
    {
      backgroundColor: "#208AEF",
      android: {
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    },
  ],

  fontPlugin as [string, any],
  localesPlugin as [string, any],
];
