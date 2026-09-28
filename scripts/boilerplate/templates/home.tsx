import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { selectIsAuthenticated, useSessionStore } from "@/features/auth";
import { AppText, Button, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

/** The home screen. Make it yours. */
export default function Index() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);

  return (
    <Screen contentContainerStyle={styles.gap4}>
      <AppText variant="h1">RN Expo Boilerplate</AppText>
      <AppText color="muted">
        Edit src/app/(public)/index.tsx to get started.
      </AppText>

      <Button
        title={t(
          isAuthenticated
            ? "features.auth.signIn.account.title"
            : "features.auth.signIn.title",
        )}
        onPress={() => router.push(isAuthenticated ? "/account" : "/sign-in")}
      />
    </Screen>
  );
}
