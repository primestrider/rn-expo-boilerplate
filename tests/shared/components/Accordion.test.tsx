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
import { getAllByComponent } from "../../helpers/host";

const items: AccordionItem[] = [
  { key: "billing", title: "Billing", content: <Text>Invoices</Text> },
  { key: "privacy", title: "Privacy", content: <Text>Data sharing</Text> },
];

/** The native section for one item, reached through its React props. */
function section(key: string) {
  const index = items.findIndex((item) => item.key === key);
  return getAllByComponent(Collapsible)[index];
}

function isExpanded(key: string) {
  return section(key).props.isOpen;
}

/** Stands in for the user tapping the native header. */
async function press(key: string) {
  await act(() => section(key).props.onOpenChange(!isExpanded(key)));
}

beforeEach(async () => {
  await act(() => useThemeStore.getState().setMode("light"));
});

describe("Accordion", () => {
  it("renders a native section per item, titled by the item", async () => {
    await render(<Accordion items={items} />);

    const sections = getAllByComponent(Collapsible);

    expect(sections).toHaveLength(items.length);
    expect(sections.map((s) => s.props.label)).toEqual(["Billing", "Privacy"]);
  });

  it("starts with everything collapsed", async () => {
    await render(<Accordion items={items} />);

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(false);
  });

  it("opens the keys named by defaultOpenKeys", async () => {
    await render(<Accordion items={items} defaultOpenKeys={["privacy"]} />);

    expect(isExpanded("privacy")).toBe(true);
    expect(isExpanded("billing")).toBe(false);
  });

  it("toggles an item open and closed again", async () => {
    await render(<Accordion items={items} />);

    await press("billing");
    expect(isExpanded("billing")).toBe(true);

    await press("billing");
    expect(isExpanded("billing")).toBe(false);
  });

  it("keeps several items open at once by default", async () => {
    await render(<Accordion items={items} />);

    await press("billing");
    await press("privacy");

    expect(isExpanded("billing")).toBe(true);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("collapses the open item when single is set", async () => {
    await render(<Accordion items={items} single />);

    await press("billing");
    await press("privacy");

    expect(isExpanded("billing")).toBe(false);
    expect(isExpanded("privacy")).toBe(true);
  });

  it("renders the content of every item", async () => {
    await render(<Accordion items={items} />);

    expect(screen.getByText("Invoices")).toBeOnTheScreen();
    expect(screen.getByText("Data sharing")).toBeOnTheScreen();
  });

  it("exposes a stable hook per item", async () => {
    await render(<Accordion items={items} />);

    expect(screen.getByTestId(accordionItemTestID("billing"))).toBeOnTheScreen();
  });

  it("follows the active color scheme", async () => {
    await render(<Accordion items={items} />);

    expect(section("billing").props.labelStyle.color).toBe(colors.foreground);
    expect(getAllByComponent(Host)[0].props.seedColor).toBe(
      colors.primary,
    );

    await act(() => useThemeStore.getState().setMode("dark"));

    expect(section("billing").props.labelStyle.color).toBe(
      darkColors.foreground,
    );
    expect(getAllByComponent(Host)[0].props.colorScheme).toBe("dark");
  });

  it("forwards props to the underlying view", async () => {
    await render(<Accordion items={items} testID="accordion" />);

    expect(screen.getByTestId("accordion")).toBeOnTheScreen();
  });
});
