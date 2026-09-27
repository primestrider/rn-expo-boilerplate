import { Switch as NativeSwitch } from "@expo/ui";
import { Pressable, View, type PressableProps } from "react-native";

import { NativeHost } from "@/shared/native-ui/NativeHost";
import { useStyles, view } from "@/styles";

import { AppText } from "./AppText";

export type SwitchProps = Omit<PressableProps, "onPress"> & {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  description?: string;
};

/**
 * Toggle for an immediate, self-applying setting.
 *
 * The control itself is the platform's own — a SwiftUI `Toggle` on iOS and a
 * Material 3 `Switch` on Android, via `@expo/ui` — tinted with the theme's
 * primary color. The label and description stay `AppText` so they share the
 * app's typography, and tapping them toggles too.
 *
 * Named `value`/`onValueChange` to match React Native's own switch, so swapping
 * either way is a drop-in.
 *
 * @example
 * <Switch value={notify} onValueChange={setNotify} label="Notifications" />
 */
export function Switch({
  value = false,
  onValueChange,
  label,
  description,
  disabled,
  style: externalStyle,
  ...rest
}: Readonly<SwitchProps>) {
  const styles = useStyles();

  // `PressableProps` allows null here; accessibilityState does not.
  const isDisabled = disabled ?? false;

  const toggle = (next: boolean) => onValueChange?.(next);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => toggle(!value)}
      style={(state) => [
        view(
          styles.flexRow,
          styles.itemsCenter,
          styles.gap3,
        ),
        typeof externalStyle === "function"
          ? externalStyle(state)
          : externalStyle,
      ]}
      {...rest}
    >
      {label || description ? (
        <View
          // Only the text dims: the native control already draws its own
          // disabled state, and dimming it again would wash it out.
          style={view(
            styles.flex1,
            styles.gap1,
            styles.minW0,
            isDisabled && styles.opacity50,
          )}
        >
          {label ? <AppText>{label}</AppText> : null}
          {description ? (
            <AppText variant="caption" color="muted">
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {/* The row above is the one accessible element; the native control is
          hidden from assistive tech so it is not announced twice. */}
      <NativeHost
        matchContents
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <NativeSwitch
          testID="switch-control"
          value={value}
          onValueChange={toggle}
          disabled={isDisabled}
        />
      </NativeHost>
    </Pressable>
  );
}
