import { ConfigPlugin } from "expo/config-plugins";

export const withWebConfig: ConfigPlugin = (config) => {
  config.web = {
    ...config.web,
    output: "static",
    favicon: "./assets/images/favicon.png",
  };

  return config;
};
