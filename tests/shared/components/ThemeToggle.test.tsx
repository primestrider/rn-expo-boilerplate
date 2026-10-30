import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, useColorScheme } from "react-native";

import { ThemeToggle } from "@/shared/components";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

jest.mock("react-native/Libraries/Utilities/useColorScheme");

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

beforeEach(async () => {
  mockedUseColorScheme.mockReturnValue("light");
  await act(() => useThemeStore.getState().setMode("system"));
});

describe("ThemeToggle", () => {
  it("renders every mode", async () => {
    await render(<ThemeToggle />);

    expect(screen.getByLabelText("System")).toBeOnTheScreen();
    expect(screen.getByLabelText("Light")).toBeOnTheScreen();
    expect(screen.getByLabelText("Dark")).toBeOnTheScreen();
  });

  it("marks only the active mode as selected", async () => {
    await render(<ThemeToggle />);

    expect(screen.getByLabelText("System").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText("Dark").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("exposes the group to assistive technology", async () => {
    await render(<ThemeToggle />);

    expect(screen.getByLabelText("Color scheme")).toBeOnTheScreen();
  });

  it.each(["light", "dark", "system"] as const)(
    "switches the stored mode to %s",
    async (mode) => {
      await act(() => useThemeStore.getState().setMode("light"));
      await render(<ThemeToggle />);

      await fireEvent.press(
        screen.getByLabelText(mode.charAt(0).toUpperCase() + mode.slice(1)),
      );

      expect(useThemeStore.getState().mode).toBe(mode);
    },
  );

  it("moves the selection when a mode is pressed", async () => {
    await render(<ThemeToggle />);

    await fireEvent.press(screen.getByLabelText("Dark"));

    expect(screen.getByLabelText("Dark").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText("System").props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it("repaints itself in the scheme it switches to", async () => {
    await render(<ThemeToggle />);

    const lightLabel = StyleSheet.flatten(
      screen.getByText("System").props.style,
    );
    expect(lightLabel.color).toBe(colors.foreground);

    await fireEvent.press(screen.getByLabelText("Dark"));

    const darkLabel = StyleSheet.flatten(screen.getByText("Dark").props.style);
    expect(darkLabel.color).toBe(darkColors.foreground);
  });
});
