import { act, render, screen } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import type { ReactNode } from "react";

import NotificationsExample from "@/app/(public)/example/sdk/notifications";

import {
  infoValue,
  nativeButton,
  pickNative,
  pressNative,
  queryNativeButton,
  toggleNative,
} from "../../helpers/native-ui";

type Listener = (event: unknown) => void;
const mockListeners: { received?: Listener; response?: Listener } = {};

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: "timeInterval" },
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn((listener: Listener) => {
    mockListeners.received = listener;
    return { remove: jest.fn() };
  }),
  addNotificationResponseReceivedListener: jest.fn((listener: Listener) => {
    mockListeners.response = listener;
    return { remove: jest.fn() };
  }),
}));

const notifications = jest.mocked(Notifications);

async function renderScreen() {
  const view = render(<NotificationsExample />);
  await act(async () => {});
  return view;
}

/** What the most recently installed foreground handler decides. */
async function foregroundBehavior() {
  const handler = notifications.setNotificationHandler.mock.lastCall?.[0];
  return handler?.handleNotification({} as never);
}

beforeEach(() => {
  jest.clearAllMocks();
  notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
});

describe("Notifications example", () => {
  it("asks for permission and only then allows scheduling", async () => {
    notifications.getPermissionsAsync.mockResolvedValue({ status: "undetermined" } as never);
    notifications.requestPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    await renderScreen();

    expect(infoValue("Status")).toBe("undetermined");
    expect(nativeButton("Schedule").props.disabled).toBe(true);

    await pressNative("Allow notifications");

    expect(infoValue("Status")).toBe("granted");
    expect(nativeButton("Schedule").props.disabled).toBe(false);
    expect(queryNativeButton("Allow notifications")).toBeUndefined();
  });

  it("schedules after the chosen delay on the default channel", async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([{}] as never);
    await renderScreen();

    await pressNative("Schedule");

    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: expect.objectContaining({ title: "Payment received" }),
      trigger: { type: "timeInterval", seconds: 5, channelId: "default" },
    });
    expect(screen.getByText("1 pending")).toBeOnTheScreen();
  });

  it("sends immediately when the delay is Now", async () => {
    await renderScreen();

    await pickNative("0");
    await pressNative("Schedule");

    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: null }),
    );
  });

  it("cancels every scheduled notification", async () => {
    await renderScreen();

    await pressNative("Cancel all");

    expect(notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Cancelled all scheduled/)).toBeOnTheScreen();
  });

  it("shows notifications in the foreground only while the switch is on", async () => {
    await renderScreen();

    expect(await foregroundBehavior()).toEqual(
      expect.objectContaining({ shouldShowBanner: true, shouldShowList: true }),
    );

    await toggleNative("Show while app is open", false);

    expect(await foregroundBehavior()).toEqual(
      expect.objectContaining({ shouldShowBanner: false, shouldShowList: false }),
    );
  });

  it("restores the default handler when leaving the screen", async () => {
    const { unmount } = await renderScreen();

    unmount();

    expect(notifications.setNotificationHandler).toHaveBeenLastCalledWith(null);
  });

  it("logs notifications received and tapped", async () => {
    await renderScreen();

    act(() =>
      mockListeners.received?.({ request: { content: { title: "Top-up done" } } }),
    );
    act(() =>
      mockListeners.response?.({
        notification: { request: { content: { title: "Promo" } } },
      }),
    );

    expect(screen.getByText(/Received: Top-up done/)).toBeOnTheScreen();
    expect(screen.getByText(/Tapped: Promo/)).toBeOnTheScreen();
  });
});
