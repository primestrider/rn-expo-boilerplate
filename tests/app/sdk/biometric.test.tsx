import { TextInput } from "@expo/ui";
import { act, render, screen } from "@testing-library/react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import type { ReactNode } from "react";

import BiometricExample from "@/app/(public)/example/sdk/biometric";

import {
  infoValue,
  nativeButton,
  pressNative,
  toggleNative,
  typeNative,
} from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-local-authentication", () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

// An in-memory keychain, so saving and reading back behave like the real one.
jest.mock("expo-secure-store", () => {
  const mockStore = new Map<string, string>();
  return {
    mockStore,
    isAvailableAsync: jest.fn(async () => true),
    getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  };
});

const auth = jest.mocked(LocalAuthentication);
const store = jest.mocked(SecureStore);
const keychain = (jest.requireMock("expo-secure-store") as { mockStore: Map<string, string> })
  .mockStore;

const PIN_KEY = "example.pin";

async function renderScreen() {
  render(<BiometricExample />);
  // Let the capability checks on mount resolve.
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  keychain.clear();
  auth.hasHardwareAsync.mockResolvedValue(true);
  auth.isEnrolledAsync.mockResolvedValue(true);
  auth.supportedAuthenticationTypesAsync.mockResolvedValue([1, 2]);
  auth.authenticateAsync.mockResolvedValue({ success: true });
});

describe("Biometric & Secure Store example", () => {
  it("reports what the device supports", async () => {
    await renderScreen();

    expect(infoValue("Biometric hardware")).toBe("Yes");
    expect(infoValue("Enrolled")).toBe("Yes");
    expect(infoValue("Types")).toBe("Fingerprint, Face");
    expect(infoValue("Secure storage")).toBe("Available");
  });

  it("disables biometric actions on a device without enrolment", async () => {
    auth.isEnrolledAsync.mockResolvedValue(false);
    await renderScreen();

    expect(nativeButton("Verify it's me").props.disabled).toBe(true);
  });

  it("verifies the user, with or without the passcode fallback", async () => {
    await renderScreen();

    await pressNative("Verify it's me");

    expect(auth.authenticateAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ disableDeviceFallback: false }),
    );
    expect(screen.getByText("Verified.")).toBeOnTheScreen();

    await toggleNative("Allow device passcode fallback", false);
    await pressNative("Verify it's me");

    expect(auth.authenticateAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ disableDeviceFallback: true }),
    );
  });

  it("rejects a PIN that is not six digits", async () => {
    await renderScreen();

    await typeNative("12a");
    await pressNative("Save");

    expect(store.setItemAsync).not.toHaveBeenCalled();
    expect(screen.getByText("PIN must be exactly 6 digits.")).toBeOnTheScreen();
  });

  it("saves a valid PIN to secure storage", async () => {
    await renderScreen();

    expect(nativeButton("Reveal").props.disabled).toBe(true);

    await typeNative("123456");
    await pressNative("Save");

    expect(store.setItemAsync).toHaveBeenCalledWith(PIN_KEY, "123456");
    expect(screen.getByText("PIN saved to secure storage.")).toBeOnTheScreen();
    // The typed PIN does not linger in the field.
    expect(screen.UNSAFE_getByType(TextInput).props.value.value).toBe("");
    expect(nativeButton("Reveal").props.disabled).toBe(false);
  });

  it("reveals the stored PIN only after biometric verification", async () => {
    keychain.set(PIN_KEY, "654321");
    await renderScreen();

    await pressNative("Reveal");

    expect(auth.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: "Confirm to reveal your PIN" }),
    );
    expect(screen.getByText("Stored PIN: 654321")).toBeOnTheScreen();
  });

  it("never reads the PIN when verification fails", async () => {
    keychain.set(PIN_KEY, "654321");
    auth.authenticateAsync.mockResolvedValue({ success: false, error: "user_cancel" });
    await renderScreen();
    store.getItemAsync.mockClear();

    await pressNative("Reveal");

    expect(store.getItemAsync).not.toHaveBeenCalled();
    expect(screen.getByText("Not verified: user_cancel")).toBeOnTheScreen();
  });

  it("deletes the stored PIN", async () => {
    keychain.set(PIN_KEY, "654321");
    await renderScreen();

    await pressNative("Delete");

    expect(store.deleteItemAsync).toHaveBeenCalledWith(PIN_KEY);
    expect(keychain.has(PIN_KEY)).toBe(false);
    expect(nativeButton("Delete").props.disabled).toBe(true);
  });
});
