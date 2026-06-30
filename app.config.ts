import { ExpoConfig } from "expo/config";
import { withPlugins } from "expo/config-plugins";

import { withAndroidConfig } from "./configs/android.config";
import { withFontConfig } from "./configs/font.config";
import { withIOSConfig } from "./configs/ios.config";
import { withLanguageConfig } from "./configs/lang.config";
import { withAppPlugins } from "./configs/plugins.config";
import { withWebConfig } from "./configs/web.config";

export default (): ExpoConfig =>
  withPlugins(
    {
      name: "rn-expo-boilerplate",
      slug: "rn-expo-boilerplate",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "rnexpoboilerplate",
      userInterfaceStyle: "automatic",

      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
    },

    [
      withAndroidConfig,
      withIOSConfig,
      withWebConfig,
      withFontConfig,
      withLanguageConfig,
      withAppPlugins,
    ]
  );
