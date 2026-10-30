import { act, render, screen } from "@testing-library/react-native";
import {
  StyleSheet,
  Text,
} from "react-native";

import { Screen } from "@/shared/components";
import { useThemeStore } from "@/styles";
import { colors, spacing } from "@/styles/tokens";

import { getByHostType, queryAllByHostType, queryByHostType } from "../../helpers/host";

/** The safe-area mock reports zero insets, so only the gutter remains. */
const BOTTOM_CLEARANCE = spacing[6];

function contentStyle() {
  return StyleSheet.flatten(
    getByHostType("RCTScrollView").props.contentContainerStyle,
  );
}

beforeEach(async () => {
  await act(() => useThemeStore.getState().setMode("light"));
});

describe("Screen", () => {
  it("renders its children", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.getByText("Body")).toBeOnTheScreen();
  });

  it("paints the themed background on the container", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    const container = queryAllByHostType("View")[0];

    expect(StyleSheet.flatten(container.props.style)).toEqual(
      expect.objectContaining({
        flex: 1,
        backgroundColor: colors.background,
      }),
    );
  });

  it("scrolls by default", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(queryByHostType("RCTScrollView")).not.toBeNull();
  });

  it("does not scroll when told not to", async () => {
    await render(
      <Screen scroll={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(queryByHostType("RCTScrollView")).toBeNull();
    expect(screen.getByText("Body")).toBeOnTheScreen();
  });

  it("applies the standard gutter", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().padding).toBe(spacing[4]);
  });

  it("drops the gutter when padded is off", async () => {
    await render(
      <Screen padded={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().padding).toBeUndefined();
  });

  it("clears the bottom inset below the content", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(contentStyle().paddingBottom).toBe(BOTTOM_CLEARANCE);
  });

  it("hands the bottom inset to the footer instead of the content", async () => {
    await render(
      <Screen footer={<Text>Save</Text>}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.getByText("Save")).toBeOnTheScreen();
    expect(contentStyle().paddingBottom).toBe(0);
  });

  it("wraps in a KeyboardAvoidingView only when asked", async () => {
    const { rerender } = await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.queryByTestId("screen-keyboard-avoiding")).toBeNull();

    await rerender(
      <Screen keyboardAvoiding>
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.queryByTestId("screen-keyboard-avoiding")).not.toBeNull();
  });

  it("forwards ScrollView props", async () => {
    await render(
      <Screen showsVerticalScrollIndicator={false}>
        <Text>Body</Text>
      </Screen>,
    );

    expect(
      getByHostType("RCTScrollView").props.showsVerticalScrollIndicator,
    ).toBe(false);
  });

  it("keeps taps working while the keyboard is up", async () => {
    await render(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(
      getByHostType("RCTScrollView").props.keyboardShouldPersistTaps,
    ).toBe("handled");
  });
});
