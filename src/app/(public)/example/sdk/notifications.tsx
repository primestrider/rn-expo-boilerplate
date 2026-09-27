import { PermissionStatus } from "expo";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { AppText, Card, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  Switch,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const CHANNEL_ID = "default";


/**
 * expo-notifications with local notifications only — no push credentials
 * needed. Covers the permission flow, the Android channel, scheduling, and
 * showing a notification while the app is in the foreground.
 */
export default function NotificationsExample() {
  const styles = useStyles();
  const title = useNativeState("Payment received");

  const [titleText, setTitleText] = useState("Payment received");
  const [delay, setDelay] = useState("5");
  const [showInForeground, setShowInForeground] = useState(true);
  const [permission, setPermission] = useState<PermissionStatus>(PermissionStatus.UNDETERMINED);
  const [scheduled, setScheduled] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (line: string) =>
    setLog((current) =>
      [`${new Date().toLocaleTimeString()} · ${line}`, ...current].slice(0, 5),
    );

  // Android 13+ only prompts once a channel exists.
  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: "Default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      setPermission((await Notifications.getPermissionsAsync()).status);
    })();
  }, []);

  // Scoped to this screen so the example doesn't change app-wide behavior.
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: showInForeground,
        shouldShowList: showInForeground,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    return () => Notifications.setNotificationHandler(null);
  }, [showInForeground]);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((n) =>
      addLog(`Received: ${n.request.content.title}`),
    );
    const response = Notifications.addNotificationResponseReceivedListener((r) =>
      addLog(`Tapped: ${r.notification.request.content.title}`),
    );
    return () => {
      received.remove();
      response.remove();
    };
  }, []);

  const requestPermission = async () => {
    setPermission((await Notifications.requestPermissionsAsync()).status);
  };

  const refreshScheduled = async () =>
    setScheduled((await Notifications.getAllScheduledNotificationsAsync()).length);

  const schedule = async () => {
    const seconds = Number(delay);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleText || "Notification",
        body:
          seconds > 0
            ? `Scheduled ${seconds}s ago from the SDK example.`
            : "Sent immediately from the SDK example.",
        data: { screen: "notifications" },
      },
      trigger:
        seconds > 0
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds,
              channelId: CHANNEL_ID,
            }
          : null,
    });
    addLog(seconds > 0 ? `Scheduled in ${seconds}s` : "Sent now");
    await refreshScheduled();
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    addLog("Cancelled all scheduled");
    await refreshScheduled();
  };

  const granted = permission === PermissionStatus.GRANTED;

  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <Screen>
        <Section
          title="Permission"
          description="Ask once; the OS remembers the answer"
          utilities={["getPermissionsAsync", "requestPermissionsAsync"]}
        >
          <InfoRows rows={[["Status", permission]]} />
          {!granted ? (
            <NativeHost matchContents style={{ paddingTop: 12 }}>
              <Button label="Allow notifications" onPress={requestPermission} />
            </NativeHost>
          ) : null}
        </Section>

        <Section
          title="Local notification"
          description="Send now or after a delay — lock the device to see it"
          utilities={[
            "scheduleNotificationAsync",
            "TIME_INTERVAL",
            "setNotificationHandler",
          ]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <TextInput
                value={title}
                onChangeText={setTitleText}
                placeholder="Title"
              />
              <Picker selectedValue={delay} onValueChange={setDelay}>
                <Picker.Item label="Now" value="0" />
                <Picker.Item label="In 5 seconds" value="5" />
                <Picker.Item label="In 30 seconds" value="30" />
                <Picker.Item label="In 1 minute" value="60" />
              </Picker>
              <Switch
                value={showInForeground}
                onValueChange={setShowInForeground}
                label="Show while app is open"
              />
              <Row spacing={8}>
                <Button label="Schedule" disabled={!granted} onPress={schedule} />
                <Button
                  label="Cancel all"
                  variant="outlined"
                  onPress={cancelAll}
                />
              </Row>
            </Column>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            {scheduled} pending
          </AppText>
        </Section>

        <Section
          title="Events"
          description="Received in the foreground, or tapped by the user"
          utilities={[
            "addNotificationReceivedListener",
            "addNotificationResponseReceivedListener",
          ]}
        >
          <Card variant="outlined">
            {log.length === 0 ? (
              <AppText color="muted">No events yet.</AppText>
            ) : (
              log.map((line) => (
                <AppText key={line} variant="mono">
                  {line}
                </AppText>
              ))
            )}
          </Card>
        </Section>
      </Screen>
    </>
  );
}
