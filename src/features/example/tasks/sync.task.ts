import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { mmkvStorage } from "@/plugins/mmkv";

export const SYNC_TASK = "example-background-sync";

/**
 * Kept with the task rather than in `@/plugins/mmkv/keys`: this example can be
 * removed and re-added (`npm run reset-project` / `add-example`), and its keys
 * travel with it.
 */
export const syncStorageKeys = {
  backgroundSyncLastRun: "example.backgroundSync.lastRun",
  backgroundSyncRuns: "example.backgroundSync.runs",
} as const;

const { backgroundSyncLastRun, backgroundSyncRuns } = syncStorageKeys;

export type SyncLog = { lastRun: number | null; runs: number };

/** What the task has done so far, as recorded in storage. */
export function readSyncLog(): SyncLog {
  const lastRun = mmkvStorage.getNumber(backgroundSyncLastRun);
  return {
    lastRun: lastRun && Number.isFinite(lastRun) ? lastRun : null,
    runs: mmkvStorage.getNumber(backgroundSyncRuns) || 0,
  };
}

/**
 * The work itself. The OS may launch the app headless to run this, with no
 * screen mounted, so it only touches storage — a real app would fetch and
 * cache here, e.g. refresh balances or pending transactions.
 */
export async function runSync(now = Date.now()) {
  mmkvStorage.set(backgroundSyncLastRun, now);
  mmkvStorage.set(backgroundSyncRuns, readSyncLog().runs + 1);
  return BackgroundTask.BackgroundTaskResult.Success;
}

// Must run at module load, before the app renders: when the OS wakes the app
// in the background, this definition is what it looks up by name.
TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    return await runSync();
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
