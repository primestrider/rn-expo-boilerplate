import { BottomSheet as NativeBottomSheet } from "@expo/ui";
import { act, render, screen } from "@testing-library/react-native";
import { ScrollView, StyleSheet, Text } from "react-native";

import { BottomSheet } from "@/shared/components/BottomSheet";
import { useThemeStore } from "@/styles";
import { colors, darkColors, spacing } from "@/styles/tokens";
import { getByComponent } from "../../helpers/host";

function nativeSheet() {
  return getByComponent(NativeBottomSheet);
}

beforeEach(async () => {
  await act(() => useThemeStore.getState().setMode("light"));
});

describe("BottomSheet", () => {
  it("renders nothing while closed", async () => {
    await render(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sort by</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.isPresented).toBe(false);
    expect(screen.queryByText("Sort by")).toBeNull();
  });

  it("renders its content while open", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.isPresented).toBe(true);
    expect(screen.getByText("Newest first")).toBeOnTheScreen();
  });

  it("renders an optional title", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()} title="Sort by">
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(screen.getByText("Sort by")).toBeOnTheScreen();
  });

  it("closes when the native sheet is dismissed", async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet visible onClose={onClose}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    await act(() => nativeSheet().props.onDismiss());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("lets the platform dismiss it by default", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.shouldDismissOnClickOutside).toBe(true);
    expect(nativeSheet().props.shouldDismissOnBackPress).toBe(true);
    expect(nativeSheet().props.modifiers).toBeUndefined();
  });

  it("locks the scrim, back press and swipe when it cannot be dismissed", async () => {
    await render(
      <BottomSheet visible dismissable={false} onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    expect(nativeSheet().props.shouldDismissOnClickOutside).toBe(false);
    expect(nativeSheet().props.shouldDismissOnBackPress).toBe(false);
    // Jest runs the iOS build, where the swipe is locked by a modifier.
    expect(nativeSheet().props.modifiers).toHaveLength(1);
  });

  it("scrolls content rather than letting it run off the screen", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const scroller = getByComponent(ScrollView);
    const style = StyleSheet.flatten(scroller.props.style);

    expect(style.maxHeight).toBeGreaterThan(0);
  });

  it("applies the standard gutter by default", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const content = StyleSheet.flatten(
      getByComponent(ScrollView).props.contentContainerStyle,
    );

    expect(nativeSheet().props.contentPadding).toBe(0);
    expect(content.paddingHorizontal).toBe(spacing[4]);
  });

  it("drops the gutter for rows that carry their own", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()} padded={false}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const content = StyleSheet.flatten(
      getByComponent(ScrollView).props.contentContainerStyle,
    );

    expect(content?.paddingHorizontal).toBeUndefined();
  });

  it("follows the active color scheme", async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Newest first</Text>
      </BottomSheet>,
    );

    const surface = () =>
      StyleSheet.flatten(screen.getByTestId("bottom-sheet").props.style)
        .backgroundColor;

    expect(nativeSheet().props.containerColor).toBe(colors.card);
    expect(surface()).toBe(colors.card);

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(nativeSheet().props.containerColor).toBe(darkColors.card);
    expect(surface()).toBe(darkColors.card);
  });
});
