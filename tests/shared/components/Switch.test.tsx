import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Host, Switch as NativeSwitch } from "@expo/ui";

import { Switch } from "@/shared/components/Switch";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Switch", () => {
  it("reports its state to assistive technology", () => {
    render(<Switch value onValueChange={jest.fn()} testID="switch" />);

    const control = screen.getByTestId("switch");

    expect(control.props.accessibilityRole).toBe("switch");
    expect(control.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it("asks for the negated value when pressed", () => {
    const onValueChange = jest.fn();
    render(
      <Switch value={false} onValueChange={onValueChange} testID="switch" />,
    );

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("asks to turn off when already on", () => {
    const onValueChange = jest.fn();
    render(<Switch value onValueChange={onValueChange} testID="switch" />);

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it("stays controlled — it does not flip itself", () => {
    render(<Switch value={false} onValueChange={jest.fn()} testID="switch" />);

    fireEvent.press(screen.getByTestId("switch"));

    expect(
      screen.getByTestId("switch").props.accessibilityState.checked,
    ).toBe(false);
  });

  it("does not respond while disabled", () => {
    const onValueChange = jest.fn();
    render(
      <Switch
        value={false}
        disabled
        onValueChange={onValueChange}
        testID="switch"
      />,
    );

    fireEvent.press(screen.getByTestId("switch"));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders a label and description", () => {
    render(
      <Switch
        value
        onValueChange={jest.fn()}
        label="Notifications"
        description="Push alerts for new messages"
      />,
    );

    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Push alerts for new messages")).toBeOnTheScreen();
  });

  it("renders the platform's own control, tinted with the theme", () => {
    render(<Switch value onValueChange={jest.fn()} />);

    const control = screen.UNSAFE_getByType(NativeSwitch);
    const host = screen.UNSAFE_getByType(Host);

    expect(control.props.value).toBe(true);
    expect(host.props.seedColor).toBe(colors.primary);
    expect(host.props.colorScheme).toBe("light");

    act(() => useThemeStore.getState().setMode("dark"));

    expect(screen.UNSAFE_getByType(Host).props.seedColor).toBe(
      darkColors.primary,
    );
    expect(screen.UNSAFE_getByType(Host).props.colorScheme).toBe("dark");
  });

  it("reports a toggle made on the native control", () => {
    const onValueChange = jest.fn();
    render(<Switch value={false} onValueChange={onValueChange} />);

    act(() => screen.UNSAFE_getByType(NativeSwitch).props.onValueChange(true));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("disables the native control too", () => {
    render(<Switch value disabled onValueChange={jest.fn()} />);

    expect(screen.UNSAFE_getByType(NativeSwitch).props.disabled).toBe(true);
  });
});
