import type { StateStorage } from "zustand/middleware";

import { mmkvStorage } from "./index";

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    mmkvStorage.set(name, value);
  },

  getItem: (name) => {
    return mmkvStorage.getString(name) ?? null;
  },

  removeItem: (name) => {
    mmkvStorage.remove(name);
  },
};
