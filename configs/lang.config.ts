import { ConfigPlugin } from "expo/config-plugins";

export const withLanguageConfig: ConfigPlugin = (config) => {
  config.extra = {
    ...config.extra,

    localization: {
      defaultLocale: "id",
      supportedLocales: ["id", "en"],
    },
  };

  return config;
};
