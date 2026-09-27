import { act, render, screen } from "@testing-library/react-native";
import * as Location from "expo-location";
import type { ReactNode } from "react";

import LocationExample from "@/app/(public)/example/sdk/location";

import {
  infoValue,
  pickNative,
  pressNative,
  toggleNative,
} from "../../helpers/native-ui";

let mockPermission: { granted: boolean; canAskAgain: boolean } | null = null;
const mockRequestPermission = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-location", () => ({
  Accuracy: { Low: 2, Balanced: 3, High: 4 },
  useForegroundPermissions: () => [mockPermission, mockRequestPermission],
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

const currentPosition = jest.mocked(Location.getCurrentPositionAsync);
const reverseGeocode = jest.mocked(Location.reverseGeocodeAsync);
const watchPosition = jest.mocked(Location.watchPositionAsync);

const fix = (latitude: number, longitude: number) =>
  ({
    coords: { latitude, longitude, accuracy: 12.4 },
    timestamp: 0,
  }) as Location.LocationObject;

beforeEach(() => {
  jest.clearAllMocks();
  mockPermission = { granted: true, canAskAgain: true };
});

describe("Location example", () => {
  it("asks for foreground location access first", async () => {
    mockPermission = { granted: false, canAskAgain: true };
    render(<LocationExample />);

    await pressNative("Grant access");

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    expect(currentPosition).not.toHaveBeenCalled();
  });

  it("gets a fix at the chosen accuracy and reverse-geocodes it", async () => {
    currentPosition.mockResolvedValue(fix(-6.2, 106.816666));
    reverseGeocode.mockResolvedValue([
      { city: "Jakarta", country: "Indonesia", street: "Jl. Thamrin" } as never,
    ]);
    render(<LocationExample />);

    await pickNative("high");
    await pressNative("Get current location");

    expect(currentPosition).toHaveBeenCalledWith({ accuracy: Location.Accuracy.High });
    expect(reverseGeocode).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: -6.2, longitude: 106.816666 }),
    );
    expect(infoValue("Latitude")).toBe("-6.200000");
    expect(infoValue("Longitude")).toBe("106.816666");
    expect(infoValue("Accuracy")).toBe("±12 m");
    expect(infoValue("City")).toBe("Jakarta");
    expect(infoValue("Postal code")).toBe("—");
  });

  it("shows the error when no location can be obtained", async () => {
    currentPosition.mockRejectedValue(new Error("Location services are disabled"));
    render(<LocationExample />);

    await pressNative("Get current location");

    expect(screen.getByText("Location services are disabled")).toBeOnTheScreen();
  });

  it("subscribes while watching and unsubscribes when switched off", async () => {
    const remove = jest.fn();
    let update: (location: Location.LocationObject) => void = () => {};
    watchPosition.mockImplementation(async (_options, callback) => {
      update = callback;
      return { remove };
    });
    render(<LocationExample />);

    await toggleNative("Watch position", true);

    expect(watchPosition).toHaveBeenCalledWith(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
      expect.any(Function),
      expect.any(Function),
    );

    act(() => update(fix(1.5, 2.5)));
    expect(infoValue("Latitude")).toBe("1.500000");

    await toggleNative("Watch position", false);

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("stops watching when the screen unmounts", async () => {
    const remove = jest.fn();
    watchPosition.mockResolvedValue({ remove });
    const { unmount } = render(<LocationExample />);

    await toggleNative("Watch position", true);
    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
