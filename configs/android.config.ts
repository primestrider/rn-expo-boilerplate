import type { ExpoConfig } from "expo/config";

import packageJson from "../package.json";

function getVersionCode(version: string): number {
  const [major, minor, patch] = version.split(".").map(Number);

  return major * 10000 + minor * 100 + patch;
}

export const androidConfig: ExpoConfig["android"] = {
  package: "com.primestrider.rnexpoboilerplate",

  versionCode: getVersionCode(packageJson.version),

  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png",
  },

  predictiveBackGestureEnabled: false,
};
