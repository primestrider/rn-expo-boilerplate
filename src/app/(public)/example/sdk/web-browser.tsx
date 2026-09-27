import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform, View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  Spacer,
} from "@/shared/native-ui";
import { useStyles, useTheme } from "@/styles";

const PAGES = {
  terms: "https://expo.dev/terms",
  privacy: "https://expo.dev/privacy",
  help: "https://docs.expo.dev",
} as const;

type Page = keyof typeof PAGES;

/** Hand-offs a super app makes to other apps: chat, phone, mail, maps. */
const APPS = {
  WhatsApp: "https://wa.me/6281234567890?text=Halo",
  Call: "tel:+6281234567890",
  Email: "mailto:support@example.com?subject=Help",
  Maps:
    Platform.OS === "ios"
      ? "maps://?q=Monas%20Jakarta"
      : "geo:0,0?q=Monas%20Jakarta",
} as const;

type App = keyof typeof APPS;

/**
 * expo-web-browser shows T&C, help and promo pages in an in-app browser
 * (SFSafariViewController / Custom Tabs) that shares the system's cookies;
 * expo-linking opens other apps and builds deep links back into this one.
 */
export default function WebBrowserExample() {
  const styles = useStyles();
  const { colors } = useTheme();

  const [page, setPage] = useState<Page>("terms");
  const [app, setApp] = useState<App>("WhatsApp");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPage = async () => {
    const { type } = await WebBrowser.openBrowserAsync(PAGES[page], {
      toolbarColor: colors.card,
      controlsColor: colors.primary,
      dismissButtonStyle: "close",
    });
    setResult(type);
  };

  // `openURL` rejects when nothing can handle the URL. `canOpenURL` would need
  // every scheme declared (LSApplicationQueriesSchemes / Android <queries>)
  // to answer truthfully, so the rejection is the more reliable signal.
  const openApp = async () => {
    setError(null);
    try {
      await Linking.openURL(APPS[app]);
    } catch {
      setError(`No app on this device can open ${app}.`);
    }
  };

  const deepLink = Linking.createURL("example/sdk/payment-code", {
    queryParams: { amount: "50000" },
  });

  return (
    <>
      <Stack.Screen options={{ title: "Web Browser & Linking" }} />
      <Screen>
        <Section
          title="In-app browser"
          description="Themed browser sheet that returns to the app when closed"
          utilities={["openBrowserAsync", "toolbarColor", "controlsColor"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Picker
                selectedValue={page}
                onValueChange={(value) => setPage(value as Page)}
              >
                <Picker.Item label="Terms & Conditions" value="terms" />
                <Picker.Item label="Privacy Policy" value="privacy" />
                <Picker.Item label="Help Center" value="help" />
              </Picker>
              <Button label="Open page" onPress={openPage} />
            </Column>
          </NativeHost>
          {result ? (
            <View style={styles.mt3}>
              <InfoRows rows={[["Browser closed with", result]]} />
            </View>
          ) : null}
        </Section>

        <Section
          title="Open other apps"
          description="wa.me, tel:, mailto: and map URLs"
          utilities={["openURL"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Row spacing={8} alignment="center">
              <Picker
                selectedValue={app}
                onValueChange={(value) => setApp(value as App)}
              >
                {(Object.keys(APPS) as App[]).map((name) => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
              <Spacer flexible />
              <Button label="Open" variant="outlined" onPress={openApp} />
            </Row>
          </NativeHost>
          {error ? (
            <Alert variant="warning" title={error} style={styles.mt3} />
          ) : null}
        </Section>

        <Section
          title="Deep link"
          description="A link that opens this app on a given screen"
          utilities={["createURL", "queryParams"]}
        >
          <InfoRows rows={[["URL", deepLink]]} />
        </Section>
      </Screen>
    </>
  );
}
