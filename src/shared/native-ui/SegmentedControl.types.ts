import type { ViewProps } from "react-native";

export type SegmentedOption<T> = { value: T; label: string };

export type SegmentedControlProps<T> = Pick<ViewProps, "style" | "testID"> & {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};
