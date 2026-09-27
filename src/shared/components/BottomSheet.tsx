import { BottomSheet as NativeBottomSheet, RNHostView } from "@expo/ui";
import type { ReactNode } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStyles, useTheme, view } from "@/styles";
import { spacing } from "@/styles/tokens";

import { AppText } from "./AppText";
import { lockedSheetModifiers } from "./internal/sheetModifiers";

/** Ceiling on the content, so a long list scrolls instead of covering the screen. */
const MAX_HEIGHT_RATIO = 0.75;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Swiping down, tapping the scrim, or Android back closes it. Default true. */
  dismissable?: boolean;
  title?: string;
  /**
   * Applies the standard gutter to the content. Turn off for rows that carry
   * their own — `ListItem`, for one — which would otherwise indent twice.
   */
  padded?: boolean;
  children: ReactNode;
};

/**
 * Sheet that rises from the bottom edge — the mobile-native place to put a
 * secondary choice or a short form.
 *
 * Presented by `@expo/ui`: a real SwiftUI sheet on iOS and a Material 3
 * `ModalBottomSheet` on Android, so the drag, detents, scrim and back handling
 * are the platform's own. This wrapper only keeps the app's API and themes the
 * surface.
 *
 * @example
 * <BottomSheet visible={open} onClose={close} title="Sort by">
 *   <ListItem title="Newest" onPress={...} />
 *   <ListItem title="Oldest" onPress={...} />
 * </BottomSheet>
 */
export function BottomSheet({
  visible,
  onClose,
  dismissable = true,
  title,
  padded = true,
  children,
}: Readonly<BottomSheetProps>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // The native sheet brings its own `Host`; wrapping it in another would nest two.
  return (
    <NativeBottomSheet
      isPresented={visible}
      onDismiss={onClose}
      // The content draws its own gutter so `padded` stays in charge of it.
      contentPadding={0}
      containerColor={colors.card}
      shouldDismissOnBackPress={dismissable}
      shouldDismissOnClickOutside={dismissable}
      modifiers={dismissable ? undefined : lockedSheetModifiers}
    >
      {/* The content is React Native, so it is hosted back into RN layout and
          sized to itself — the sheet then fits it. */}
      <RNHostView matchContents>
        <View
          testID="bottom-sheet"
          accessibilityViewIsModal
          style={view(styles.bgCard, {
            paddingTop: spacing[2],
            paddingBottom: insets.bottom + spacing[4],
          })}
        >
          {title ? (
            <View style={view(styles.px4, styles.pb3)}>
              <AppText variant="title">{title}</AppText>
            </View>
          ) : null}

          <ScrollView
            bounces={false}
            style={{ maxHeight: screenHeight * MAX_HEIGHT_RATIO }}
            contentContainerStyle={view(padded && styles.px4)}
          >
            {children}
          </ScrollView>
        </View>
      </RNHostView>
    </NativeBottomSheet>
  );
}
