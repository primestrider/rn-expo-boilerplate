import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { featureScreens } from "@/features/example/routes";
import { AppText, Badge, Card, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

export default function FeaturesIndex() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.title") }} />
      <Screen contentContainerStyle={styles.gap3}>
        <AppText variant="h2">{t("features.example.title")}</AppText>
        <AppText variant="caption" color="muted" style={styles.mb3}>
          {t("features.example.subtitle")}
        </AppText>

        {featureScreens.map((screen) => (
          <Card
            key={screen.name}
            variant="outlined"
            onPress={() => router.push(screen.href)}
          >
            <Card.Header
              title={t(screen.titleKey)}
              subtitle={t(screen.descriptionKey)}
            />
            <Card.Body>
              <View style={view(styles.flexRow, styles.flexWrap, styles.gap1)}>
                {screen.plugins.map((plugin) => (
                  <Badge key={plugin} label={plugin} size="sm" variant="outline" />
                ))}
              </View>
            </Card.Body>
          </Card>
        ))}
      </Screen>
    </>
  );
}
