import type { ViewProps } from "react-native";

export type ProgressIndicatorProps = Pick<ViewProps, "style" | "testID"> & {
  /** `linear` is a bar, `circular` a ring. Default `linear`. */
  type?: "linear" | "circular";
  /** 0..1. Leave out for an indeterminate indicator. */
  value?: number;
};
