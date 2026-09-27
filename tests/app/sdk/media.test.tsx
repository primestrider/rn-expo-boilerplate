import { act, render } from "@testing-library/react-native";
import * as Audio from "expo-audio";
import type { ReactNode } from "react";

import MediaExample from "@/app/(public)/example/sdk/media";

import {
  infoValue,
  nativeButton,
  pressNative,
  queryNativeButton,
} from "../../helpers/native-ui";

const mockRecorder = {
  prepareToRecordAsync: jest.fn(),
  record: jest.fn(),
  stop: jest.fn(),
  uri: "file:///cache/voice-note.m4a" as string | null,
};
const mockRecorderState = { isRecording: false, durationMillis: 0 };
const mockPlayer = {
  replace: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
};
const mockPlayback = { playing: false, currentTime: 0, duration: 0 };

type Listener = (payload: { isPlaying: boolean }) => void;
const mockVideo = {
  playing: false,
  play: jest.fn(),
  pause: jest.fn(),
  listener: undefined as Listener | undefined,
  addListener: jest.fn((_event: string, listener: Listener) => {
    mockVideo.listener = listener;
    return { remove: jest.fn() };
  }),
};

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-audio", () => ({
  RecordingPresets: { HIGH_QUALITY: { extension: ".m4a" } },
  getRecordingPermissionsAsync: jest.fn(),
  requestRecordingPermissionsAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
  useAudioRecorder: () => mockRecorder,
  useAudioRecorderState: () => mockRecorderState,
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockPlayback,
}));

jest.mock("expo-video", () => ({
  useVideoPlayer: (_source: string, setup: (player: object) => void) => {
    setup(mockVideo);
    return mockVideo;
  },
  VideoView: () => null,
}));

const audio = jest.mocked(Audio);
const granted = { granted: true, canAskAgain: true, status: "granted", expires: "never" };

async function renderScreen() {
  const view = render(<MediaExample />);
  await act(async () => {});
  return view;
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(mockRecorderState, { isRecording: false, durationMillis: 0 });
  Object.assign(mockPlayback, { playing: false, currentTime: 0, duration: 0 });
  mockRecorder.uri = "file:///cache/voice-note.m4a";
  // As the real recorder state does once stopped.
  mockRecorder.stop.mockImplementation(async () => {
    mockRecorderState.isRecording = false;
  });
  audio.getRecordingPermissionsAsync.mockResolvedValue(granted as never);
});

describe("Audio & Video example", () => {
  it("asks for the microphone before offering to record", async () => {
    audio.getRecordingPermissionsAsync.mockResolvedValue({
      ...granted,
      granted: false,
      status: "undetermined",
    } as never);
    audio.requestRecordingPermissionsAsync.mockResolvedValue(granted as never);
    await renderScreen();

    expect(queryNativeButton("Record")).toBeUndefined();

    await pressNative("Grant access");

    expect(nativeButton("Record")).toBeTruthy();
  });

  it("enables recording in the audio session before starting", async () => {
    await renderScreen();

    await pressNative("Record");

    expect(audio.setAudioModeAsync).toHaveBeenCalledWith({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    expect(mockRecorder.prepareToRecordAsync).toHaveBeenCalled();
    expect(mockRecorder.record).toHaveBeenCalled();
    expect(
      audio.setAudioModeAsync.mock.invocationCallOrder[0],
    ).toBeLessThan(mockRecorder.record.mock.invocationCallOrder[0]);
  });

  it("shows elapsed time while recording", async () => {
    Object.assign(mockRecorderState, { isRecording: true, durationMillis: 65_000 });
    await renderScreen();

    expect(nativeButton("Stop")).toBeTruthy();
    expect(infoValue("Recording")).toBe("1:05");
    expect(nativeButton("Play").props.disabled).toBe(true);
  });

  it("loads the note into the player when recording stops", async () => {
    Object.assign(mockRecorderState, { isRecording: true });
    await renderScreen();

    await pressNative("Stop");

    expect(mockRecorder.stop).toHaveBeenCalled();
    expect(audio.setAudioModeAsync).toHaveBeenLastCalledWith({ allowsRecording: false });
    expect(mockPlayer.replace).toHaveBeenCalledWith({ uri: "file:///cache/voice-note.m4a" });
  });

  it("plays, and restarts a note that already finished", async () => {
    Object.assign(mockRecorderState, { isRecording: true });
    Object.assign(mockPlayback, { currentTime: 12, duration: 12 });
    await renderScreen();
    await pressNative("Stop");

    expect(nativeButton("Play").props.disabled).toBe(false);
    expect(infoValue("Playback")).toBe("0:12 / 0:12");

    await pressNative("Play");

    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  it("starts the promo video muted and looping, and toggles it", async () => {
    await renderScreen();

    expect(mockVideo).toEqual(expect.objectContaining({ loop: true, muted: true }));

    await pressNative("Play video");
    expect(mockVideo.play).toHaveBeenCalled();

    act(() => mockVideo.listener?.({ isPlaying: true }));
    await pressNative("Pause video");
    expect(mockVideo.pause).toHaveBeenCalled();
  });
});
