import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { NativeHost } from "./NativeHost";
import type {
  SegmentedControlProps,
  SegmentedOption,
} from "./SegmentedControl.types";

export type { SegmentedControlProps, SegmentedOption };

/**
 * Material 3 single-choice segmented buttons (Jetpack Compose). iOS and web use
 * the `SegmentedControl.tsx` sibling, which falls back to the app's segmented
 * `Tabs`. Colors come from the Material scheme `NativeHost` seeds.
 */
export function SegmentedControl<T>({
  options,
  value,
  onChange,
  style,
  testID,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <NativeHost
      testID={testID}
      style={style}
      matchContents={{ vertical: true }}
    >
      <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth()]}>
        {options.map((option) => (
          <SegmentedButton
            key={String(option.value)}
            selected={option.value === value}
            onClick={() => onChange(option.value)}
          >
            <SegmentedButton.Label>
              <Text>{option.label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </NativeHost>
  );
}
