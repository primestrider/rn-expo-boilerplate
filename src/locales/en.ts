/**
 * English translations — the reference shape every other language follows.
 * Values stay widened to `string` so translations can differ per language
 * while the key structure is still enforced at compile time.
 */
export const en = {
  common: {
    appName: "RN Expo Boilerplate",
    language: "Language",

    action: {
      save: "Save",
      cancel: "Cancel",
      submit: "Submit",
      clear: "Clear",
      retry: "Try again",
      delete: "Delete",
      close: "Close",
    },

    state: {
      loading: "Loading…",
      empty: "Nothing here yet",
      offline: "You are offline",
    },

    form: {
      required: "{{field}} is required",
      invalidEmail: "Enter a valid email address",
      minLength: "{{field}} must be at least {{count}} characters",
      maxLength: "{{field}} must be at most {{count}} characters",
    },

    error: {
      generic: "Something went wrong. Please try again.",
      network: "Cannot reach the server. Check your connection.",
      unauthorized: "Your session has expired. Please sign in again.",
    },
  },
};
