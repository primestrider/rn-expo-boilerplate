import { act, render, screen } from "@testing-library/react-native";
import * as StoreReview from "expo-store-review";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import AppInfoExample from "@/app/(public)/example/sdk/app-info";

import { infoValue, nativeButton, pressNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-application", () => ({
  applicationName: "RN Expo Boilerplate",
  applicationId: "com.primestrider.rnexpoboilerplate",
  nativeApplicationVersion: "1.1.1",
  nativeBuildVersion: "1001001",
  getInstallationTimeAsync: jest.fn(async () => new Date(2026, 8, 1, 10, 0)),
}));

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
  hasAction: jest.fn(),
  storeUrl: jest.fn(),
}));

const review = jest.mocked(StoreReview);

async function renderScreen() {
  render(<AppInfoExample />);
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  review.isAvailableAsync.mockResolvedValue(true);
  review.hasAction.mockResolvedValue(true);
  review.storeUrl.mockReturnValue("https://apps.apple.com/app/id123");
});

describe("App Info & Store Review example", () => {
  it("shows the native application details", async () => {
    await renderScreen();

    expect(infoValue("Name")).toBe("RN Expo Boilerplate");
    expect(infoValue("Bundle ID")).toBe("com.primestrider.rnexpoboilerplate");
    expect(infoValue("Version")).toBe("1.1.1");
    expect(infoValue("Build")).toBe("1001001");
    expect(infoValue("Installed")).toMatch(/01 Sep 2026/);
  });

  it("requests the native review sheet when available", async () => {
    await renderScreen();

    await pressNative("Rate us");

    expect(review.requestReview).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("Review requested — the OS may choose not to show it."),
    ).toBeOnTheScreen();
  });

  it("explains when in-app review is unavailable", async () => {
    review.isAvailableAsync.mockResolvedValue(false);
    await renderScreen();

    await pressNative("Rate us");

    expect(review.requestReview).not.toHaveBeenCalled();
    expect(screen.getByText("In-app review is not available here.")).toBeOnTheScreen();
  });

  it("disables rating where there is nothing to open", async () => {
    review.hasAction.mockResolvedValue(false);
    await renderScreen();

    expect(nativeButton("Rate us").props.disabled).toBe(true);
  });

  it("opens the store page as a fallback", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    await renderScreen();

    await pressNative("Open store page");

    expect(openURL).toHaveBeenCalledWith("https://apps.apple.com/app/id123");
  });

  it("points to the config keys when no store URL is set", async () => {
    review.storeUrl.mockReturnValue(null);
    await renderScreen();

    expect(nativeButton("Open store page").props.disabled).toBe(true);
    expect(screen.getByText(/ios.appStoreUrl/)).toBeOnTheScreen();
  });
});
