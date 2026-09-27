import { render } from "@testing-library/react-native";
import type { ReactNode } from "react";

import BlobExample from "@/app/(public)/example/sdk/blob";

import { infoValue, nativeButton, pressNative, typeNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

// expo-blob mirrors the web Blob API; Node's own Blob stands in for the
// native implementation, so sizes and slices are computed for real.
jest.mock("expo-blob", () => ({ Blob: globalThis.Blob }));

describe("Blob example", () => {
  it("disables reading until a blob exists", () => {
    render(<BlobExample />);

    expect(nativeButton("Text").props.disabled).toBe(true);
    expect(nativeButton("Slice").props.disabled).toBe(true);
  });

  it("creates a JSON blob sized in bytes, not characters", async () => {
    render(<BlobExample />);

    await typeNative("Rp 50.000 ✓");
    await pressNative("Create");

    // "✓" is three bytes in UTF-8.
    expect(infoValue("Size")).toBe("13 bytes");
    expect(infoValue("Type")).toBe("application/json");
  });

  it("reads the content back as text", async () => {
    render(<BlobExample />);

    await typeNative("hello");
    await pressNative("Create");
    await pressNative("Text");

    expect(infoValue("Text")).toBe("hello");
  });

  it("slices the first eight bytes and shows them as hex", async () => {
    render(<BlobExample />);

    await typeNative("ABCDEFGHIJ");
    await pressNative("Create");
    await pressNative("Slice");

    expect(infoValue("Size")).toBe("8 bytes");
    expect(infoValue("Bytes")).toBe("41 42 43 44 45 46 47 48");
  });

  it("combines blobs and strings into one", async () => {
    render(<BlobExample />);

    await typeNative("ab");
    await pressNative("Create");
    await pressNative("Combine");

    expect(infoValue("Text")).toBe("ab\nab");
    expect(infoValue("Size")).toBe("5 bytes");
    expect(infoValue("Type")).toBe("text/plain");
  });
});
