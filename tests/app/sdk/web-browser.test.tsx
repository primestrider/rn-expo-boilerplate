import { render, screen } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";

import WebBrowserExample from "@/app/(public)/example/sdk/web-browser";
import { colors } from "@/styles/tokens";

import { infoValue, pickNative, pressNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));

jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
  createURL: jest.fn(() => "rnexpoboilerplate://example/sdk/payment-code?amount=50000"),
}));

const browser = jest.mocked(WebBrowser);
const linking = jest.mocked(Linking);

beforeEach(() => {
  jest.clearAllMocks();
  browser.openBrowserAsync.mockResolvedValue({ type: "cancel" } as never);
  linking.openURL.mockResolvedValue(true);
});

describe("Web Browser & Linking example", () => {
  it("opens the chosen page in a browser themed like the app", async () => {
    render(<WebBrowserExample />);

    await pickNative("privacy", 0);
    await pressNative("Open page");

    expect(browser.openBrowserAsync).toHaveBeenCalledWith("https://expo.dev/privacy", {
      toolbarColor: colors.card,
      controlsColor: colors.primary,
      dismissButtonStyle: "close",
    });
    expect(infoValue("Browser closed with")).toBe("cancel");
  });

  it("hands off to WhatsApp through a wa.me link by default", async () => {
    render(<WebBrowserExample />);

    await pressNative("Open");

    expect(linking.openURL).toHaveBeenCalledWith(
      "https://wa.me/6281234567890?text=Halo",
    );
  });

  it("opens the dialer for Call", async () => {
    render(<WebBrowserExample />);

    await pickNative("Call", 1);
    await pressNative("Open");

    expect(linking.openURL).toHaveBeenCalledWith("tel:+6281234567890");
  });

  it("says so when no app can handle the link", async () => {
    linking.openURL.mockRejectedValue(new Error("No activity found"));
    render(<WebBrowserExample />);

    await pickNative("Email", 1);
    await pressNative("Open");

    expect(screen.getByText("No app on this device can open Email.")).toBeOnTheScreen();
  });

  it("builds a deep link back into the payment screen", () => {
    render(<WebBrowserExample />);

    expect(linking.createURL).toHaveBeenCalledWith("example/sdk/payment-code", {
      queryParams: { amount: "50000" },
    });
    expect(infoValue("URL")).toBe(
      "rnexpoboilerplate://example/sdk/payment-code?amount=50000",
    );
  });
});
