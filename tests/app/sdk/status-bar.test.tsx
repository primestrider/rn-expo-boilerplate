import { render, screen } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";

import StatusBarExample from "@/app/(public)/example/sdk/status-bar";

import { pickNative, toggleNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-status-bar", () => ({ StatusBar: jest.fn(() => null) }));

const bar = () => screen.UNSAFE_getByType(StatusBar).props;

describe("Status Bar example", () => {
  it("starts from the theme-following style, visible and animated", () => {
    render(<StatusBarExample />);

    expect(bar()).toEqual(
      expect.objectContaining({
        style: "auto",
        hidden: false,
        animated: true,
        hideTransitionAnimation: "fade",
      }),
    );
  });

  it("applies the chosen style, visibility and hide animation", async () => {
    render(<StatusBarExample />);

    await pickNative("light", 0);
    await toggleNative("Hidden", true);
    await pickNative("slide", 1);

    expect(bar()).toEqual(
      expect.objectContaining({
        style: "light",
        hidden: true,
        hideTransitionAnimation: "slide",
      }),
    );
  });
});
