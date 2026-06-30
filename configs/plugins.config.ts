import { ConfigPlugin, withPlugins } from "expo/config-plugins";

export const withAppPlugins: ConfigPlugin = (config) =>
  withPlugins(config, [
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
  ]);
