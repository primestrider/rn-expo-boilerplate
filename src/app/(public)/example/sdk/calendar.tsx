import {
  EntityTypes,
  getCalendars,
  useCalendarPermissions,
  type ExpoCalendar,
} from "expo-calendar";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { InfoRows, PermissionGate, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import { formatDateTime } from "@/shared/helpers";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Switch,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const BOOKINGS = {
  flight: { title: "Flight CGK → DPS", location: "Soekarno-Hatta T3", hours: 2 },
  doctor: { title: "Doctor appointment", location: "RS Pondok Indah", hours: 1 },
  movie: { title: "Movie tickets", location: "CGV Grand Indonesia", hours: 3 },
} as const;

type Booking = keyof typeof BOOKINGS;

const WHEN = { tomorrow: 1, "in-3-days": 3, "next-week": 7 } as const;

type When = keyof typeof WHEN;

const DAY = 24 * 60 * 60 * 1000;

/** A booking starts at 09:00 local time, `days` from today. */
const bookingStart = (days: number, now = new Date()) => {
  const start = new Date(now);
  start.setDate(start.getDate() + days);
  start.setHours(9, 0, 0, 0);
  return start;
};

/**
 * expo-calendar: after checkout, add the flight, appointment or tickets to
 * the user's own calendar with a reminder.
 */
export default function CalendarExample() {
  const styles = useStyles();
  const [permission, requestPermission] = useCalendarPermissions();

  const [booking, setBooking] = useState<Booking>("flight");
  const [when, setWhen] = useState<When>("tomorrow");
  const [reminder, setReminder] = useState(true);
  const [target, setTarget] = useState<ExpoCalendar | null>(null);
  const [upcoming, setUpcoming] = useState<{ title: string; startDate: string | Date }[]>([]);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  /** The first calendar the user can write to — iCloud, Google, or local. */
  const writableCalendar = async () => {
    const calendars = await getCalendars(EntityTypes.EVENT);
    return calendars.find((calendar) => calendar.allowsModifications) ?? null;
  };

  const addBooking = async () => {
    try {
      const calendar = target ?? (await writableCalendar());
      if (!calendar) {
        setStatus({ ok: false, message: "No writable calendar on this device." });
        return;
      }
      setTarget(calendar);

      const { title, location, hours } = BOOKINGS[booking];
      const startDate = bookingStart(WHEN[when]);
      await calendar.createEvent({
        title,
        location,
        startDate,
        endDate: new Date(startDate.getTime() + hours * 60 * 60 * 1000),
        notes: "Added from the SDK example.",
        // Minutes relative to the start: one hour before.
        alarms: reminder ? [{ relativeOffset: -60 }] : [],
      });

      const now = new Date();
      const events = await calendar.listEvents(now, new Date(now.getTime() + 8 * DAY));
      setUpcoming(events.map(({ title: t, startDate: s }) => ({ title: t, startDate: s })));
      setStatus({ ok: true, message: `Added to “${calendar.title}”.` });
    } catch (e) {
      setStatus({
        ok: false,
        message: e instanceof Error ? e.message : "Could not add the event.",
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Calendar" }} />
      <Screen>
        <PermissionGate
          permission={permission}
          onRequest={requestPermission}
          reason="Calendar access is needed to add your bookings."
        >
          <Section
            title="Add booking"
            description="Creates an event, optionally with a reminder an hour before"
            utilities={["getCalendars", "createEvent", "alarms", "listEvents"]}
          >
            <NativeHost matchContents={{ vertical: true }}>
              <Column spacing={12}>
                <Picker
                  selectedValue={booking}
                  onValueChange={(value) => setBooking(value as Booking)}
                >
                  {(Object.keys(BOOKINGS) as Booking[]).map((key) => (
                    <Picker.Item key={key} label={BOOKINGS[key].title} value={key} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={when}
                  onValueChange={(value) => setWhen(value as When)}
                >
                  <Picker.Item label="Tomorrow 09:00" value="tomorrow" />
                  <Picker.Item label="In 3 days 09:00" value="in-3-days" />
                  <Picker.Item label="Next week 09:00" value="next-week" />
                </Picker>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  label="Remind me 1 hour before"
                />
                <Button label="Add to calendar" onPress={addBooking} />
              </Column>
            </NativeHost>

            {status ? (
              <Alert
                variant={status.ok ? "success" : "error"}
                title={status.message}
                style={styles.mt3}
              />
            ) : null}
          </Section>

          {upcoming.length > 0 ? (
            <Section
              title="Next 7 days"
              description={target ? `Events in “${target.title}”` : undefined}
              utilities={["listEvents"]}
            >
              <View>
                <InfoRows
                  rows={upcoming.map((event) => [
                    event.title,
                    formatDateTime(new Date(event.startDate), "EEE dd MMM, HH:mm"),
                  ])}
                />
              </View>
            </Section>
          ) : null}
        </PermissionGate>
      </Screen>
    </>
  );
}
