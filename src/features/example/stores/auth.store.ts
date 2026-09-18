import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage, storageKeys } from "@/plugins/mmkv";
import { zustandStorage } from "@/plugins/mmkv/zustand";

import type { DummyLoginResponse } from "../models/api.model";

export type ExampleAuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

type AuthState = {
  user: ExampleAuthUser | null;
  signIn: (response: DummyLoginResponse) => void;
  signOut: () => void;
};

/**
 * The signed-in session.
 *
 * The profile is persisted through Zustand, but the tokens are written
 * straight to `storageKeys.auth` — that is where the Axios interceptor looks
 * for them, and it has no knowledge of this store. Keeping them in the store's
 * own persisted blob would hide them from every request.
 *
 * @example
 * const { user, signOut } = useAuthStore();
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      signIn: (response) => {
        mmkvStorage.set(storageKeys.auth.accessToken, response.accessToken);
        mmkvStorage.set(storageKeys.auth.refreshToken, response.refreshToken);

        set({
          user: {
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            image: response.image,
          },
        });
      },

      signOut: () => {
        mmkvStorage.remove(storageKeys.auth.accessToken);
        mmkvStorage.remove(storageKeys.auth.refreshToken);

        set({ user: null });
      },
    }),
    {
      name: "example.auth",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

/** True once a session exists. Use with `useAuthStore(selectIsAuthenticated)`. */
export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.user !== null;

/** The signed-in user's display name, or an empty string when signed out. */
export const selectFullName = (state: AuthState): string =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : "";
