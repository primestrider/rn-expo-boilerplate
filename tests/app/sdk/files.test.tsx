import { render, screen } from "@testing-library/react-native";
import { ImageManipulator } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import type { ReactNode } from "react";

import FilesExample from "@/app/(public)/example/sdk/files";
import { formatFileSize } from "@/shared/helpers";

import { infoValue, nativeButton, nativeTexts, pressNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-image", () => ({ Image: jest.fn(() => null) }));

jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));

// An in-memory file tree standing in for the device's cache directory.
jest.mock("expo-file-system", () => {
  const mockSizes = new Map<string, number>();
  const mockDirs = new Set<string>();

  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === "string" ? p : p.uri)).join("/");
    }
    get name() {
      return this.uri.split("/").pop()!;
    }
    get size() {
      return mockSizes.get(this.uri) ?? 0;
    }
    static downloadFileAsync = jest.fn(async (url: string, dir: { uri: string }) => {
      const file = new File(dir.uri, url.split("/").pop()!);
      mockSizes.set(file.uri, 13264);
      return file;
    });
  }

  class Directory {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === "string" ? p : p.uri)).join("/");
    }
    get exists() {
      return mockDirs.has(this.uri);
    }
    create = jest.fn(() => mockDirs.add(this.uri));
    delete = jest.fn(() => {
      mockDirs.delete(this.uri);
      [...mockSizes.keys()]
        .filter((key) => key.startsWith(`${this.uri}/`))
        .forEach((key) => mockSizes.delete(key));
    });
    list() {
      return [...mockSizes.keys()]
        .filter((key) => key.startsWith(`${this.uri}/`))
        .map((key) => new File(key));
    }
  }

  return {
    File,
    Directory,
    Paths: { cache: { uri: "file:///cache" } },
    mockSizes,
    mockDirs,
  };
});

jest.mock("expo-image-manipulator", () => ({
  SaveFormat: { JPEG: "jpeg" },
  ImageManipulator: { manipulate: jest.fn() },
}));

const fs = jest.requireMock("expo-file-system") as {
  File: { downloadFileAsync: jest.Mock };
  mockSizes: Map<string, number>;
  mockDirs: Set<string>;
};
const picker = jest.mocked(ImagePicker);
const manipulate = jest.mocked(ImageManipulator.manipulate);

const context = {
  resize: jest.fn(),
  renderAsync: jest.fn(),
};
const saveAsync = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  fs.mockSizes.clear();
  fs.mockDirs.clear();
  context.resize.mockReturnValue(context);
  context.renderAsync.mockResolvedValue({ saveAsync });
  manipulate.mockReturnValue(context as never);
  saveAsync.mockImplementation(async () => {
    fs.mockSizes.set("file:///cache/small.jpg", 200_000);
    return { uri: "file:///cache/small.jpg", width: 1080, height: 810 };
  });
});

async function pickPhoto(width: number) {
  picker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [
      { uri: "file:///photos/kyc.jpg", width, height: width * 0.75, fileSize: 800_000 },
    ],
  } as never);
  await pressNative("Pick photo");
}

describe("Image Manipulator & Files example", () => {
  it("cannot compress before a photo is picked", () => {
    render(<FilesExample />);

    expect(nativeButton("Compress").props.disabled).toBe(true);
  });

  it("scales a large photo down to the max width and re-encodes it", async () => {
    render(<FilesExample />);

    await pickPhoto(4000);
    await pressNative("Compress");

    expect(manipulate).toHaveBeenCalledWith("file:///photos/kyc.jpg");
    expect(context.resize).toHaveBeenCalledWith({ width: 1080 });
    expect(saveAsync).toHaveBeenCalledWith({ compress: 0.6, format: "jpeg" });
    expect(infoValue("Original")).toBe("4000 × 3000");
    expect(infoValue("Compressed")).toBe("1080 × 810");
    expect(infoValue("Compressed size")).toBe(formatFileSize(200_000));
    expect(infoValue("Saving")).toBe("75% smaller");
  });

  it("never upscales a photo already narrower than the max width", async () => {
    render(<FilesExample />);

    await pickPhoto(800);
    await pressNative("Compress");

    expect(context.resize).not.toHaveBeenCalled();
    expect(saveAsync).toHaveBeenCalled();
  });

  it("downloads into a cache subfolder and lists the result", async () => {
    render(<FilesExample />);

    expect(screen.getByText("No downloaded files.")).toBeOnTheScreen();

    await pressNative("Download PDF");

    expect(fs.mockDirs.has("file:///cache/downloads")).toBe(true);
    expect(fs.File.downloadFileAsync).toHaveBeenCalledWith(
      expect.stringMatching(/dummy\.pdf$/),
      expect.objectContaining({ uri: "file:///cache/downloads" }),
      { idempotent: true },
    );
    expect(infoValue("dummy.pdf")).toBe(formatFileSize(13264));
  });

  it("shows a failed download", async () => {
    fs.File.downloadFileAsync.mockRejectedValueOnce(new Error("Network request failed"));
    render(<FilesExample />);

    await pressNative("Download PDF");

    expect(screen.getByText("Network request failed")).toBeOnTheScreen();
  });

  it("clears downloaded files", async () => {
    render(<FilesExample />);
    await pressNative("Download PDF");

    await pressNative("Clear");

    expect(nativeTexts()).not.toContain("dummy.pdf");
    expect(screen.getByText("No downloaded files.")).toBeOnTheScreen();
  });
});
