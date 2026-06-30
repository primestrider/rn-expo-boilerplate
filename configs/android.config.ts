import { ExpoConfig } from "expo/config";

export const androidConfig: ExpoConfig["android"] = {
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png",
  },

  predictiveBackGestureEnabled: false,
};
