import { act, render, screen } from "@testing-library/react-native";
import * as Contacts from "expo-contacts";
import type { ReactNode } from "react";

import ContactsExample from "@/app/(public)/example/sdk/contacts";

import { infoValue, pressNative, typeNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-contacts", () => ({
  ContactField: { FULL_NAME: "fullName", PHONES: "phones" },
  Contact: {
    presentPicker: jest.fn(),
    getCount: jest.fn(),
    getAllDetails: jest.fn(),
  },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

const contacts = jest.mocked(Contacts);
const granted = { granted: true, canAskAgain: true, status: "granted", expires: "never" };
const denied = { granted: false, canAskAgain: true, status: "denied", expires: "never" };

const details = (id: string, fullName: string, phone?: string) => ({
  id,
  fullName,
  phones: phone ? [{ id: `${id}-p`, number: phone }] : [],
});

async function renderScreen() {
  render(<ContactsExample />);
  await act(async () => {});
}

/** Lets the search debounce elapse and its query settle. */
async function flushSearch() {
  await act(async () => {
    jest.advanceTimersByTime(250);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  contacts.getPermissionsAsync.mockResolvedValue(granted as never);
  contacts.Contact.getCount.mockResolvedValue(42);
  contacts.Contact.getAllDetails.mockResolvedValue([] as never);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Contacts example", () => {
  it("fills the recipient from the system contact picker", async () => {
    const getDetails = jest.fn(async () => details("1", "Budi Santoso", "+62 812 000"));
    contacts.Contact.presentPicker.mockResolvedValue({ getDetails } as never);
    await renderScreen();

    await pressNative("Choose recipient");

    expect(getDetails).toHaveBeenCalledWith(["fullName", "phones"]);
    expect(infoValue("Name")).toBe("Budi Santoso");
    expect(infoValue("Phone")).toBe("+62 812 000");
  });

  it("does nothing when the picker is dismissed", async () => {
    contacts.Contact.presentPicker.mockResolvedValue(null);
    await renderScreen();

    await pressNative("Choose recipient");

    expect(infoValue("Name")).toBeUndefined();
  });

  it("shows why the picker failed", async () => {
    contacts.Contact.presentPicker.mockRejectedValue(new Error("Picker unavailable"));
    await renderScreen();

    await pressNative("Choose recipient");

    expect(screen.getByText("Picker unavailable")).toBeOnTheScreen();
  });

  it("gates address-book search behind the contacts permission", async () => {
    contacts.getPermissionsAsync.mockResolvedValue(denied as never);
    contacts.requestPermissionsAsync.mockResolvedValue(granted as never);
    await renderScreen();
    await flushSearch();

    expect(contacts.Contact.getAllDetails).not.toHaveBeenCalled();

    await pressNative("Grant access");
    await flushSearch();

    expect(contacts.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Search 42 contacts by name")).toBeOnTheScreen();
    expect(contacts.Contact.getAllDetails).toHaveBeenCalled();
  });

  it("lists the first ten contacts, then searches by name after a pause", async () => {
    contacts.Contact.getAllDetails.mockResolvedValue([
      details("1", "Ani", "0811"),
      details("2", "Andi"),
    ] as never);
    await renderScreen();
    await flushSearch();

    expect(contacts.Contact.getAllDetails).toHaveBeenLastCalledWith(
      ["fullName", "phones"],
      { name: undefined, limit: 10 },
    );
    expect(infoValue("Ani")).toBe("0811");
    expect(infoValue("Andi")).toBe("—");

    await typeNative("an");
    expect(contacts.Contact.getAllDetails).toHaveBeenCalledTimes(1);

    await flushSearch();
    expect(contacts.Contact.getAllDetails).toHaveBeenLastCalledWith(
      ["fullName", "phones"],
      { name: "an", limit: 10 },
    );
  });

  it("says so when nothing matches", async () => {
    await renderScreen();
    await flushSearch();

    expect(screen.getByText("No contacts found.")).toBeOnTheScreen();
  });
});
