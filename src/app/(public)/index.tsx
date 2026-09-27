import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { NavSection } from "@/features/example/components";
import { useFeatureHref } from "@/features/example/hooks/useFeatureHref";
import {
  componentGroups,
  exampleScreens,
  featureScreens,
  nativeComponentGroups,
  sdkScreens,
} from "@/features/example/routes";
import { AppText, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

/**
 * The example directory: every example, grouped by what it demonstrates, one
 * tap away. Feature screens come first — they are what a new reader of the
 * boilerplate wants to see working.
 */
export default function Index() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const featureHref = useFeatureHref();

  return (
    <Screen contentContainerStyle={styles.gap6}>
      <AppText variant="h1">RN Expo Boilerplate</AppText>

      <NavSection
        title={t("features.example.title")}
        description={t("features.example.subtitle")}
        items={featureScreens.map((screen) => ({
          key: screen.name,
          title: t(screen.titleKey),
          subtitle: t(screen.descriptionKey),
          onPress: () => router.push(featureHref(screen)),
        }))}
      />

      <NavSection
        title="Components"
        description="The shared, themed component library"
        items={componentGroups.map((group) => ({
          key: group.title,
          title: group.title,
          subtitle: group.description,
          onPress: () => router.push(group.href),
        }))}
      />

      <NavSection
        title="Native UI"
        description="Platform controls from @expo/ui"
        items={nativeComponentGroups.map((group) => ({
          key: group.title,
          title: group.title,
          subtitle: group.description,
          onPress: () => router.push(group.href),
        }))}
      />

      <NavSection
        title="Expo SDK"
        description="Device APIs driven by @expo/ui controls"
        items={sdkScreens.map((screen) => ({
          key: screen.title,
          title: screen.title,
          subtitle: screen.description,
          onPress: () => router.push(screen.href),
        }))}
      />

      <NavSection
        title="Styling"
        description="Tailwind-like utilities on React Native's StyleSheet"
        items={exampleScreens.map((screen) => ({
          key: screen.title,
          title: screen.title,
          subtitle: screen.description,
          onPress: () => router.push(screen.href),
        }))}
      />
    </Screen>
  );
}
