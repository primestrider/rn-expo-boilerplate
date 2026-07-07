export const storageKeys = {
  auth: {
    accessToken: "auth.access_token",
    refreshToken: "auth.refresh_token",
  },

  app: {
    theme: "settings.theme",
    language: "settings.language",
  },
} as const;
