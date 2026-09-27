import { act, render, screen } from "@testing-library/react-native";
import { CameraView } from "expo-camera";
import { Image } from "expo-image";
import type { ReactNode } from "react";

import CameraExample from "@/app/(public)/example/sdk/camera";
import { BottomSheet } from "@/shared/components";

import {
  nativeButton,
  pickNative,
  pressNative,
  queryNativeButton,
  toggleNative,
} from "../../helpers/native-ui";

const mockTakePicture = jest.fn();
const mockRequestPermission = jest.fn();
let mockPermission: { granted: boolean; canAskAgain: boolean } | null = null;

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-image", () => ({ Image: jest.fn(() => null) }));

// The preview is native; the stand-in exposes the same imperative handle.
jest.mock("expo-camera", () => {
  const React = require("react");
  const CameraView = React.forwardRef(function CameraView(
    _props: unknown,
    ref: unknown,
  ) {
    React.useImperativeHandle(ref, () => ({ takePictureAsync: mockTakePicture }));
    return null;
  });
  return {
    CameraView,
    useCameraPermissions: () => [mockPermission, mockRequestPermission],
  };
});

const camera = () => screen.UNSAFE_getByType(CameraView);
const sheet = () => screen.UNSAFE_getByType(BottomSheet);

beforeEach(() => {
  jest.clearAllMocks();
  mockPermission = { granted: true, canAskAgain: true };
});

describe("Camera example", () => {
  it("asks for camera access before showing the preview", async () => {
    mockPermission = { granted: false, canAskAgain: true };
    render(<CameraExample />);

    expect(screen.UNSAFE_queryByType(CameraView)).toBeNull();

    await pressNative("Grant access");

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("starts on the back camera, scanning QR codes only", () => {
    render(<CameraExample />);

    expect(camera().props.facing).toBe("back");
    expect(camera().props.barcodeScannerSettings).toEqual({ barcodeTypes: ["qr"] });
    expect(camera().props.onBarcodeScanned).toEqual(expect.any(Function));
  });

  it("wires flip, flash, torch and zoom to the camera", async () => {
    render(<CameraExample />);

    await pressNative("Flip");
    await pickNative("auto", 1);
    await toggleNative("Torch", true);

    expect(camera().props.facing).toBe("front");
    expect(camera().props.flash).toBe("auto");
    expect(camera().props.enableTorch).toBe(true);

    await pressNative("Flip");
    expect(camera().props.facing).toBe("back");
  });

  it("shows a scanned code once, until the sheet is closed", () => {
    render(<CameraExample />);

    expect(sheet().props.visible).toBe(false);

    act(() => camera().props.onBarcodeScanned({ data: "PAY:INV-001" }));

    expect(sheet().props.visible).toBe(true);
    expect(screen.getByText("PAY:INV-001")).toBeOnTheScreen();
    // Scanning pauses so the same code does not fire on every frame.
    expect(camera().props.onBarcodeScanned).toBeUndefined();

    act(() => sheet().props.onClose());

    expect(sheet().props.visible).toBe(false);
    expect(camera().props.onBarcodeScanned).toEqual(expect.any(Function));
  });

  it("stops scanning in photo mode", async () => {
    render(<CameraExample />);

    await pickNative("photo", 0);

    expect(camera().props.onBarcodeScanned).toBeUndefined();
  });

  it("captures a photo once the camera is ready", async () => {
    mockTakePicture.mockResolvedValue({ uri: "file:///photo.jpg" });
    render(<CameraExample />);

    expect(queryNativeButton("Capture")).toBeUndefined();

    await pickNative("photo", 0);

    expect(nativeButton("Capture").props.disabled).toBe(true);

    act(() => camera().props.onCameraReady());
    await pressNative("Capture");

    expect(mockTakePicture).toHaveBeenCalledWith({ quality: 0.7 });
    expect(screen.UNSAFE_getByType(Image).props.source).toBe("file:///photo.jpg");
  });
});
