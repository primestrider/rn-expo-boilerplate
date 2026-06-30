import { ConfigPlugin, withPlugins } from "expo/config-plugins";

export const withFontConfig: ConfigPlugin = (config) =>
  withPlugins(config, [
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/PlusJakartaSans-Light.ttf",
          "./assets/fonts/PlusJakartaSans-LightItalic.ttf",

          "./assets/fonts/PlusJakartaSans-Regular.ttf",
          "./assets/fonts/PlusJakartaSans-Italic.ttf",

          "./assets/fonts/PlusJakartaSans-Medium.ttf",
          "./assets/fonts/PlusJakartaSans-MediumItalic.ttf",

          "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
          "./assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf",

          "./assets/fonts/PlusJakartaSans-Bold.ttf",
          "./assets/fonts/PlusJakartaSans-BoldItalic.ttf",

          "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
          "./assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf",

          "./assets/fonts/PlusJakartaSans-ExtraLight.ttf",
          "./assets/fonts/PlusJakartaSans-ExtraLightItalic.ttf",
        ],
      },
    ],
  ]);
