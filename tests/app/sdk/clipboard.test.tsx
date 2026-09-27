import { TextInput } from "@expo/ui";
import { act, render, screen } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";

import ClipboardExample from "@/app/(public)/example/sdk/clipboard";

import { infoValue, pickNative, pressNative } from "../../helpers/native-ui";

let mockClipboardListener: (() => void) | undefined;
const mockRemoveListener = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
  hasStringAsync: jest.fn(),
  addClipboardListener: jest.fn((listener: () => void) => {
    mockClipboardListener = listener;
    return { remove: mockRemoveListener };
  }),
}));

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
    Soft: "soft",
    Rigid: "rigid",
  },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

const clipboard = jest.mocked(Clipboard);
const haptics = jest.mocked(Haptics);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Clipboard & Haptics example", () => {
  it("copies the referral code and confirms with a success haptic", async () => {
    render(<ClipboardExample />);

    await pressNative("Copy");

    expect(clipboard.setStringAsync).toHaveBeenCalledWith("SUPER-7K2Q9");
    expect(haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  it("pastes clipboard text into the native field", async () => {
    clipboard.hasStringAsync.mockResolvedValue(true);
    clipboard.getStringAsync.mockResolvedValue("1234567890");
    render(<ClipboardExample />);

    await pressNative("Paste");

    expect(screen.UNSAFE_getByType(TextInput).props.value.value).toBe("1234567890");
    expect(infoValue("Last pasted")).toBe("1234567890");
    expect(haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("warns instead of reading an empty clipboard", async () => {
    clipboard.hasStringAsync.mockResolvedValue(false);
    render(<ClipboardExample />);

    await pressNative("Paste");

    expect(clipboard.getStringAsync).not.toHaveBeenCalled();
    expect(haptics.notificationAsync).toHaveBeenCalledWith("warning");
    expect(infoValue("Last pasted")).toBeUndefined();
  });

  it("counts clipboard changes and stops listening on unmount", () => {
    const { unmount } = render(<ClipboardExample />);

    act(() => mockClipboardListener?.());
    act(() => mockClipboardListener?.());

    expect(
      screen.getByText("Clipboard changed 2 times while this screen was open."),
    ).toBeOnTheScreen();

    unmount();
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });

  it("plays the chosen impact and ticks on every picker change", async () => {
    render(<ClipboardExample />);

    await pressNative("Impact");
    expect(haptics.impactAsync).toHaveBeenLastCalledWith("medium");

    await pickNative("heavy", 0);
    await pressNative("Impact");

    expect(haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(haptics.impactAsync).toHaveBeenLastCalledWith("heavy");
  });

  it("plays the chosen notification outcome", async () => {
    render(<ClipboardExample />);

    await pickNative("error", 1);
    await pressNative("Notify");

    expect(haptics.notificationAsync).toHaveBeenLastCalledWith("error");
  });
});
