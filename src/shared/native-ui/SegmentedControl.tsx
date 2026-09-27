import { Tabs } from "@/shared/components/Tabs";

import type {
  SegmentedControlProps,
  SegmentedOption,
} from "./SegmentedControl.types";

export type { SegmentedControlProps, SegmentedOption };

/**
 * Single-choice segmented control. Android renders Material 3 segmented
 * buttons (see `SegmentedControl.android.tsx`); `@expo/ui` has no universal
 * equivalent, so iOS and web fall back to the app's segmented `Tabs`.
 *
 * @example
 * <SegmentedControl
 *   value={range}
 *   onChange={setRange}
 *   options={[
 *     { value: "day", label: "Day" },
 *     { value: "week", label: "Week" },
 *   ]}
 * />
 */
export function SegmentedControl<T>({
  options,
  value,
  onChange,
  style,
  testID,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <Tabs
      variant="segmented"
      items={options}
      value={value}
      onChange={onChange}
      style={style}
      testID={testID}
    />
  );
}
