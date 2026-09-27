import { ExpoConfig } from "expo/config";

import { fontPlugin } from "./font.config";
import { localesPlugin } from "./locales.config";

export const plugins: NonNullable<ExpoConfig["plugins"]> = [
  "expo-router",

  // Required as of SDK 57 — these packages ship config plugins that must be
  // registered explicitly for native autolinking.
  "expo-image",
  "expo-status-bar",
  "expo-web-browser",

  // SDK examples — each plugin writes the permission strings iOS requires
  // and the matching Android manifest permissions.
  [
    "expo-camera",
    {
      cameraPermission: "Allow $(PRODUCT_NAME) to use the camera.",
      microphonePermission: false,
      recordAudioAndroid: false,
    },
  ],
  [
    "expo-image-picker",
    {
      photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
      cameraPermission: "Allow $(PRODUCT_NAME) to take photos.",
      microphonePermission: false,
    },
  ],
  [
    "expo-location",
    {
      locationWhenInUsePermission:
        "Allow $(PRODUCT_NAME) to show your location.",
    },
  ],
  [
    "expo-local-authentication",
    { faceIDPermission: "Allow $(PRODUCT_NAME) to sign you in with Face ID." },
  ],
  "expo-secure-store",
  [
    "expo-contacts",
    { contactsPermission: "Allow $(PRODUCT_NAME) to read your contacts." },
  ],
  "expo-notifications",
  "expo-sharing",
  "expo-file-system",
  "expo-sqlite",
  "expo-video",
  "expo-background-task",
  [
    "expo-audio",
    {
      microphonePermission: "Allow $(PRODUCT_NAME) to record voice notes.",
    },
  ],
  [
    "expo-calendar",
    {
      calendarPermission: "Allow $(PRODUCT_NAME) to add bookings to your calendar.",
    },
  ],
  // expo-brightness is not listed: Expo applies its plugin automatically, and
  // the WRITE_SETTINGS permission it adds is blocked in android.config.ts.

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
