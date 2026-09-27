import { act, render, screen } from "@testing-library/react-native";
import * as Brightness from "expo-brightness";
import * as KeepAwake from "expo-keep-awake";
import * as ScreenCapture from "expo-screen-capture";
import type { ReactNode } from "react";

import PaymentCodeExample from "@/app/(public)/example/sdk/payment-code";

import { toggleNative } from "../../helpers/native-ui";

let mockScreenshotListener: (() => void) | undefined;
const mockRemoveScreenshotListener = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-brightness", () => ({
  isAvailableAsync: jest.fn(),
  getBrightnessAsync: jest.fn(),
  setBrightnessAsync: jest.fn(),
}));

jest.mock("expo-keep-awake", () => ({
  activateKeepAwakeAsync: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));

jest.mock("expo-screen-capture", () => ({
  preventScreenCaptureAsync: jest.fn(),
  allowScreenCaptureAsync: jest.fn(),
  addScreenshotListener: jest.fn((listener: () => void) => {
    mockScreenshotListener = listener;
    return { remove: mockRemoveScreenshotListener };
  }),
}));

const brightness = jest.mocked(Brightness);
const keepAwake = jest.mocked(KeepAwake);
const capture = jest.mocked(ScreenCapture);

const TAG = "payment-code";

async function renderScreen() {
  const view = render(<PaymentCodeExample />);
  await act(async () => {});
  return view;
}

const payCode = () => screen.getByTestId("pay-code").props.children as string;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  brightness.isAvailableAsync.mockResolvedValue(true);
  brightness.getBrightnessAsync.mockResolvedValue(0.4);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Payment code example", () => {
  it("shows a 12-digit one-time code", async () => {
    await renderScreen();

    expect(payCode()).toMatch(/^\d{4} \d{4} \d{4}$/);
    expect(screen.getByText(/Refreshes in 60s/)).toBeOnTheScreen();
  });

  it("counts down and issues a new code when it expires", async () => {
    await renderScreen();
    const first = payCode();

    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText(/Refreshes in 59s/)).toBeOnTheScreen();
    expect(payCode()).toBe(first);

    jest.spyOn(Math, "random").mockReturnValue(0.123456);
    act(() => jest.advanceTimersByTime(59_000));

    expect(payCode()).toBe("1234 1234 1234");
    expect(screen.getByText(/Refreshes in 60s/)).toBeOnTheScreen();
    jest.spyOn(Math, "random").mockRestore();
  });

  it("turns brightness up and restores the previous level", async () => {
    await renderScreen();

    expect(brightness.setBrightnessAsync).toHaveBeenLastCalledWith(1);

    await toggleNative("Max brightness", false);

    expect(brightness.setBrightnessAsync).toHaveBeenLastCalledWith(0.4);
  });

  it("restores brightness when the screen closes", async () => {
    const { unmount } = await renderScreen();

    unmount();

    expect(brightness.setBrightnessAsync).toHaveBeenLastCalledWith(0.4);
  });

  it("leaves brightness alone where it cannot be changed", async () => {
    brightness.isAvailableAsync.mockResolvedValue(false);
    const { unmount } = await renderScreen();
    unmount();

    expect(brightness.setBrightnessAsync).not.toHaveBeenCalled();
  });

  it("keeps the screen awake only while the switch is on", async () => {
    await renderScreen();

    expect(keepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith(TAG);

    await toggleNative("Keep screen on", false);

    expect(keepAwake.deactivateKeepAwake).toHaveBeenCalledWith(TAG);
  });

  it("blocks screenshots while on, and allows them again when off", async () => {
    await renderScreen();

    expect(capture.preventScreenCaptureAsync).toHaveBeenCalledWith(TAG);

    await toggleNative("Block screenshots", false);

    expect(capture.allowScreenCaptureAsync).toHaveBeenCalledWith(TAG);
  });

  it("releases every protection when the screen closes", async () => {
    const { unmount } = await renderScreen();

    unmount();

    expect(keepAwake.deactivateKeepAwake).toHaveBeenCalledWith(TAG);
    expect(capture.allowScreenCaptureAsync).toHaveBeenCalledWith(TAG);
    expect(mockRemoveScreenshotListener).toHaveBeenCalledTimes(1);
  });

  it("warns the user after a screenshot", async () => {
    await renderScreen();

    expect(screen.queryByText("Screenshot detected")).toBeNull();

    act(() => mockScreenshotListener?.());

    expect(screen.getByText("Screenshot detected")).toBeOnTheScreen();
  });
});
