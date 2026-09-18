import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  Animated,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import {
  KeyboardController,
  useResizeMode,
} from "react-native-keyboard-controller";

import { styles, text, view } from "@/styles";
import { colors, fontSize } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

type InputType =
  | "text"
  | "number"
  | "currency"
  | "email"
  | "phone"
  | "password";

export type InputProps = Omit<TextInputProps, "type"> & {
  label?: string;
  error?: string;
  hint?: string;
  type?: InputType;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      type = "text",
      leftIcon,
      rightIcon,
      containerStyle,
      value,
      onChangeText,
      onFocus,
      onBlur,
      onSubmitEditing,
      style,
      editable = true,
      ...rest
    }: InputProps,
    ref: Ref<TextInput>,
  ) => {
    useResizeMode();

    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(focusAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, focusAnim]);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        let filtered = text;
        if (type === "number" || type === "currency") {
          filtered = text.replace(/[^0-9.]/g, "");
        }
        onChangeText?.(filtered);
      },
      [type, onChangeText],
    );

    const handleSubmitEditing = useCallback(
      (e: any) => {
        KeyboardController.dismiss();
        onSubmitEditing?.(e);
      },
      [onSubmitEditing],
    );

    const typeProps = useMemo(() => {
      switch (type) {
        case "email":
          return {
            keyboardType: "email-address" as KeyboardTypeOptions,
            autoCapitalize: "none" as const,
            textContentType: "emailAddress" as const,
          };
        case "phone":
          return {
            keyboardType: "phone-pad" as KeyboardTypeOptions,
            textContentType: "telephoneNumber" as const,
          };
        case "number":
          return { keyboardType: "decimal-pad" as KeyboardTypeOptions };
        case "currency":
          return { keyboardType: "decimal-pad" as KeyboardTypeOptions };
        case "password":
          return { secureTextEntry: true };
        default:
          return {};
      }
    }, [type]);

    const animatedBorderColor = useMemo(
      () =>
        focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.border, colors.primary],
        }),
      [focusAnim],
    );

    const animatedLabelColor = useMemo(
      () =>
        focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.mutedForeground, colors.primary],
        }),
      [focusAnim],
    );

    return (
      <View style={containerStyle}>
        {label ? (
          <Animated.Text
            style={[
              text(styles.textSm, styles["mb1.5"], styles.fontMedium),
              !error && { color: animatedLabelColor },
              error && { color: colors.destructive },
            ]}
          >
            {label}
          </Animated.Text>
        ) : null}
        <Animated.View
          style={[
            view(
              styles.flexRow,
              styles.itemsCenter,
              styles.border,
              styles.roundedLg,
              styles.bgBackground,
              styles.px3,
            ),
            !editable && { opacity: 0.5 },
            !error && { borderColor: animatedBorderColor },
            error && { borderColor: colors.destructive },
            isFocused &&
              !error && {
                boxShadow: "0 1px 3px rgba(32, 138, 239, 0.12)",
                elevation: 2,
              },
          ]}
        >
          {leftIcon ? (
            <View
              style={view(styles.mr2, styles.justifyCenter, styles.itemsCenter)}
            >
              {leftIcon}
            </View>
          ) : null}
          <TextInput
            ref={ref}
            style={[
              {
                flex: 1,
                height: 48,
                fontSize: fontSize.base,
                fontFamily: fontFamily.sans,
                color: colors.foreground,
              },
              style,
            ]}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            placeholderTextColor={colors.mutedForeground}
            editable={editable}
            {...typeProps}
            {...rest}
          />
          {rightIcon ? (
            <View
              style={view(styles.ml2, styles.justifyCenter, styles.itemsCenter)}
            >
              {rightIcon}
            </View>
          ) : null}
        </Animated.View>
        {error ? (
          <Text
            style={text(styles.textSm, styles.textDestructive, styles["mt1.5"])}
          >
            {error}
          </Text>
        ) : hint ? (
          <Text style={text(styles.textSm, styles.textMuted, styles["mt1.5"])}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";
