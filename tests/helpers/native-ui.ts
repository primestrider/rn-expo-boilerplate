import {
  Button,
  Picker,
  Switch,
  Text,
  TextInput,
} from "@expo/ui";
import { act, screen } from "@testing-library/react-native";

/**
 * `@expo/ui` controls render native views with no host text or press target
 * in Jest, so tests drive them the way the native side would: by calling the
 * callbacks on their props. These helpers find a control by what the user
 * sees on it — its label.
 */

function byLabel<T extends { props: { label?: string } }>(
  instances: T[],
  label: string,
  kind: string,
): T {
  const match = instances.find((instance) => instance.props.label === label);
  if (!match) throw new Error(`No native ${kind} labelled "${label}"`);
  return match;
}

export function nativeButton(label: string) {
  return byLabel(screen.UNSAFE_getAllByType(Button), label, "Button");
}

export function queryNativeButton(label: string) {
  return screen
    .UNSAFE_queryAllByType(Button)
    .find((button) => button.props.label === label);
}

export function nativeSwitch(label: string) {
  return byLabel(screen.UNSAFE_getAllByType(Switch), label, "Switch");
}

/** Presses a native button and waits for the async work it starts. */
export async function pressNative(label: string) {
  await act(async () => {
    await nativeButton(label).props.onPress?.();
  });
}

export async function toggleNative(label: string, value: boolean) {
  await act(async () => {
    await nativeSwitch(label).props.onValueChange(value);
  });
}

/** Picks a value in the `index`-th native Picker on screen. */
export async function pickNative(value: string, index = 0) {
  await act(async () => {
    await screen.UNSAFE_getAllByType(Picker)[index].props.onValueChange(value);
  });
}

/** Types into the `index`-th native TextInput on screen. */
export async function typeNative(text: string, index = 0) {
  await act(async () => {
    await screen.UNSAFE_getAllByType(TextInput)[index].props.onChangeText?.(text);
  });
}

/** Every string rendered through a native `Text`, in tree order. */
export function nativeTexts(): string[] {
  return screen
    .UNSAFE_queryAllByType(Text)
    .map((node) => [node.props.children].flat().join(""));
}

/**
 * The value `InfoRows` shows next to `label` — rows render label then value
 * as consecutive native texts.
 */
export function infoValue(label: string): string | undefined {
  const texts = nativeTexts();
  const index = texts.indexOf(label);
  return index === -1 ? undefined : texts[index + 1];
}
