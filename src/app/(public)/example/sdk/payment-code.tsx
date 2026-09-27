import * as Brightness from "expo-brightness";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import { Alert, AppText, Card, Screen } from "@/shared/components";
import { formatCurrency } from "@/shared/helpers";
import { Column, NativeHost, Switch } from "@/shared/native-ui";
import { useStyles, view } from "@/styles";

const TAG = "payment-code";
const CODE_LIFETIME = 60;

/** Stand-in for the one-time code a payment backend would issue. */
const newCode = () =>
  Array.from({ length: 3 }, () =>
    String(Math.floor(Math.random() * 10_000)).padStart(4, "0"),
  ).join(" ");

/**
 * The "show to cashier" screen: brightness up so scanners read it, screen
 * kept awake while the cashier types, and screenshots blocked so the code
 * cannot leak. Each is undone when the switch goes off or the screen closes.
 */
export default function PaymentCodeExample() {
  const styles = useStyles();

  const [bright, setBright] = useState(true);
  const [awake, setAwake] = useState(true);
  const [secure, setSecure] = useState(true);
  const [{ code, secondsLeft }, setPayCode] = useState(() => ({
    code: newCode(),
    secondsLeft: CODE_LIFETIME,
  }));
  const [screenshots, setScreenshots] = useState(0);
  const previousBrightness = useRef<number | null>(null);

  useEffect(() => {
    if (!bright) return;
    let cancelled = false;

    // Best effort: a device that cannot change brightness still shows the code.
    (async () => {
      if (!(await Brightness.isAvailableAsync())) return;
      const current = await Brightness.getBrightnessAsync();
      if (cancelled) return;
      previousBrightness.current = current;
      await Brightness.setBrightnessAsync(1);
    })().catch(() => {});

    return () => {
      cancelled = true;
      if (previousBrightness.current !== null) {
        Brightness.setBrightnessAsync(previousBrightness.current);
        previousBrightness.current = null;
      }
    };
  }, [bright]);

  useEffect(() => {
    if (!awake) return;
    activateKeepAwakeAsync(TAG);
    return () => {
      deactivateKeepAwake(TAG);
    };
  }, [awake]);

  useEffect(() => {
    if (!secure) return;
    ScreenCapture.preventScreenCaptureAsync(TAG);
    return () => {
      ScreenCapture.allowScreenCaptureAsync(TAG);
    };
  }, [secure]);

  // Reported even when capture is blocked, so the app can warn the user.
  useEffect(() => {
    const subscription = ScreenCapture.addScreenshotListener(() =>
      setScreenshots((n) => n + 1),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPayCode((current) =>
        current.secondsLeft > 1
          ? { ...current, secondsLeft: current.secondsLeft - 1 }
          : { code: newCode(), secondsLeft: CODE_LIFETIME },
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Payment Code" }} />
      <Screen>
        <Card variant="outlined" style={styles.mb6}>
          <View style={view(styles.itemsCenter, styles.gap2, styles.py4)}>
            <AppText color="muted">Show this code to the cashier</AppText>
            <AppText variant="h1" testID="pay-code">
              {code}
            </AppText>
            <AppText variant="caption" color="muted">
              Refreshes in {secondsLeft}s · Balance {formatCurrency(1_250_000)}
            </AppText>
          </View>
        </Card>

        {screenshots > 0 ? (
          <Alert
            variant="warning"
            title="Screenshot detected"
            description="Never share your payment code with anyone."
            style={styles.mb6}
          />
        ) : null}

        <Section
          title="Screen treatment"
          description="Each switch applies while on, and is undone when you leave"
          utilities={[
            "setBrightnessAsync",
            "activateKeepAwakeAsync",
            "preventScreenCaptureAsync",
            "addScreenshotListener",
          ]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Switch value={bright} onValueChange={setBright} label="Max brightness" />
              <Switch value={awake} onValueChange={setAwake} label="Keep screen on" />
              <Switch value={secure} onValueChange={setSecure} label="Block screenshots" />
            </Column>
          </NativeHost>
        </Section>
      </Screen>
    </>
  );
}
