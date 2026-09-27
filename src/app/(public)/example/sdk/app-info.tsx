import * as Application from "expo-application";
import { Stack } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useEffect, useState } from "react";
import { Linking, Platform, View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, AppText, Screen } from "@/shared/components";
import { formatDateTime } from "@/shared/helpers";
import { Button, NativeHost, Row } from "@/shared/native-ui";
import { useStyles } from "@/styles";

/**
 * expo-application for the "About" row and support tickets; expo-store-review
 * for the rating prompt after a successful transaction.
 */
export default function AppInfoExample() {
  const styles = useStyles();

  const [installedAt, setInstalledAt] = useState<Date | null>(null);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Application.getInstallationTimeAsync()
      .then(setInstalledAt)
      .catch(() => setInstalledAt(null));
    StoreReview.hasAction()
      .then(setCanReview)
      .catch(() => setCanReview(false));
  }, []);

  // The OS decides whether the prompt actually appears (iOS allows it about
  // three times a year), so ask after a good moment, never from a button in
  // production.
  const requestReview = async () => {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      setMessage("Review requested — the OS may choose not to show it.");
    } else {
      setMessage("In-app review is not available here.");
    }
  };

  const storeUrl = StoreReview.storeUrl();

  return (
    <>
      <Stack.Screen options={{ title: "App Info & Store Review" }} />
      <Screen>
        <Section
          title="Application"
          description="Read from the native binary, not from app.config"
          utilities={[
            "applicationName",
            "nativeApplicationVersion",
            "nativeBuildVersion",
            "getInstallationTimeAsync",
          ]}
        >
          <InfoRows
            rows={[
              ["Name", Application.applicationName],
              ["Bundle ID", Application.applicationId],
              ["Version", Application.nativeApplicationVersion],
              ["Build", Application.nativeBuildVersion],
              ["Installed", installedAt && formatDateTime(installedAt)],
              ["Platform", Platform.OS],
            ]}
          />
        </Section>

        <Section
          title="Rate the app"
          description="Native review sheet, or the store page as a fallback"
          utilities={["isAvailableAsync", "requestReview", "storeUrl", "hasAction"]}
        >
          <NativeHost matchContents>
            <Row spacing={8}>
              <Button
                label="Rate us"
                disabled={canReview === false}
                onPress={requestReview}
              />
              <Button
                label="Open store page"
                variant="outlined"
                disabled={!storeUrl}
                onPress={() => storeUrl && Linking.openURL(storeUrl)}
              />
            </Row>
          </NativeHost>
          {storeUrl ? null : (
            <AppText variant="caption" color="muted" style={styles.mt2}>
              Set ios.appStoreUrl / android.playStoreUrl in the app config to
              enable the store link.
            </AppText>
          )}
          {message ? (
            <View style={styles.mt3}>
              <Alert variant="info" title={message} onClose={() => setMessage(null)} />
            </View>
          ) : null}
        </Section>
      </Screen>
    </>
  );
}
