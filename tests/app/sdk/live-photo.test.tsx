import { act, render, screen } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import type { ReactNode } from "react";

import LivePhotoExample from "@/app/(public)/example/sdk/live-photo";

import { infoValue, nativeButton, pressNative } from "../../helpers/native-ui";

const mockStartPlayback = jest.fn();
let mockAvailable = true;

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));

jest.mock("expo-live-photo", () => {
  const React = require("react");
  const { View } = require("react-native");
  const LivePhotoView = React.forwardRef(function LivePhotoView(
    props: object,
    ref: unknown,
  ) {
    React.useImperativeHandle(ref, () => ({ startPlayback: mockStartPlayback }));
    return React.createElement(View, { testID: "live-photo", ...props });
  });
  LivePhotoView.isAvailable = () => mockAvailable;
  return { LivePhotoView };
});

const picker = jest.mocked(ImagePicker);

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailable = true;
});

describe("Live Photo example", () => {
  it("explains that Live Photos are iOS-only elsewhere", () => {
    mockAvailable = false;
    render(<LivePhotoExample />);

    expect(screen.getByText("Live Photos are an iOS feature")).toBeOnTheScreen();
  });

  it("picks only Live Photos and plays the still with its paired video", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file:///photo.heic",
          pairedVideoAsset: { uri: "file:///photo.mov" },
        },
      ],
    } as never);
    render(<LivePhotoExample />);

    expect(nativeButton("Play").props.disabled).toBe(true);

    await pressNative("Pick Live Photo");

    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ["livePhotos"],
    });
    expect(screen.getByTestId("live-photo").props.source).toEqual({
      photoUri: "file:///photo.heic",
      pairedVideoUri: "file:///photo.mov",
    });
    expect(screen.getByTestId("live-photo").props.isMuted).toBe(true);

    await pressNative("Play");
    expect(mockStartPlayback).toHaveBeenLastCalledWith("full");

    await pressNative("Hint");
    expect(mockStartPlayback).toHaveBeenLastCalledWith("hint");
  });

  it("rejects a still photo without a paired video", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///still.jpg", pairedVideoAsset: null }],
    } as never);
    render(<LivePhotoExample />);

    await pressNative("Pick Live Photo");

    expect(screen.getByText("That photo is not a Live Photo.")).toBeOnTheScreen();
    expect(screen.queryByTestId("live-photo")).toBeNull();
  });

  it("tracks playback start and stop", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///p.heic", pairedVideoAsset: { uri: "file:///p.mov" } }],
    } as never);
    render(<LivePhotoExample />);
    await pressNative("Pick Live Photo");

    act(() => screen.getByTestId("live-photo").props.onPlaybackStart());
    expect(infoValue("Playback")).toBe("Playing");

    act(() => screen.getByTestId("live-photo").props.onPlaybackStop());
    expect(infoValue("Playback")).toBe("Stopped");
  });
});
