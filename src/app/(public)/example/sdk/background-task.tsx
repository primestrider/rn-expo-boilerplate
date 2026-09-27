import * as BackgroundTask from "expo-background-task";
import { Stack } from "expo-router";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useState } from "react";

import { InfoRows, Section } from "@/features/example/components";
import { readSyncLog, SYNC_TASK, type SyncLog } from "@/features/example/tasks/sync.task";
import { Alert, AppText, Screen } from "@/shared/components";
import { formatDateTime } from "@/shared/helpers";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  Switch,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

type State = {
  available: boolean;
  status: BackgroundTask.BackgroundTaskStatus | null;
  registered: boolean;
  log: SyncLog;
};

async function readState(): Promise<State> {
  const available = await TaskManager.isAvailableAsync();
  return {
    available,
    status: available ? await BackgroundTask.getStatusAsync() : null,
    registered: available && (await TaskManager.isTaskRegisteredAsync(SYNC_TASK)),
    log: readSyncLog(),
  };
}

/**
 * expo-background-task schedules periodic work (WorkManager on Android,
 * BGTaskScheduler on iOS); expo-task-manager holds the task definition, which
 * lives in `features/example/tasks` and is imported by the root layout.
 */
export default function BackgroundTaskExample() {
  const styles = useStyles();

  const [state, setState] = useState<State | null>(null);
  const [interval, setIntervalMinutes] = useState("15");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => setState(await readState()), []);

  useEffect(() => {
    let active = true;
    readState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const register = async (minutes: string) => {
    // The OS treats this as a minimum; it picks the actual time. 15 minutes
    // is the smallest interval Android allows.
    await BackgroundTask.registerTaskAsync(SYNC_TASK, {
      minimumInterval: Number(minutes),
    });
  };

  const setEnabled = async (enabled: boolean) => {
    setError(null);
    try {
      if (enabled) await register(interval);
      else await BackgroundTask.unregisterTaskAsync(SYNC_TASK);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the task.");
    }
    await refresh();
  };

  const changeInterval = async (minutes: string) => {
    setIntervalMinutes(minutes);
    // Re-registering replaces the schedule with the new interval.
    if (state?.registered) {
      await register(minutes);
      await refresh();
    }
  };

  const runNow = async () => {
    await BackgroundTask.triggerTaskWorkerForTestingAsync();
    await refresh();
  };

  if (state && !state.available) {
    return (
      <>
        <Stack.Screen options={{ title: "Background Task" }} />
        <Screen>
          <Alert
            variant="info"
            title="Background tasks are not available here"
            description="They run on iOS and Android development or release builds."
          />
        </Screen>
      </>
    );
  }

  const restricted = state?.status === BackgroundTask.BackgroundTaskStatus.Restricted;

  return (
    <>
      <Stack.Screen options={{ title: "Background Task" }} />
      <Screen>
        {restricted ? (
          <Alert
            variant="warning"
            title="Background work is restricted"
            description="Low Power Mode or Background App Refresh settings are blocking it."
            style={styles.mb6}
          />
        ) : null}

        <Section
          title="Periodic sync"
          description="Runs even when the app is closed, when the OS allows"
          utilities={[
            "defineTask",
            "registerTaskAsync",
            "unregisterTaskAsync",
            "minimumInterval",
          ]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Switch
                value={state?.registered ?? false}
                onValueChange={setEnabled}
                label="Background sync"
                disabled={!state || restricted}
              />
              <Picker selectedValue={interval} onValueChange={changeInterval}>
                <Picker.Item label="Every 15 minutes" value="15" />
                <Picker.Item label="Every 30 minutes" value="30" />
                <Picker.Item label="Every hour" value="60" />
              </Picker>
              <Row spacing={8}>
                <Button label="Refresh" variant="outlined" onPress={refresh} />
                {__DEV__ ? (
                  <Button
                    label="Run now"
                    disabled={!state?.registered}
                    onPress={runNow}
                  />
                ) : null}
              </Row>
            </Column>
          </NativeHost>
          {__DEV__ ? (
            <AppText variant="caption" color="muted" style={styles.mt2}>
              Run now uses triggerTaskWorkerForTestingAsync, which only works
              in development builds.
            </AppText>
          ) : null}
          {error ? (
            <Alert variant="error" title={error} style={styles.mt3} />
          ) : null}
        </Section>

        <Section
          title="Status"
          description="The task records each run in MMKV"
          utilities={["getStatusAsync", "isTaskRegisteredAsync"]}
        >
          <InfoRows
            rows={[
              ["Status", state?.status == null ? null : restricted ? "Restricted" : "Available"],
              ["Registered", state && (state.registered ? "Yes" : "No")],
              [
                "Last run",
                state?.log.lastRun ? formatDateTime(new Date(state.log.lastRun)) : "Never",
              ],
              ["Runs", state?.log.runs],
            ]}
          />
        </Section>
      </Screen>
    </>
  );
}
