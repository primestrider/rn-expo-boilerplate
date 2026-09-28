import * as TaskManager from "expo-task-manager";

import { mmkvStorage } from "@/plugins/mmkv";

jest.mock("expo-task-manager", () => ({ defineTask: jest.fn() }));

jest.mock("expo-background-task", () => ({
  BackgroundTaskResult: { Success: 1, Failed: 2 },
}));

// Imported after the mocks so its module-level `defineTask` call is captured.
const { SYNC_TASK, readSyncLog, runSync, syncStorageKeys } =
  require("@/features/example/tasks/sync.task") as typeof import("@/features/example/tasks/sync.task");

const defineTask = jest.mocked(TaskManager.defineTask);

beforeEach(() => {
  mmkvStorage.remove(syncStorageKeys.backgroundSyncLastRun);
  mmkvStorage.remove(syncStorageKeys.backgroundSyncRuns);
});

describe("background sync task", () => {
  it("is defined at import time, before any screen renders", () => {
    expect(defineTask).toHaveBeenCalledWith(SYNC_TASK, expect.any(Function));
  });

  it("reports an empty log before the first run", () => {
    expect(readSyncLog()).toEqual({ lastRun: null, runs: 0 });
  });

  it("records each run and reports success", async () => {
    await expect(runSync(1_000)).resolves.toBe(1);
    await runSync(2_000);

    expect(readSyncLog()).toEqual({ lastRun: 2_000, runs: 2 });
  });

  it("reports success through the defined executor", async () => {
    const executor = defineTask.mock.calls[0][1];

    await expect(executor({ data: null, error: null, executionInfo: {} } as never)).resolves.toBe(1);
    expect(readSyncLog().runs).toBe(1);
  });

  it("reports failure instead of throwing when the work fails", async () => {
    const executor = defineTask.mock.calls[0][1];
    jest.spyOn(mmkvStorage, "set").mockImplementationOnce(() => {
      throw new Error("disk full");
    });

    await expect(executor({ data: null, error: null, executionInfo: {} } as never)).resolves.toBe(2);
  });
});
