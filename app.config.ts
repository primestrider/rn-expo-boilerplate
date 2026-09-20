import "tsx/cjs"; // Add this to import TypeScript files

import { ExpoConfig } from "expo/config";
import { androidConfig } from "./configs/android.config";
import { iosConfig } from "./configs/ios.config";
import { plugins } from "./configs/plugins.config";
import { withReleaseSigning } from "./configs/signing.config";
import { webConfig } from "./configs/web.config";
import packageJson from "./package.json";

const config: ExpoConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME ?? packageJson.name,
  slug: "rn-expo-boilerplate",
  version: packageJson.version,

  orientation: "portrait",
  icon: "./assets/images/icon.png",

  scheme: "rnexpoboilerplate",
  userInterfaceStyle: "automatic",

  android: androidConfig,
  ios: iosConfig,
  web: webConfig,

  plugins,

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

/**
 * Plugin diterapkan langsung ke config, bukan lewat array `plugins`:
 * `ExpoConfig["plugins"]` bertipe `(string | [] | [string] | [string, any])[]`,
 * yang tidak menerima fungsi — itu sebabnya `plugins.config.ts` harus menulis
 * `fontPlugin as [string, any]`. Bentuk ini lolos type-check tanpa cast.
 */
export default withReleaseSigning(config);
