import { Collapsible, Host } from "@expo/ui";
import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import {
  Accordion,
  accordionItemTestID,
  type AccordionItem,
} from "@/shared/components/Accordion";
import { useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

const items: AccordionItem[] = [
  { key: "billing", title: "Billing", content: <Text>Invoices</Text> },
  { key: "privacy", title: "Privacy", content: <Text>Data sharing</Text> },
];

/** The native section for one item, reached through its React props. */
function section(key: string) {
  const index = items.findIndex((item) => item.key === key);
  return screen.UNSAFE_getAllByType(Collapsible)[index];
}

function isExpanded(key: string) {
  return section(key).props.isOpen;
}

/** Stands in for the user tapping the native header. */
function press(key: string) {
  act(() => section(key).props.onOpenChange(!isExpanded(key)));
}

beforeEach(() => {
  act(() => useThemeStore.getState().setMode("light"));
});

describe("Accordion", () => {
  it("renders a native section per item, titled by the item", () => {
    render(<Accordion items={items} />);

    const sections = screen.UNSAFE_getAllByType(Collapsible);

    expect(sections).toHaveLength(items.length);
    expect(sections.map((s) => s.props.label)).toEqual(["Billing", "Privacy"]);
  });

  it("starts with everything collapsed", () => {
    render(<Accordion items={items} />);

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(false);
  });

  it("opens the keys named by defaultOpenKeys", () => {
    render(<Accordion items={items} defaultOpenKeys={["privacy"]} />);

    expect(isExpanded("privacy")).toBe(true);
    expect(isExpanded("billing")).toBe(false);
  });

  it("toggles an item open and closed again", () => {
    render(<Accordion items={items} />);

    press("billing");
    expect(isExpanded("billing")).toBe(true);

    press("billing");
    expect(isExpanded("billing")).toBe(false);
  });

  it("keeps several items open at once by default", () => {
    render(<Accordion items={items} />);

    press("billing");
    press("privacy");

    expect(isExpanded("billing")).toBe(true);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("collapses the open item when single is set", () => {
    render(<Accordion items={items} single />);

    press("billing");
    press("privacy");

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("renders the content of every item", () => {
    render(<Accordion items={items} />);

    expect(screen.getByText("Invoices")).toBeOnTheScreen();
    expect(screen.getByText("Data sharing")).toBeOnTheScreen();
  });

  it("exposes a stable hook per item", () => {
    render(<Accordion items={items} />);

    expect(screen.getByTestId(accordionItemTestID("billing"))).toBeOnTheScreen();
  });

  it("follows the active color scheme", () => {
    render(<Accordion items={items} />);

    expect(section("billing").props.labelStyle.color).toBe(colors.foreground);
    expect(screen.UNSAFE_getAllByType(Host)[0].props.seedColor).toBe(
      colors.primary,
    );

    act(() => useThemeStore.getState().setMode("dark"));

    expect(section("billing").props.labelStyle.color).toBe(
      darkColors.foreground,
    );
    expect(screen.UNSAFE_getAllByType(Host)[0].props.colorScheme).toBe("dark");
  });

  it("forwards props to the underlying view", () => {
    render(<Accordion items={items} testID="accordion" />);

    expect(screen.getByTestId("accordion")).toBeOnTheScreen();
  });
});
