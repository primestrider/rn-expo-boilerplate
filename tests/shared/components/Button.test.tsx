import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/shared/components";
import { colors, fontSize, palette, spacing } from "@/styles/tokens";

import { queryByHostType } from "../../helpers/host";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

describe("Button", () => {
  it("renders its title", async () => {
    await render(<Button title="Save" />);

    expect(screen.getByText("Save")).toBeOnTheScreen();
  });

  it("renders children alongside the title", async () => {
    await render(
      <Button title="Save">
        <Text>icon</Text>
      </Button>,
    );

    expect(screen.getByText("Save")).toBeOnTheScreen();
    expect(screen.getByText("icon")).toBeOnTheScreen();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await render(<Button title="Save" onPress={onPress} />);

    await fireEvent.press(screen.getByText("Save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress while disabled", async () => {
    const onPress = jest.fn();
    await render(<Button title="Save" disabled onPress={onPress} testID="button" />);

    await fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress while loading", async () => {
    const onPress = jest.fn();
    await render(<Button title="Save" loading onPress={onPress} testID="button" />);

    await fireEvent.press(screen.getByTestId("button"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a spinner only while loading", async () => {
    const { rerender } = await render(<Button title="Save" />);

    expect(queryByHostType("ActivityIndicator")).toBeNull();

    await rerender(<Button title="Save" loading />);

    expect(queryByHostType("ActivityIndicator")).not.toBeNull();
  });

  it("dims itself when disabled", async () => {
    await render(<Button title="Save" disabled testID="button" />);

    expect(styleOf("button").opacity).toBe(0.5);
  });

  describe("variants", () => {
    it.each([
      ["primary", colors.primary, colors.primaryForeground],
      ["secondary", colors.secondary, colors.secondaryForeground],
      ["destructive", colors.destructive, colors.destructiveForeground],
    ] as const)("%s uses its themed colors", async (variant, background, label) => {
      await render(<Button title="Save" variant={variant} testID="button" />);

      expect(styleOf("button").backgroundColor).toBe(background);
      expect(
        StyleSheet.flatten(screen.getByText("Save").props.style).color,
      ).toBe(label);
    });

    it("outline draws a border over a transparent background", async () => {
      await render(<Button title="Save" variant="outline" testID="button" />);

      const style = styleOf("button");

      expect(style.backgroundColor).toBe(palette.transparent);
      expect(style.borderWidth).toBe(1.5);
      expect(style.borderColor).toBe(colors.border);
    });

    it("ghost stays transparent and borderless", async () => {
      await render(<Button title="Save" variant="ghost" testID="button" />);

      const style = styleOf("button");

      expect(style.backgroundColor).toBe(palette.transparent);
      expect(style.borderWidth).toBe(0);
    });
  });

  describe("sizes", () => {
    it.each([
      ["sm", spacing[2], spacing[3], fontSize.sm],
      ["md", spacing[3], spacing[5], fontSize.base],
      ["lg", spacing[4], spacing[7], fontSize.lg],
    ] as const)("%s applies its padding and text size", async (size, py, px, font) => {
      await render(<Button title="Save" size={size} testID="button" />);

      const style = styleOf("button");

      expect(style.paddingVertical).toBe(py);
      expect(style.paddingHorizontal).toBe(px);
      expect(
        StyleSheet.flatten(screen.getByText("Save").props.style).fontSize,
      ).toBe(font);
    });
  });

  it("stretches to full width only when block is set", async () => {
    const { rerender } = await render(<Button title="Save" testID="button" />);

    expect(styleOf("button").width).toBeUndefined();

    await rerender(<Button title="Save" block testID="button" />);

    expect(styleOf("button").width).toBe("100%");
  });

  it("merges a caller-provided style", async () => {
    await render(<Button title="Save" testID="button" style={{ marginTop: 24 }} />);

    expect(styleOf("button").marginTop).toBe(24);
  });
});
