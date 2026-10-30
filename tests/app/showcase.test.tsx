import {
  Collapsible,
  Picker,
  Slider,
  Switch as NativeSwitch,
} from "@expo/ui";
import {
  AlertDialog,
  FilterChip,
  LinearWavyProgressIndicator,
  RadioButton,
} from "@expo/ui/jetpack-compose";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentType, ReactNode } from "react";

import FormExample from "@/app/(public)/example/form";
import ComponentsIndex from "@/app/(public)/example/components/index";
import DisplayComponents from "@/app/(public)/example/components/display";
import FormComponents from "@/app/(public)/example/components/form";
import LayoutComponents from "@/app/(public)/example/components/layout";
import NativeAndroidComponents from "@/app/(public)/example/components/native-android";
import NativeUniversalComponents from "@/app/(public)/example/components/native-universal";
import OverlayComponents from "@/app/(public)/example/components/overlay";
import Index from "@/app/(public)/index";
import { ComposeShowcase } from "@/features/example/components/ComposeShowcase.android";
import { ToastProvider } from "@/shared/components";
import { getAllByComponent, getByComponent, queryByComponent } from "../helpers/host";

/**
 * The showcase screens are the only place every component is composed together
 * with real props. Type-checking proves the props line up; this proves the
 * screens actually render — compound sub-components, slots, and all.
 */
// `mock` prefix: jest.mock factories may only reach variables named so.
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: mockPush }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

// Several of these screens mount looping animations (Skeleton, an
// indeterminate ProgressBar). Fake timers keep those callbacks from firing
// against a torn-down environment once a test finishes.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

async function renderScreen(Component: ComponentType) {
  return render(
    <ToastProvider>
      <Component />
    </ToastProvider>,
  );
}

describe("component showcase screens", () => {
  it("renders the components index", async () => {
    await renderScreen(ComponentsIndex);

    expect(screen.getByText("Component Library")).toBeOnTheScreen();
    expect(screen.getByText("Layout & Surfaces")).toBeOnTheScreen();
    expect(screen.getByText("Overlays & Feedback")).toBeOnTheScreen();
  });

  it("renders every layout and surface component", async () => {
    await renderScreen(LayoutComponents);

    expect(screen.getByText("Elevated")).toBeOnTheScreen();
    expect(screen.getByText("Outlined")).toBeOnTheScreen();
    expect(screen.getByText("Sign out")).toBeOnTheScreen();
    // Accordion headers are native labels now, so they are read off the props.
    expect(
      getAllByComponent(Collapsible)
        .map((section) => section.props.label),
    ).toContain("What radius does this use?");
  });

  it("renders every data display component", async () => {
    await renderScreen(DisplayComponents);

    expect(screen.getByText("Destructive")).toBeOnTheScreen();
    expect(screen.getByText("Removable")).toBeOnTheScreen();
    expect(screen.getByText("No messages yet")).toBeOnTheScreen();
  });

  it("renders every form control", async () => {
    await renderScreen(FormComponents);

    expect(screen.getByText("Accept terms")).toBeOnTheScreen();
    expect(screen.getByText("Notifications")).toBeOnTheScreen();
    expect(screen.getByText("Pick one")).toBeOnTheScreen();
    // Icon-only controls are identified by their label alone, so each must be
    // reachable on its own.
    expect(screen.getByLabelText("Add note")).toBeTruthy();
    expect(screen.getByLabelText("Add task")).toBeTruthy();
    expect(screen.getByLabelText("Add urgent item")).toBeTruthy();
  });

  it("renders every overlay trigger", async () => {
    await renderScreen(OverlayComponents);

    expect(screen.getByText("Open dialog")).toBeOnTheScreen();
    expect(screen.getByText("Heads up")).toBeOnTheScreen();
    expect(screen.getByText("Could not save")).toBeOnTheScreen();
  });

  it("renders the form example screen", async () => {
    await renderScreen(FormExample);

    expect(screen.getByText("Form Example")).toBeOnTheScreen();
    expect(screen.getByText("Full Name")).toBeOnTheScreen();
  });

  it("lists every example on the home screen, grouped, one tap away", async () => {
    await renderScreen(Index);

    expect(screen.getByText("RN Expo Boilerplate")).toBeOnTheScreen();

    // Section headings.
    expect(screen.getByText("Components")).toBeOnTheScreen();
    expect(screen.getByText("Native UI")).toBeOnTheScreen();
    expect(screen.getByText("Styling")).toBeOnTheScreen();

    // A row from each group, linking straight to the page.
    expect(screen.getByText("Form Example")).toBeOnTheScreen();
    expect(screen.getByText("Android (Jetpack Compose)")).toBeOnTheScreen();
    expect(screen.getByText("Typography")).toBeOnTheScreen();
  });

  it("opens a page straight from its home row", async () => {
    await renderScreen(Index);

    await fireEvent.press(screen.getByText("Typography"));

    expect(mockPush).toHaveBeenCalledWith("/example/typography");
  });

  it("splits the component hub into the library and native UI", async () => {
    await renderScreen(ComponentsIndex);

    expect(screen.getByText("Native UI")).toBeOnTheScreen();
    expect(screen.getByText("Universal")).toBeOnTheScreen();
    expect(screen.getByText("Form Example")).toBeOnTheScreen();
  });

  it("renders every universal @expo/ui component", async () => {
    await renderScreen(NativeUniversalComponents);

    expect(screen.getByText("Pressed 0 times")).toBeOnTheScreen();
    expect(screen.getByText("Selected Medium")).toBeOnTheScreen();
    expect(getAllByComponent(NativeSwitch).length).toBeGreaterThan(1);
    expect(getAllByComponent(Slider).length).toBeGreaterThan(1);
    expect(getByComponent(Picker).props.selectedValue).toBe("Medium");
  });

  it("points iOS and web at the universal page instead of Compose", async () => {
    await renderScreen(NativeAndroidComponents);

    expect(screen.getByText("Android only")).toBeOnTheScreen();
  });

  it("renders the Jetpack Compose showcase for Android", async () => {
    await renderScreen(ComposeShowcase);

    expect(screen.getByText("Pressed 0 times")).toBeOnTheScreen();
    expect(getAllByComponent(FilterChip)).toHaveLength(3);
    expect(getAllByComponent(RadioButton)).toHaveLength(3);
    expect(getByComponent(LinearWavyProgressIndicator)).toBeTruthy();
    // The dialog only mounts once asked for.
    expect(queryByComponent(AlertDialog)).toBeNull();
  });
});
