import { ConfigPlugin } from "expo/config-plugins";

export const withIOSConfig: ConfigPlugin = (config) => {
  config.ios = {
    ...config.ios,
    icon: "./assets/expo.icon",
  };

  return config;
};
