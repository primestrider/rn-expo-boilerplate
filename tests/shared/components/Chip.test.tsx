import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Chip } from "@/shared/components/Chip";
import { useThemeStore } from "@/styles";
import {
  colors,
  darkColors,
  fontSize,
  palette,
  radii,
  spacing,
} from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function textStyleOf(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

beforeEach(async () => {
  await act(() => useThemeStore.getState().setMode("light"));
});

describe("Chip", () => {
  it("renders its label", async () => {
    await render(<Chip label="Unread" />);

    expect(screen.getByText("Unread")).toBeOnTheScreen();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await render(<Chip label="Unread" onPress={onPress} testID="chip" />);

    await fireEvent.press(screen.getByTestId("chip"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress while disabled", async () => {
    const onPress = jest.fn();
    await render(<Chip label="Unread" disabled onPress={onPress} testID="chip" />);

    await fireEvent.press(screen.getByTestId("chip"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("dims itself when disabled", async () => {
    await render(<Chip label="Unread" disabled testID="chip" />);

    expect(styleOf("chip").opacity).toBe(0.5);
  });

  describe("accessibility", () => {
    it("announces itself as a button", async () => {
      await render(<Chip label="Unread" testID="chip" />);

      expect(screen.getByTestId("chip").props.accessibilityRole).toBe("button");
    });

    it("reports its selected and disabled state", async () => {
      await render(<Chip label="Unread" selected disabled testID="chip" />);

      expect(screen.getByTestId("chip").props.accessibilityState).toEqual(
        expect.objectContaining({ selected: true, disabled: true }),
      );
    });

    it("reports an unselected chip as such", async () => {
      await render(<Chip label="Unread" testID="chip" />);

      expect(screen.getByTestId("chip").props.accessibilityState).toEqual(
        expect.objectContaining({ selected: false, disabled: false }),
      );
    });
  });

  describe("selection", () => {
    it("fills with primary when selected", async () => {
      await render(<Chip label="Unread" selected testID="chip" />);

      const style = styleOf("chip");

      expect(style.backgroundColor).toBe(colors.primary);
      expect(style.borderColor).toBe(palette.transparent);
      expect(textStyleOf("Unread").color).toBe(colors.primaryForeground);
    });

    it("outlines a secondary fill when unselected", async () => {
      await render(<Chip label="Unread" testID="chip" />);

      const style = styleOf("chip");

      expect(style.backgroundColor).toBe(colors.secondary);
      expect(style.borderColor).toBe(colors.border);
      expect(textStyleOf("Unread").color).toBe(colors.secondaryForeground);
    });

    it("keeps the border width stable across states", async () => {
      const { rerender } = await render(<Chip label="Unread" testID="chip" />);

      expect(styleOf("chip").borderWidth).toBe(1);

      await rerender(<Chip label="Unread" selected testID="chip" />);

      expect(styleOf("chip").borderWidth).toBe(1);
    });
  });

  describe("sizes", () => {
    it("pads and sizes text tightly when small", async () => {
      await render(<Chip label="Unread" size="sm" testID="chip" />);

      const style = styleOf("chip");

      expect(style.paddingHorizontal).toBe(spacing[3]);
      expect(style.paddingVertical).toBe(spacing[1]);
      expect(textStyleOf("Unread").fontSize).toBe(fontSize.xs);
    });

    it("defaults to the medium size", async () => {
      await render(<Chip label="Unread" testID="chip" />);

      const style = styleOf("chip");

      expect(style.paddingHorizontal).toBe(spacing[4]);
      expect(style.paddingVertical).toBe(spacing[2]);
      expect(textStyleOf("Unread").fontSize).toBe(fontSize.sm);
    });
  });

  describe("remove affordance", () => {
    it("is absent unless onRemove is given", async () => {
      await render(<Chip label="Unread" />);

      expect(screen.queryByLabelText("Remove Unread")).toBeNull();
    });

    it("labels itself for screen readers", async () => {
      await render(<Chip label="Unread" onRemove={jest.fn()} />);

      expect(screen.getByLabelText("Remove Unread")).toBeOnTheScreen();
    });

    it("calls onRemove without triggering the chip's own press", async () => {
      const onPress = jest.fn();
      const onRemove = jest.fn();
      await render(<Chip label="Unread" onPress={onPress} onRemove={onRemove} />);

      await fireEvent.press(screen.getByLabelText("Remove Unread"));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    });

    it("does not remove while disabled", async () => {
      const onRemove = jest.fn();
      await render(<Chip label="Unread" disabled onRemove={onRemove} />);

      await fireEvent.press(screen.getByLabelText("Remove Unread"));

      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  it("is always fully rounded", async () => {
    await render(<Chip label="Unread" testID="chip" />);

    expect(styleOf("chip").borderRadius).toBe(radii.full);
  });

  it("follows the active color scheme", async () => {
    await render(<Chip label="Unread" testID="chip" />);

    expect(styleOf("chip").backgroundColor).toBe(colors.secondary);
    expect(styleOf("chip").borderColor).toBe(colors.border);

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("chip").backgroundColor).toBe(darkColors.secondary);
    expect(styleOf("chip").borderColor).toBe(darkColors.border);
    expect(textStyleOf("Unread").color).toBe(darkColors.secondaryForeground);
  });

  it("lets an external style win", async () => {
    await render(<Chip label="Unread" style={{ borderRadius: 2 }} testID="chip" />);

    expect(styleOf("chip").borderRadius).toBe(2);
  });
});
