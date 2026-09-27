import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import EffectsExample from "@/app/(public)/example/sdk/effects";

import { pickNative, toggleNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

// Native views; the stand-ins keep their props visible to the test.
jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return { BlurView: View, BlurTargetView: View };
});

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

jest.mock("expo-mesh-gradient", () => {
  const { View } = require("react-native");
  return { MeshGradientView: View };
});

const point = (value: number) => expect.closeTo(value, 5);

describe("Blur & Gradients example", () => {
  it("draws the card gradient at the chosen colors and angle", async () => {
    render(<EffectsExample />);
    const card = () => screen.getByTestId("card-gradient");

    expect(card().props.colors).toEqual(["#0EA5E9", "#6366F1"]);
    // 45°: top-left to bottom-right.
    expect(card().props.start).toEqual({ x: point(0.146447), y: point(0.146447) });
    expect(card().props.end).toEqual({ x: point(0.853553), y: point(0.853553) });

    await pickNative("sunset", 0);

    expect(card().props.colors).toEqual(["#F97316", "#EC4899"]);
  });

  it("blurs the balance until it is revealed", async () => {
    render(<EffectsExample />);

    const blur = screen.getByTestId("balance-blur");
    expect(blur.props.intensity).toBe(60);
    expect(blur.props.tint).toBe("default");
    // Android needs a target and an explicit method to blur at all.
    expect(blur.props.blurTarget).toEqual({ current: expect.anything() });
    expect(blur.props.blurMethod).toBe("dimezisBlurViewSdk31Plus");

    await pickNative("dark", 1);
    expect(screen.getByTestId("balance-blur").props.tint).toBe("dark");

    await toggleNative("Hide balance", false);
    expect(screen.queryByTestId("balance-blur")).toBeNull();
  });

  it("lays out a 3×3 mesh with the middle point in the center", async () => {
    render(<EffectsExample />);
    const mesh = () => screen.getByTestId("mesh");

    expect(mesh().props.columns).toBe(3);
    expect(mesh().props.rows).toBe(3);
    expect(mesh().props.colors).toHaveLength(9);
    expect(mesh().props.points[4]).toEqual([0.5, 0.5]);

    await toggleNative("Smooth colors", false);
    expect(mesh().props.smoothsColors).toBe(false);
  });
});
