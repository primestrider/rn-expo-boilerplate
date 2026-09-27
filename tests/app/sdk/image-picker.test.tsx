import { render, screen } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { ReactNode } from "react";

import PickerExample from "@/app/(public)/example/sdk/image-picker";

import {
  infoValue,
  pickNative,
  pressNative,
  toggleNative,
} from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-image", () => ({ Image: jest.fn(() => null) }));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));

const library = jest.mocked(ImagePicker.launchImageLibraryAsync);
const cameraLaunch = jest.mocked(ImagePicker.launchCameraAsync);
const cameraPermission = jest.mocked(ImagePicker.requestCameraPermissionsAsync);
const documents = jest.mocked(DocumentPicker.getDocumentAsync);

const photo = {
  uri: "file:///a.jpg",
  width: 640,
  height: 480,
  type: "image",
  fileSize: 2048,
  mimeType: "image/jpeg",
} as ImagePicker.ImagePickerAsset;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Image picker example", () => {
  it("opens the library with square crop and 0.8 quality by default", async () => {
    library.mockResolvedValue({ canceled: false, assets: [photo] });
    render(<PickerExample />);

    await pressNative("Library");

    expect(library).toHaveBeenCalledWith({
      mediaTypes: "images",
      allowsEditing: true,
      allowsMultipleSelection: false,
      aspect: [1, 1],
      quality: 0.8,
    });
    expect(screen.UNSAFE_getByType(Image).props.source).toBe("file:///a.jpg");
    expect(infoValue("Size")).toBe("640 × 480");
    expect(infoValue("File")).toBe("2.0 KB");
  });

  it("turns cropping off for multiple selection, which cannot crop", async () => {
    library.mockResolvedValue({ canceled: true, assets: null });
    render(<PickerExample />);

    await toggleNative("Multiple selection", true);
    await pickNative("videos", 0);
    await pressNative("Library");

    expect(library).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaTypes: "videos",
        allowsEditing: false,
        allowsMultipleSelection: true,
      }),
    );
  });

  it("keeps the previous result when the picker is cancelled", async () => {
    library.mockResolvedValue({ canceled: true, assets: null });
    render(<PickerExample />);

    await pressNative("Library");

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
  });

  it("asks for camera permission before launching the camera", async () => {
    cameraPermission.mockResolvedValue({ granted: true } as never);
    cameraLaunch.mockResolvedValue({ canceled: false, assets: [photo] });
    render(<PickerExample />);

    await pressNative("Camera");

    expect(cameraPermission).toHaveBeenCalledTimes(1);
    expect(cameraLaunch).toHaveBeenCalledTimes(1);
  });

  it("explains a denied camera permission instead of launching", async () => {
    cameraPermission.mockResolvedValue({ granted: false } as never);
    render(<PickerExample />);

    await pressNative("Camera");

    expect(cameraLaunch).not.toHaveBeenCalled();
    expect(screen.getByText("Camera permission was denied.")).toBeOnTheScreen();
  });

  it("picks documents filtered by the chosen MIME type", async () => {
    documents.mockResolvedValue({
      canceled: false,
      assets: [
        { name: "statement.pdf", size: 4096, uri: "file:///s.pdf", lastModified: 0 },
      ],
      output: null,
    } as never);
    render(<PickerExample />);

    await pickNative("application/pdf", 1);
    await pressNative("Choose files");

    expect(documents).toHaveBeenCalledWith({
      type: "application/pdf",
      multiple: true,
      copyToCacheDirectory: true,
    });
    expect(infoValue("statement.pdf")).toBe("4.0 KB");
  });
});
