import { render, screen } from "@testing-library/react-native";
import * as Network from "expo-network";
import type { ReactNode } from "react";

import DeviceExample from "@/app/(public)/example/sdk/device";

import { infoValue, pressNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-device", () => ({
  DeviceType: { UNKNOWN: 0, PHONE: 1, TABLET: 2, DESKTOP: 3, TV: 4 },
  brand: "Google",
  modelName: "Pixel 8",
  osName: "Android",
  osVersion: "15",
  deviceType: 1,
  isDevice: false,
  totalMemory: 8 * 1024 ** 3,
  deviceYearClass: 2023,
}));

jest.mock("expo-network", () => ({
  useNetworkState: jest.fn(),
  getIpAddressAsync: jest.fn(),
  isAirplaneModeEnabledAsync: jest.fn(),
}));

const network = jest.mocked(Network);

beforeEach(() => {
  jest.clearAllMocks();
  network.useNetworkState.mockReturnValue({
    type: "WIFI",
    isConnected: true,
    isInternetReachable: true,
  } as never);
});

describe("Device & Network example", () => {
  it("shows the device constants", () => {
    render(<DeviceExample />);

    expect(infoValue("Brand")).toBe("Google");
    expect(infoValue("Model")).toBe("Pixel 8");
    expect(infoValue("OS")).toBe("Android 15");
    expect(infoValue("Device type")).toBe("Phone");
    expect(infoValue("Physical device")).toBe("No (simulator)");
    expect(infoValue("Memory")).toBe("8.0 GB");
    expect(infoValue("Year class")).toBe("2023");
  });

  it("shows the connection without an offline banner while online", () => {
    render(<DeviceExample />);

    expect(infoValue("Type")).toBe("WIFI");
    expect(infoValue("Connected")).toBe("Yes");
    expect(infoValue("Internet reachable")).toBe("Yes");
    expect(screen.queryByText("You're offline")).toBeNull();
  });

  it.each([
    ["disconnected", { isConnected: false, isInternetReachable: false }],
    ["connected without internet", { isConnected: true, isInternetReachable: false }],
  ])("shows the offline banner when %s", (_case, state) => {
    network.useNetworkState.mockReturnValue({ type: "WIFI", ...state } as never);
    render(<DeviceExample />);

    expect(screen.getByText("You're offline")).toBeOnTheScreen();
  });

  it("reads the IP address on demand, skipping Android-only checks on iOS", async () => {
    network.getIpAddressAsync.mockResolvedValue("192.168.1.20");
    render(<DeviceExample />);

    expect(infoValue("IP address")).toBe("—");

    await pressNative("Read IP address");

    expect(infoValue("IP address")).toBe("192.168.1.20");
    expect(network.isAirplaneModeEnabledAsync).not.toHaveBeenCalled();
    expect(infoValue("Airplane mode")).toBe("—");
  });
});
