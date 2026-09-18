export type ComponentGroup = {
  href: string;
  title: string;
  description: string;
  components: string[];
};

export const componentGroups: ComponentGroup[] = [
  {
    href: "/example/components/layout",
    title: "Layout & Surfaces",
    description: "Text, screens, dividers, cards, list rows, accordions",
    components: ["AppText", "Screen", "Divider", "Card", "ListItem", "Accordion"],
  },
  {
    href: "/example/components/display",
    title: "Data Display",
    description: "Badges, chips, avatars, progress, and loading states",
    components: [
      "Badge",
      "Chip",
      "Avatar",
      "ProgressBar",
      "Skeleton",
      "Spinner",
      "EmptyState",
    ],
  },
  {
    href: "/example/components/form",
    title: "Form Controls",
    description: "Buttons, inputs, toggles, selection, and tabs",
    components: [
      "Button",
      "IconButton",
      "Input",
      "Checkbox",
      "Radio",
      "Switch",
      "Select",
      "Tabs",
    ],
  },
  {
    href: "/example/components/overlay",
    title: "Overlays & Feedback",
    description: "Dialogs, bottom sheets, toasts, and inline alerts",
    components: ["Dialog", "BottomSheet", "Toast", "Alert"],
  },
];
