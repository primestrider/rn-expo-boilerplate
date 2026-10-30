import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import { StyleSheet, TextInput, type TextInputInstance } from "react-native";

import { changeLanguage } from "@/plugins/i18n";
import { Input } from "@/shared/components";
import { colors } from "@/styles/tokens";

describe("Input", () => {
  // The focus animation keeps a timer alive past the test; draining it under
  // fake timers stops Animated from touching a torn-down environment.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders a label and a hint", async () => {
    await render(<Input label="Email" hint="We never share this" />);

    expect(screen.getByText("Email")).toBeOnTheScreen();
    expect(screen.getByText("We never share this")).toBeOnTheScreen();
  });

  it("shows the error instead of the hint", async () => {
    await render(<Input label="Email" hint="We never share this" error="Required" />);

    expect(screen.getByText("Required")).toBeOnTheScreen();
    expect(screen.queryByText("We never share this")).toBeNull();
  });

  it("colors the label with the destructive tone when invalid", async () => {
    await render(<Input label="Email" error="Required" />);

    expect(
      StyleSheet.flatten(screen.getByText("Email").props.style).color,
    ).toBe(colors.destructive);
  });

  it("renders left and right adornments", async () => {
    await render(
      <Input
        placeholder="Search"
        leftIcon={<TextInput testID="left" />}
        rightIcon={<TextInput testID="right" />}
      />,
    );

    expect(screen.getByTestId("left")).toBeOnTheScreen();
    expect(screen.getByTestId("right")).toBeOnTheScreen();
  });

  it("forwards a ref to the underlying TextInput", async () => {
    const ref = createRef<TextInputInstance>();
    await render(<Input ref={ref} placeholder="Name" />);

    expect(ref.current).not.toBeNull();
  });

  describe("text changes", () => {
    it("passes plain text through untouched", async () => {
      const onChangeText = jest.fn();
      await render(<Input placeholder="Name" onChangeText={onChangeText} />);

      await fireEvent.changeText(screen.getByPlaceholderText("Name"), "John Doe");

      expect(onChangeText).toHaveBeenCalledWith("John Doe");
    });

    it.each([
      ["number", "12a3.4b", "123.4"],
      ["currency", "Rp 1000", "1000"],
    ] as const)("strips non-numeric input for type=%s", async (type, typed, expected) => {
      const onChangeText = jest.fn();
      await render(
        <Input placeholder="Amount" type={type} onChangeText={onChangeText} />,
      );

      await fireEvent.changeText(screen.getByPlaceholderText("Amount"), typed);

      expect(onChangeText).toHaveBeenCalledWith(expected);
    });

    it("keeps a currency value to whole digits, without leading zeros", async () => {
      const onChangeText = jest.fn();
      await render(
        <Input placeholder="Amount" type="currency" onChangeText={onChangeText} />,
      );

      await fireEvent.changeText(screen.getByPlaceholderText("Amount"), "0012.5");

      expect(onChangeText).toHaveBeenCalledWith("125");
    });

    it("groups the digits of a currency value on screen only", async () => {
      const onChangeText = jest.fn();
      await render(
        <Input
          placeholder="Amount"
          type="currency"
          value="10000000"
          onChangeText={onChangeText}
        />,
      );

      const input = screen.getByPlaceholderText("Amount");
      // Rupiah grouping, whatever language the test runs in.
      expect(input.props.value).toBe("10.000.000");

      // Typing into the grouped text hands back bare digits again.
      await fireEvent.changeText(input, `${input.props.value}5`);
      expect(onChangeText).toHaveBeenCalledWith("100000005");
    });

    it("groups rupiah with dots even when the UI is in English", async () => {
      await changeLanguage("en");

      await render(<Input placeholder="Amount" type="currency" value="1250000" />);

      expect(screen.getByPlaceholderText("Amount").props.value).toBe(
        "1.250.000",
      );
    });

    it("keeps letters for text inputs", async () => {
      const onChangeText = jest.fn();
      await render(<Input placeholder="Bio" type="text" onChangeText={onChangeText} />);

      await fireEvent.changeText(screen.getByPlaceholderText("Bio"), "a1b2");

      expect(onChangeText).toHaveBeenCalledWith("a1b2");
    });
  });

  describe("keyboard configuration per type", () => {
    it("configures the email keyboard", async () => {
      await render(<Input placeholder="Email" type="email" />);

      const input = screen.getByPlaceholderText("Email");

      expect(input.props.keyboardType).toBe("email-address");
      expect(input.props.autoCapitalize).toBe("none");
    });

    it("configures the phone keyboard", async () => {
      await render(<Input placeholder="Phone" type="phone" />);

      expect(screen.getByPlaceholderText("Phone").props.keyboardType).toBe(
        "phone-pad",
      );
    });

    it.each([
      ["number", "decimal-pad"],
      ["currency", "number-pad"],
    ] as const)("configures the keypad for type=%s", async (type, keyboardType) => {
      await render(<Input placeholder="Amount" type={type} />);

      expect(screen.getByPlaceholderText("Amount").props.keyboardType).toBe(
        keyboardType,
      );
    });

    it("masks a password", async () => {
      await render(<Input placeholder="Password" type="password" />);

      expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
        true,
      );
    });
  });

  describe("focus and blur", () => {
    it("notifies the caller", async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      await render(<Input placeholder="Name" onFocus={onFocus} onBlur={onBlur} />);

      const input = screen.getByPlaceholderText("Name");

      await fireEvent(input, "focus");
      expect(onFocus).toHaveBeenCalledTimes(1);

      await fireEvent(input, "blur");
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  it("dismisses the keyboard on submit and still notifies the caller", async () => {
    const { KeyboardController } = require("react-native-keyboard-controller");
    const onSubmitEditing = jest.fn();

    await render(<Input placeholder="Name" onSubmitEditing={onSubmitEditing} />);

    await fireEvent(screen.getByPlaceholderText("Name"), "submitEditing");

    expect(KeyboardController.dismiss).toHaveBeenCalled();
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it("marks the input non-editable when disabled", async () => {
    await render(<Input placeholder="Name" editable={false} />);

    expect(screen.getByPlaceholderText("Name").props.editable).toBe(false);
  });
});
