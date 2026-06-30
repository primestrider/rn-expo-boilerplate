import { ConfigPlugin } from "expo/config-plugins";

export const withAndroidConfig: ConfigPlugin = (config) => {
  config.android = {
    ...config.android,

    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },

    predictiveBackGestureEnabled: false,
  };

  return config;
};
