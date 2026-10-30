import { BottomSheet as NativeBottomSheet } from "@expo/ui";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ListItem } from "@/shared/components/ListItem";
import {
  SELECT_CHECK_TEST_ID,
  SELECT_CHEVRON_TEST_ID,
  Select,
  selectOptionTestID,
  type SelectOption,
} from "@/shared/components/Select";
import { useThemeStore } from "@/styles";
import { colors, darkColors, radii, spacing } from "@/styles/tokens";
import { getAllByComponent, getByComponent } from "../../helpers/host";

type Frequency = "daily" | "weekly" | "monthly";

const options: SelectOption<Frequency>[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly", description: "Every Monday" },
  { value: "monthly", label: "Monthly", disabled: true },
];

/** Resolved style of whatever carries this testID — trigger, row or glyph. */
function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style);
}

function textStyleOf(content: string) {
  return StyleSheet.flatten(screen.getByText(content).props.style);
}

async function openSheet() {
  await fireEvent.press(screen.getByTestId("select"));
}

/**
 * Taps one row in the sheet. Rendered inline, the native sheet sits under a
 * `pointerEvents="none"` host (on device it is presented in its own layer),
 * so the row's handler is called directly rather than through `fireEvent`.
 */
async function pressOption(value: string) {
  const row = getAllByComponent(ListItem)
    .find((item) => item.props.testID === selectOptionTestID(value));

  await act(() => row!.props.onPress());
}

/** Drains the sheet's enter/exit animation so nothing outlives the test. */
async function settle() {
  await act(() => jest.advanceTimersByTime(400));
}

beforeEach(async () => {
  jest.useFakeTimers();
  await act(() => useThemeStore.getState().setMode("light"));
});

afterEach(async () => {
  await act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe("Select", () => {
  it("shows the placeholder in the muted color while nothing is chosen", async () => {
    await render(
      <Select
        testID="select"
        options={options}
        onChange={jest.fn()}
        placeholder="Pick a cadence"
      />,
    );

    expect(screen.getByText("Pick a cadence")).toBeOnTheScreen();
    expect(textStyleOf("Pick a cadence").color).toBe(colors.mutedForeground);
  });

  it("shows the selected option's label in the foreground color", async () => {
    await render(
      <Select
        testID="select"
        options={options}
        value="weekly"
        onChange={jest.fn()}
        placeholder="Pick a cadence"
      />,
    );

    expect(screen.queryByText("Pick a cadence")).toBeNull();
    expect(textStyleOf("Weekly").color).toBe(colors.foreground);
  });

  it("draws its own chevron", async () => {
    await render(<Select testID="select" options={options} onChange={jest.fn()} />);

    expect(styleOf(SELECT_CHEVRON_TEST_ID).borderColor).toBe(
      colors.mutedForeground,
    );
  });

  it("matches an Input at rest: 1px border, 24px radius, 16px gutter", async () => {
    await render(<Select testID="select" options={options} onChange={jest.fn()} />);

    expect(styleOf("select")).toEqual(
      expect.objectContaining({
        borderWidth: 1,
        borderRadius: radii["2xl"],
        paddingHorizontal: spacing[4],
        borderColor: colors.border,
        backgroundColor: colors.background,
      }),
    );
  });

  it("opens the sheet when the trigger is pressed", async () => {
    await render(<Select testID="select" options={options} onChange={jest.fn()} />);

    expect(screen.queryByTestId("bottom-sheet")).toBeNull();

    await openSheet();

    expect(screen.getByTestId("bottom-sheet")).toBeOnTheScreen();
  });

  it("lists every option in the sheet", async () => {
    await render(<Select testID="select" options={options} onChange={jest.fn()} />);

    await openSheet();

    expect(screen.getByTestId(selectOptionTestID("daily"))).toBeOnTheScreen();
    expect(screen.getByTestId(selectOptionTestID("weekly"))).toBeOnTheScreen();
    expect(screen.getByTestId(selectOptionTestID("monthly"))).toBeOnTheScreen();
    expect(screen.getByText("Every Monday")).toBeOnTheScreen();
  });

  it("uses an explicit title as the sheet heading", async () => {
    await render(
      <Select
        testID="select"
        label="Frequency"
        title="Choose a cadence"
        options={options}
        onChange={jest.fn()}
      />,
    );

    await openSheet();

    expect(screen.getByText("Choose a cadence")).toBeOnTheScreen();
  });

  it("falls back to the field label as the sheet heading", async () => {
    await render(
      <Select
        testID="select"
        label="Frequency"
        options={options}
        onChange={jest.fn()}
      />,
    );

    await openSheet();

    // Once on the field, once on the sheet.
    expect(screen.getAllByText("Frequency")).toHaveLength(2);
  });

  it("marks only the chosen option as selected", async () => {
    await render(
      <Select
        testID="select"
        options={options}
        value="weekly"
        onChange={jest.fn()}
      />,
    );

    await openSheet();

    expect(
      screen.getByTestId(selectOptionTestID("weekly")).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: true }));
    expect(
      screen.getByTestId(selectOptionTestID("daily")).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: false }));
    expect(styleOf(SELECT_CHECK_TEST_ID).borderColor).toBe(colors.primary);
  });

  it("reports the chosen value through onChange and closes the sheet", async () => {
    const onChange = jest.fn();
    await render(<Select testID="select" options={options} onChange={onChange} />);

    await openSheet();
    await pressOption("weekly");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("weekly");

    await settle();

    // The native sheet unmounts its content only once its own dismiss
    // animation reports back, which Jest never does — the request is what counts.
    expect(getByComponent(NativeBottomSheet).props.isPresented).toBe(
      false,
    );
  });

  it("refuses to select a disabled option", async () => {
    const onChange = jest.fn();
    await render(<Select testID="select" options={options} onChange={onChange} />);

    await openSheet();
    await pressOption("monthly");

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("bottom-sheet")).toBeOnTheScreen();
  });

  it("does not open while disabled, and dims to half", async () => {
    await render(
      <Select testID="select" disabled options={options} onChange={jest.fn()} />,
    );

    await openSheet();

    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
    expect(styleOf("select").opacity).toBe(0.5);
  });

  it("lets the error win over the hint", async () => {
    await render(
      <Select
        testID="select"
        options={options}
        onChange={jest.fn()}
        error="Pick one to continue"
        hint="How often we sync"
      />,
    );

    expect(screen.getByText("Pick one to continue")).toBeOnTheScreen();
    expect(screen.queryByText("How often we sync")).toBeNull();
    expect(textStyleOf("Pick one to continue").color).toBe(colors.destructive);
  });

  it("shows the hint when there is no error", async () => {
    await render(
      <Select
        testID="select"
        options={options}
        onChange={jest.fn()}
        hint="How often we sync"
      />,
    );

    expect(textStyleOf("How often we sync").color).toBe(colors.muted);
  });

  it("paints the field destructive while it carries an error", async () => {
    await render(
      <Select
        testID="select"
        label="Frequency"
        options={options}
        onChange={jest.fn()}
        error="Pick one to continue"
      />,
    );

    expect(styleOf("select").borderColor).toBe(colors.destructive);
    expect(textStyleOf("Frequency").color).toBe(colors.destructive);
  });

  it("names itself with both the label and the current value", async () => {
    await render(
      <Select
        testID="select"
        label="Frequency"
        options={options}
        value="weekly"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Frequency, Weekly")).toBeOnTheScreen();
  });

  it("follows the active color scheme", async () => {
    await render(<Select testID="select" options={options} onChange={jest.fn()} />);

    expect(styleOf("select").borderColor).toBe(colors.border);
    expect(styleOf("select").backgroundColor).toBe(colors.background);

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(styleOf("select").borderColor).toBe(darkColors.border);
    expect(styleOf("select").backgroundColor).toBe(darkColors.background);
  });
});
