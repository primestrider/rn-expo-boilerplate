import { Host } from "@expo/ui";
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
  SegmentedButton,
} from "@expo/ui/jetpack-compose";
import { act, render, screen } from "@testing-library/react-native";

import { ProgressBar } from "@/shared/components/ProgressBar";
import { Spinner } from "@/shared/components/Spinner";
import { Tabs } from "@/shared/components/Tabs";
import {
  NativeHost,
  ProgressIndicator,
  SegmentedControl,
} from "@/shared/native-ui";
import { ProgressIndicator as AndroidProgressIndicator } from "@/shared/native-ui/ProgressIndicator.android";
import { SegmentedControl as AndroidSegmentedControl } from "@/shared/native-ui/SegmentedControl.android";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";
import { getAllByComponent, getByComponent } from "../../helpers/host";

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
];

beforeEach(async () => {
  // The fallback `ProgressBar` animates; fake timers keep it inside the test.
  jest.useFakeTimers();
  await act(() => useThemeStore.getState().setMode("light"));
});

afterEach(async () => {
  await act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe("NativeHost", () => {
  it("follows the app theme, not only the device", async () => {
    await render(<NativeHost />);

    expect(getByComponent(Host).props.colorScheme).toBe("light");
    expect(getByComponent(Host).props.seedColor).toBe(colors.primary);

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(getByComponent(Host).props.colorScheme).toBe("dark");
    expect(getByComponent(Host).props.seedColor).toBe(
      darkColors.primary,
    );
  });

  it("lets a tree override the theme", async () => {
    await render(<NativeHost colorScheme="dark" seedColor="#ff0000" />);

    expect(getByComponent(Host).props.colorScheme).toBe("dark");
    expect(getByComponent(Host).props.seedColor).toBe("#ff0000");
  });
});

// Jest runs the iOS build, so the plain imports resolve to the fallbacks.
describe("fallbacks on iOS and web", () => {
  it("renders a linear indicator as ProgressBar", async () => {
    await render(<ProgressIndicator value={0.4} />);

    const bar = getByComponent(ProgressBar);

    expect(bar.props.value).toBe(0.4);
    expect(bar.props.indeterminate).toBe(false);
  });

  it("makes ProgressBar indeterminate without a value", async () => {
    await render(<ProgressIndicator />);

    expect(getByComponent(ProgressBar).props.indeterminate).toBe(true);
  });

  it("renders a circular indicator as Spinner", async () => {
    await render(<ProgressIndicator type="circular" />);

    expect(getByComponent(Spinner)).toBeTruthy();
  });

  it("renders SegmentedControl as segmented Tabs", async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl options={options} value="day" onChange={onChange} />,
    );

    const tabs = getByComponent(Tabs);

    expect(tabs.props.variant).toBe("segmented");
    expect(tabs.props.value).toBe("day");
    expect(tabs.props.items).toBe(options);
  });
});

describe("Android (Jetpack Compose)", () => {
  it("maps value to Compose progress, clamped", async () => {
    await render(<AndroidProgressIndicator value={1.5} />);

    const bar = getByComponent(LinearProgressIndicator);

    expect(bar.props.progress).toBe(1);
    expect(bar.props.color).toBe(colors.primary);
  });

  it("uses Compose's indeterminate mode without a value", async () => {
    await render(<AndroidProgressIndicator type="circular" />);

    expect(
      getByComponent(CircularProgressIndicator).props.progress,
    ).toBeNull();
  });

  it("selects one segment and reports the tapped one", async () => {
    const onChange = jest.fn();
    await render(
      <AndroidSegmentedControl
        options={options}
        value="day"
        onChange={onChange}
      />,
    );

    const [day, week] = getAllByComponent(SegmentedButton);

    expect(day.props.selected).toBe(true);
    expect(week.props.selected).toBe(false);

    await act(() => week.props.onClick());

    expect(onChange).toHaveBeenCalledWith("week");
  });
});
