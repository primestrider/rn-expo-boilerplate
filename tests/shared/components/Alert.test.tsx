import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Alert } from "@/shared/components/Alert";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii } from "@/styles/tokens";

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

beforeEach(async () => {
  await act(() => useThemeStore.getState().setMode("light"));
});

describe("Alert", () => {
  it("renders its title and description", async () => {
    await render(<Alert title="Saved" description="Your changes are live." />);

    expect(screen.getByText("Saved")).toBeOnTheScreen();
    expect(screen.getByText("Your changes are live.")).toBeOnTheScreen();
  });

  it("announces itself as an alert", async () => {
    await render(<Alert title="Saved" testID="alert" />);

    expect(screen.getByTestId("alert").props.accessibilityRole).toBe("alert");
  });

  it.each([
    ["info", colors.info],
    ["success", colors.success],
    ["warning", colors.warning],
    ["error", colors.destructive],
  ] as const)("tints the %s variant with its semantic color", async (variant, tint) => {
    await render(<Alert variant={variant} title="Heads up" testID="alert" />);

    expect(styleOf("alert").backgroundColor).toBe(`${tint}1A`);
    expect(styleOf("alert-accent").backgroundColor).toBe(tint);
  });

  it("keeps body text on the foreground color rather than the tint", async () => {
    await render(<Alert variant="success" title="Saved" />);

    const titleStyle = StyleSheet.flatten(
      screen.getByText("Saved").props.style,
    );

    expect(titleStyle.color).toBe(colors.foreground);
    expect(titleStyle.color).not.toBe(colors.success);
  });

  it("rounds to the 2xl radius", async () => {
    await render(<Alert title="Saved" testID="alert" />);

    expect(styleOf("alert").borderRadius).toBe(radii["2xl"]);
  });

  it("shows a dismiss affordance only when it can be dismissed", async () => {
    const { rerender } = await render(<Alert title="Saved" />);

    expect(screen.queryByLabelText("Dismiss")).toBeNull();

    await rerender(<Alert title="Saved" onClose={jest.fn()} />);

    expect(screen.getByLabelText("Dismiss")).toBeOnTheScreen();
  });

  it("calls onClose when dismissed", async () => {
    const onClose = jest.fn();
    await render(<Alert title="Saved" onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText("Dismiss"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders an action slot", async () => {
    await render(<Alert title="Saved" action={<Alert title="Retry" />} />);

    expect(screen.getByText("Retry")).toBeOnTheScreen();
  });

  it("follows the active color scheme", async () => {
    await render(<Alert variant="success" title="Saved" testID="alert" />);

    expect(styleOf("alert-accent").backgroundColor).toBe(colors.success);

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("alert-accent").backgroundColor).toBe(darkColors.success);
  });
});
