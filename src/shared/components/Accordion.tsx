import { Collapsible, RNHostView } from "@expo/ui";
import { useCallback, useState, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { NativeHost } from "@/shared/native-ui/NativeHost";
import { useTheme } from "@/styles";

import { Divider } from "./Divider";

export type AccordionItem = { key: string; title: string; content: ReactNode };

export type AccordionProps = ViewProps & {
  items: AccordionItem[];
  /** Keys open on first render. */
  defaultOpenKeys?: string[];
  /** Collapses the open item when another is opened. */
  single?: boolean;
};

/** Test hook — stable enough for consumers to target a specific row. */
export const accordionItemTestID = (key: string) => `accordion-item-${key}`;

/**
 * Stack of collapsible sections.
 *
 * Each section is `@expo/ui`'s `Collapsible` — SwiftUI's `DisclosureGroup` on
 * iOS and a Material 3 expandable row on Android — so the header, chevron and
 * expand motion are the platform's own. The content stays React Native.
 *
 * Uncontrolled by design: open state is local, and `defaultOpenKeys` is read
 * once. A controlled mode would make every caller own state it rarely needs.
 *
 * @example
 * <Accordion
 *   single
 *   defaultOpenKeys={["billing"]}
 *   items={[
 *     { key: "billing", title: "Billing", content: <BillingPanel /> },
 *     { key: "privacy", title: "Privacy", content: <PrivacyPanel /> },
 *   ]}
 * />
 */
export function Accordion({
  items,
  defaultOpenKeys,
  single = false,
  ...rest
}: Readonly<AccordionProps>) {
  const { colors } = useTheme();

  const [openKeys, setOpenKeys] = useState<string[]>(
    () => defaultOpenKeys ?? [],
  );

  const setOpen = useCallback(
    (key: string, open: boolean) => {
      setOpenKeys((current) => {
        if (!open) return current.filter((k) => k !== key);
        if (current.includes(key)) return current;
        return single ? [key] : [...current, key];
      });
    },
    [single],
  );

  return (
    <View {...rest}>
      {items.map((item, index) => (
        <View key={item.key}>
          {index > 0 ? <Divider /> : null}
          {/* Height follows the native content as it expands; width stays the
              row's, so the header spans the full line. */}
          <NativeHost
            testID={accordionItemTestID(item.key)}
            matchContents={{ vertical: true }}
          >
            <Collapsible
              label={item.title}
              labelStyle={{ color: colors.foreground }}
              isOpen={openKeys.includes(item.key)}
              onOpenChange={(open) => setOpen(item.key, open)}
            >
              <RNHostView matchContents>
                <View>{item.content}</View>
              </RNHostView>
            </Collapsible>
          </NativeHost>
        </View>
      ))}
    </View>
  );
}
