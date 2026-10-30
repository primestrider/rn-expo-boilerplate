import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import {
  CHECKBOX_BOX_TEST_ID,
  CHECKBOX_MARK_TEST_ID,
  Checkbox,
} from "@/shared/components/Checkbox";
import { useThemeStore } from "@/styles";
import { colors, darkColors, palette, radii, spacing } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function box() {
  return styleOf(CHECKBOX_BOX_TEST_ID);
}

beforeEach(async () => {
  // The mark animation would otherwise keep a timer pending past the test.
  jest.useFakeTimers();
  await act(() => useThemeStore.getState().setMode("light"));
});

afterEach(async () => {
  await act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe("Checkbox", () => {
  it("renders its label and description", async () => {
    await render(<Checkbox label="Remember me" description="On this device only" />);

    expect(screen.getByText("Remember me")).toBeOnTheScreen();
    expect(screen.getByText("On this device only")).toBeOnTheScreen();
  });

  it("exposes the checkbox role", async () => {
    await render(<Checkbox testID="checkbox" label="Remember me" />);

    expect(screen.getByTestId("checkbox").props.accessibilityRole).toBe(
      "checkbox",
    );
  });

  it("reports its checked state to assistive tech", async () => {
    const { rerender } = await render(<Checkbox testID="checkbox" />);

    expect(screen.getByTestId("checkbox").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );

    await rerender(<Checkbox testID="checkbox" checked />);

    expect(screen.getByTestId("checkbox").props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it("reports indeterminate as mixed", async () => {
    await render(<Checkbox testID="checkbox" indeterminate />);

    expect(
      screen.getByTestId("checkbox").props.accessibilityState.checked,
    ).toBe("mixed");
  });

  it("calls onChange with the negated value", async () => {
    const onChange = jest.fn();
    await render(<Checkbox testID="checkbox" checked={false} onChange={onChange} />);

    await fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when already checked", async () => {
    const onChange = jest.fn();
    await render(<Checkbox testID="checkbox" checked onChange={onChange} />);

    await fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not toggle itself while the caller keeps checked unchanged", async () => {
    await render(<Checkbox testID="checkbox" checked={false} onChange={jest.fn()} />);

    await fireEvent.press(screen.getByTestId("checkbox"));

    expect(
      screen.getByTestId("checkbox").props.accessibilityState.checked,
    ).toBe(false);
    expect(box().backgroundColor).toBe(palette.transparent);
  });

  it("does not call onChange while disabled", async () => {
    const onChange = jest.fn();
    await render(<Checkbox testID="checkbox" disabled onChange={onChange} />);

    await fireEvent.press(screen.getByTestId("checkbox"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("dims itself when disabled", async () => {
    await render(<Checkbox testID="checkbox" disabled />);

    expect(styleOf("checkbox").opacity).toBe(0.5);
    expect(
      screen.getByTestId("checkbox").props.accessibilityState.disabled,
    ).toBe(true);
  });

  describe("box", () => {
    it("stays at the md radius so it never reads as a radio", async () => {
      await render(<Checkbox />);

      expect(box().borderRadius).toBe(radii.md);
      expect(box().borderRadius).not.toBe(radii.full);
    });

    it("outlines an unchecked box over a transparent fill", async () => {
      await render(<Checkbox />);

      expect(box().backgroundColor).toBe(palette.transparent);
      expect(box().borderColor).toBe(colors.border);
    });

    it("fills a checked box with the primary color", async () => {
      await render(<Checkbox checked />);

      expect(box().backgroundColor).toBe(colors.primary);
      expect(box().borderColor).toBe(colors.primary);
    });

    it("fills an indeterminate box even when unchecked", async () => {
      await render(<Checkbox indeterminate checked={false} />);

      expect(box().backgroundColor).toBe(colors.primary);
    });

    it.each([
      ["sm", spacing[4]],
      ["md", spacing[5]],
    ] as const)("sizes %s from the spacing scale", async (size, expected) => {
      await render(<Checkbox size={size} />);

      expect(box().width).toBe(expected);
      expect(box().height).toBe(expected);
    });

    it("follows the active color scheme", async () => {
      await render(<Checkbox checked />);

      expect(box().backgroundColor).toBe(colors.primary);

      await act(() => useThemeStore.getState().setMode("dark"));

      expect(box().backgroundColor).toBe(darkColors.primary);
    });
  });

  describe("mark", () => {
    it("draws the checkmark from borders rather than a glyph", async () => {
      await render(<Checkbox checked />);

      const mark = styleOf(CHECKBOX_MARK_TEST_ID);

      expect(mark.borderBottomWidth).toBeGreaterThan(0);
      expect(mark.borderRightWidth).toBeGreaterThan(0);
      expect(mark.borderColor).toBe(colors.primaryForeground);
      expect(mark.transform).toEqual([{ rotate: "45deg" }]);
    });

    it("swaps the checkmark for a bar when indeterminate", async () => {
      await render(<Checkbox indeterminate checked />);

      const mark = styleOf(CHECKBOX_MARK_TEST_ID);

      expect(mark.transform).toBeUndefined();
      expect(mark.borderRadius).toBe(radii.full);
      expect(mark.backgroundColor).toBe(colors.primaryForeground);
    });
  });

  describe("error", () => {
    it("renders below the row in the destructive color", async () => {
      await render(<Checkbox label="I agree" error="Required" />);

      const error = screen.getByText("Required");

      expect(error).toBeOnTheScreen();
      expect(StyleSheet.flatten(error.props.style).color).toBe(
        colors.destructive,
      );
    });

    it("renders nothing when there is no error", async () => {
      await render(<Checkbox label="I agree" />);

      expect(screen.queryByText("Required")).toBeNull();
    });
  });

  it("merges a caller-provided style", async () => {
    await render(<Checkbox testID="checkbox" style={{ marginTop: spacing[6] }} />);

    expect(styleOf("checkbox").marginTop).toBe(spacing[6]);
  });

  it("forwards props to the underlying Pressable", async () => {
    await render(<Checkbox testID="checkbox" accessibilityLabel="Terms" />);

    expect(screen.getByTestId("checkbox").props.accessibilityLabel).toBe(
      "Terms",
    );
  });
});
