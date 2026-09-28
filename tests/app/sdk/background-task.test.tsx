import { act, render, screen } from "@testing-library/react-native";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import type { ReactNode } from "react";

import BackgroundTaskExample from "@/app/(public)/example/sdk/background-task";
import { SYNC_TASK, syncStorageKeys } from "@/features/example/tasks/sync.task";
import { mmkvStorage } from "@/plugins/mmkv";

import {
  infoValue,
  nativeSwitch,
  pickNative,
  pressNative,
  toggleNative,
} from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn(),
  isAvailableAsync: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
}));

jest.mock("expo-background-task", () => ({
  BackgroundTaskStatus: { Restricted: 1, Available: 2 },
  BackgroundTaskResult: { Success: 1, Failed: 2 },
  getStatusAsync: jest.fn(),
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  triggerTaskWorkerForTestingAsync: jest.fn(),
}));

const tasks = jest.mocked(TaskManager);
const background = jest.mocked(BackgroundTask);

let registered = false;

async function renderScreen() {
  render(<BackgroundTaskExample />);
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  registered = false;
  mmkvStorage.remove(syncStorageKeys.backgroundSyncLastRun);
  mmkvStorage.remove(syncStorageKeys.backgroundSyncRuns);
  tasks.isAvailableAsync.mockResolvedValue(true);
  tasks.isTaskRegisteredAsync.mockImplementation(async () => registered);
  background.getStatusAsync.mockResolvedValue(2);
  background.registerTaskAsync.mockImplementation(async () => {
    registered = true;
  });
  background.unregisterTaskAsync.mockImplementation(async () => {
    registered = false;
  });
});

describe("Background Task example", () => {
  it("shows the task as available and not yet registered", async () => {
    await renderScreen();

    expect(infoValue("Status")).toBe("Available");
    expect(infoValue("Registered")).toBe("No");
    expect(infoValue("Last run")).toBe("Never");
    expect(nativeSwitch("Background sync").props.value).toBe(false);
  });

  it("registers with the chosen minimum interval", async () => {
    await renderScreen();

    await pickNative("30");
    await toggleNative("Background sync", true);

    expect(background.registerTaskAsync).toHaveBeenCalledWith(SYNC_TASK, {
      minimumInterval: 30,
    });
    expect(infoValue("Registered")).toBe("Yes");
  });

  it("re-registers when the interval changes while enabled", async () => {
    registered = true;
    await renderScreen();

    await pickNative("60");

    expect(background.registerTaskAsync).toHaveBeenCalledWith(SYNC_TASK, {
      minimumInterval: 60,
    });
  });

  it("unregisters when switched off", async () => {
    registered = true;
    await renderScreen();

    await toggleNative("Background sync", false);

    expect(background.unregisterTaskAsync).toHaveBeenCalledWith(SYNC_TASK);
    expect(infoValue("Registered")).toBe("No");
  });

  it("shows runs the task recorded", async () => {
    mmkvStorage.set(syncStorageKeys.backgroundSyncRuns, 3);
    mmkvStorage.set(
      syncStorageKeys.backgroundSyncLastRun,
      new Date(2026, 8, 27, 8, 15).getTime(),
    );
    await renderScreen();

    expect(infoValue("Runs")).toBe("3");
    expect(infoValue("Last run")).toMatch(/27 Sep 2026, 08:15/);
  });

  it("triggers the worker for testing in development", async () => {
    registered = true;
    await renderScreen();

    await pressNative("Run now");

    expect(background.triggerTaskWorkerForTestingAsync).toHaveBeenCalledTimes(1);
  });

  it("explains a restricted device and disables the switch", async () => {
    background.getStatusAsync.mockResolvedValue(1);
    await renderScreen();

    expect(screen.getByText("Background work is restricted")).toBeOnTheScreen();
    expect(nativeSwitch("Background sync").props.disabled).toBe(true);
  });

  it("shows a registration failure", async () => {
    background.registerTaskAsync.mockRejectedValue(new Error("Task not defined"));
    await renderScreen();

    await toggleNative("Background sync", true);

    expect(screen.getByText("Task not defined")).toBeOnTheScreen();
  });

  it("explains when background tasks are unavailable", async () => {
    tasks.isAvailableAsync.mockResolvedValue(false);
    await renderScreen();

    expect(
      screen.getByText("Background tasks are not available here"),
    ).toBeOnTheScreen();
    expect(background.getStatusAsync).not.toHaveBeenCalled();
  });
});
