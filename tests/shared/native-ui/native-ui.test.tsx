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

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
];

beforeEach(() => {
  // The fallback `ProgressBar` animates; fake timers keep it inside the test.
  jest.useFakeTimers();
  act(() => useThemeStore.getState().setMode("light"));
});

afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe("NativeHost", () => {
  it("follows the app theme, not only the device", () => {
    render(<NativeHost />);

    expect(screen.UNSAFE_getByType(Host).props.colorScheme).toBe("light");
    expect(screen.UNSAFE_getByType(Host).props.seedColor).toBe(colors.primary);

    act(() => useThemeStore.getState().setMode("dark"));

    expect(screen.UNSAFE_getByType(Host).props.colorScheme).toBe("dark");
    expect(screen.UNSAFE_getByType(Host).props.seedColor).toBe(
      darkColors.primary,
    );
  });

  it("lets a tree override the theme", () => {
    render(<NativeHost colorScheme="dark" seedColor="#ff0000" />);

    expect(screen.UNSAFE_getByType(Host).props.colorScheme).toBe("dark");
    expect(screen.UNSAFE_getByType(Host).props.seedColor).toBe("#ff0000");
  });
});

// Jest runs the iOS build, so the plain imports resolve to the fallbacks.
describe("fallbacks on iOS and web", () => {
  it("renders a linear indicator as ProgressBar", () => {
    render(<ProgressIndicator value={0.4} />);

    const bar = screen.UNSAFE_getByType(ProgressBar);

    expect(bar.props.value).toBe(0.4);
    expect(bar.props.indeterminate).toBe(false);
  });

  it("makes ProgressBar indeterminate without a value", () => {
    render(<ProgressIndicator />);

    expect(screen.UNSAFE_getByType(ProgressBar).props.indeterminate).toBe(true);
  });

  it("renders a circular indicator as Spinner", () => {
    render(<ProgressIndicator type="circular" />);

    expect(screen.UNSAFE_getByType(Spinner)).toBeTruthy();
  });

  it("renders SegmentedControl as segmented Tabs", () => {
    const onChange = jest.fn();
    render(
      <SegmentedControl options={options} value="day" onChange={onChange} />,
    );

    const tabs = screen.UNSAFE_getByType(Tabs);

    expect(tabs.props.variant).toBe("segmented");
    expect(tabs.props.value).toBe("day");
    expect(tabs.props.items).toBe(options);
  });
});

describe("Android (Jetpack Compose)", () => {
  it("maps value to Compose progress, clamped", () => {
    render(<AndroidProgressIndicator value={1.5} />);

    const bar = screen.UNSAFE_getByType(LinearProgressIndicator);

    expect(bar.props.progress).toBe(1);
    expect(bar.props.color).toBe(colors.primary);
  });

  it("uses Compose's indeterminate mode without a value", () => {
    render(<AndroidProgressIndicator type="circular" />);

    expect(
      screen.UNSAFE_getByType(CircularProgressIndicator).props.progress,
    ).toBeNull();
  });

  it("selects one segment and reports the tapped one", () => {
    const onChange = jest.fn();
    render(
      <AndroidSegmentedControl
        options={options}
        value="day"
        onChange={onChange}
      />,
    );

    const [day, week] = screen.UNSAFE_getAllByType(SegmentedButton);

    expect(day.props.selected).toBe(true);
    expect(week.props.selected).toBe(false);

    act(() => week.props.onClick());

    expect(onChange).toHaveBeenCalledWith("week");
  });
});
