/**
 * Native UI from `@expo/ui` — real SwiftUI on iOS, Jetpack Compose on Android.
 *
 * Import native components from here rather than from `@expo/ui` directly, so
 * theming and future swaps happen in one place. Every tree needs a host: use
 * `NativeHost`, which follows the app theme.
 *
 * The app-styled components (`Button`, `Input`, …) stay in
 * `@/shared/components`; this folder is for screens that want the platform's
 * own look.
 */

// Host
export { NativeHost } from "./NativeHost";
export type { NativeHostProps } from "./NativeHost";

// Universal layer: one tree for iOS, Android and web.
export {
  BottomSheet,
  Button,
  Checkbox,
  Collapsible,
  Column,
  FieldGroup,
  Icon,
  List,
  ListItem,
  Picker,
  RNHostView,
  Row,
  ScrollView,
  Slider,
  Spacer,
  Switch,
  Text,
  TextInput,
  useNativeState,
} from "@expo/ui";
export type {
  BottomSheetProps,
  ButtonProps,
  CheckboxProps,
  CollapsibleProps,
  FieldGroupProps,
  ListItemProps,
  ListProps,
  PickerProps,
  SliderProps,
  SwitchProps,
  TextInputProps,
  TextInputRef,
} from "@expo/ui";

// Android-native (Jetpack Compose), with a fallback on iOS and web.
export { ProgressIndicator } from "./ProgressIndicator";
export type { ProgressIndicatorProps } from "./ProgressIndicator";
export { SegmentedControl } from "./SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedOption,
} from "./SegmentedControl";
