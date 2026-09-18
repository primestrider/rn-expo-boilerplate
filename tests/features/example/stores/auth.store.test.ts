import { act } from "@testing-library/react-native";

import type { DummyLoginResponse } from "@/features/example/models/api.model";
import {
  selectFullName,
  selectIsAuthenticated,
  useAuthStore,
} from "@/features/example/stores/auth.store";
import { mmkvStorage, storageKeys } from "@/plugins/mmkv";

const response: DummyLoginResponse = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  gender: "female",
  image: "https://example.com/emily.png",
  accessToken: "access-token-1",
  refreshToken: "refresh-token-1",
};

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() => useAuthStore.setState({ user: null }));
});

describe("useAuthStore", () => {
  it("starts signed out", () => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });

  it("keeps the profile from the login response", () => {
    act(() => useAuthStore.getState().signIn(response));

    expect(useAuthStore.getState().user).toEqual({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      image: "https://example.com/emily.png",
    });
  });

  it("does not keep the tokens on the profile", () => {
    act(() => useAuthStore.getState().signIn(response));

    expect(useAuthStore.getState().user).not.toHaveProperty("accessToken");
    expect(useAuthStore.getState().user).not.toHaveProperty("refreshToken");
  });

  it("writes the tokens where the Axios interceptor reads them", () => {
    act(() => useAuthStore.getState().signIn(response));

    expect(mmkvStorage.getString(storageKeys.auth.accessToken)).toBe("access-token-1");
    expect(mmkvStorage.getString(storageKeys.auth.refreshToken)).toBe("refresh-token-1");
  });

  it("reports an authenticated session", () => {
    act(() => useAuthStore.getState().signIn(response));

    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
  });

  it("builds a full name, and an empty one when signed out", () => {
    expect(selectFullName(useAuthStore.getState())).toBe("");

    act(() => useAuthStore.getState().signIn(response));

    expect(selectFullName(useAuthStore.getState())).toBe("Emily Johnson");
  });

  it("clears the tokens on sign out", () => {
    act(() => useAuthStore.getState().signIn(response));
    act(() => useAuthStore.getState().signOut());

    expect(mmkvStorage.getString(storageKeys.auth.accessToken)).toBeUndefined();
    expect(mmkvStorage.getString(storageKeys.auth.refreshToken)).toBeUndefined();
  });

  it("clears the profile on sign out", () => {
    act(() => useAuthStore.getState().signIn(response));
    act(() => useAuthStore.getState().signOut());

    expect(useAuthStore.getState().user).toBeNull();
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });

  it("persists the profile so a restart stays signed in", () => {
    act(() => useAuthStore.getState().signIn(response));

    const persisted = mmkvStorage.getString("example.auth");

    expect(persisted).toBeDefined();
    expect(persisted).toContain("emilys");
  });
});
