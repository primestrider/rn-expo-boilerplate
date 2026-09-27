import { render, screen } from "@testing-library/react-native";
import * as Calendar from "expo-calendar";
import type { ReactNode } from "react";

import CalendarExample from "@/app/(public)/example/sdk/calendar";

import { infoValue, pickNative, pressNative, toggleNative } from "../../helpers/native-ui";

let mockPermission: { granted: boolean; canAskAgain: boolean } | null = null;
const mockRequestPermission = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-calendar", () => ({
  EntityTypes: { EVENT: "event" },
  getCalendars: jest.fn(),
  useCalendarPermissions: () => [mockPermission, mockRequestPermission],
}));

const getCalendars = jest.mocked(Calendar.getCalendars);

const calendar = (title: string, allowsModifications: boolean) => ({
  title,
  allowsModifications,
  createEvent: jest.fn(),
  listEvents: jest.fn(async () => [] as { title: string; startDate: Date }[]),
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 8, 27, 14, 30) });
  mockPermission = { granted: true, canAskAgain: true };
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Calendar example", () => {
  it("asks for calendar access first", async () => {
    mockPermission = { granted: false, canAskAgain: true };
    render(<CalendarExample />);

    await pressNative("Grant access");

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("adds the booking tomorrow at 09:00 with a one-hour reminder", async () => {
    const readOnly = calendar("Holidays", false);
    const personal = calendar("Personal", true);
    getCalendars.mockResolvedValue([readOnly, personal] as never);
    render(<CalendarExample />);

    await pressNative("Add to calendar");

    expect(getCalendars).toHaveBeenCalledWith("event");
    expect(readOnly.createEvent).not.toHaveBeenCalled();
    expect(personal.createEvent).toHaveBeenCalledWith({
      title: "Flight CGK → DPS",
      location: "Soekarno-Hatta T3",
      startDate: new Date(2026, 8, 28, 9, 0),
      endDate: new Date(2026, 8, 28, 11, 0),
      notes: "Added from the SDK example.",
      alarms: [{ relativeOffset: -60 }],
    });
    expect(screen.getByText("Added to “Personal”.")).toBeOnTheScreen();
  });

  it("uses the chosen booking and day, without a reminder when off", async () => {
    const personal = calendar("Personal", true);
    getCalendars.mockResolvedValue([personal] as never);
    render(<CalendarExample />);

    await pickNative("doctor", 0);
    await pickNative("next-week", 1);
    await toggleNative("Remind me 1 hour before", false);
    await pressNative("Add to calendar");

    expect(personal.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Doctor appointment",
        startDate: new Date(2026, 9, 4, 9, 0),
        endDate: new Date(2026, 9, 4, 10, 0),
        alarms: [],
      }),
    );
  });

  it("lists the week's events after adding", async () => {
    const personal = calendar("Personal", true);
    personal.listEvents.mockResolvedValue([
      { title: "Flight CGK → DPS", startDate: new Date(2026, 8, 28, 9, 0) },
    ]);
    getCalendars.mockResolvedValue([personal] as never);
    render(<CalendarExample />);

    await pressNative("Add to calendar");

    expect(infoValue("Flight CGK → DPS")).toMatch(/28 Sep, 09:00/);
  });

  it("explains when there is no writable calendar", async () => {
    getCalendars.mockResolvedValue([calendar("Holidays", false)] as never);
    render(<CalendarExample />);

    await pressNative("Add to calendar");

    expect(screen.getByText("No writable calendar on this device.")).toBeOnTheScreen();
  });

  it("shows why an event could not be created", async () => {
    const personal = calendar("Personal", true);
    personal.createEvent.mockRejectedValue(new Error("Calendar is read-only"));
    getCalendars.mockResolvedValue([personal] as never);
    render(<CalendarExample />);

    await pressNative("Add to calendar");

    expect(screen.getByText("Calendar is read-only")).toBeOnTheScreen();
  });
});
