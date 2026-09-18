import type { LinkProps } from "expo-router";

export type ExampleScreen = {
  href: LinkProps["href"];
  title: string;
  description: string;
  utilities: string[];
};

export const exampleScreens: ExampleScreen[] = [
  {
    href: "/example/colors" as LinkProps["href"],
    title: "Colors",
    description: "Background, text color, and palette colors",
    utilities: ["bgPrimary", "textForeground", "bgGray100", "textError"],
  },
  {
    href: "/example/typography" as LinkProps["href"],
    title: "Typography",
    description: "Font size, weight, alignment, and text decoration",
    utilities: ["textLg", "fontBold", "textCenter", "trackingWide"],
  },
  {
    href: "/example/spacing" as LinkProps["href"],
    title: "Spacing",
    description: "Padding, margin, gap, and negative margin",
    utilities: ["p4", "mx2", "gap3", "-mt2"],
  },
  {
    href: "/example/layout" as LinkProps["href"],
    title: "Layout & Flex",
    description: "Flexbox, alignment, position, and grid-like layout",
    utilities: ["flexRow", "itemsCenter", "justifyBetween", "gridCols3"],
  },
  {
    href: "/example/sizing" as LinkProps["href"],
    title: "Sizing",
    description: "Width, height, min/max size, and aspect ratio",
    utilities: ["wFull", "h12", "size16", "aspectSquare"],
  },
  {
    href: "/example/appearance" as LinkProps["href"],
    title: "Appearance",
    description: "Border, border radius, shadow, and opacity",
    utilities: ["roundedXl", "border", "shadowMd", "opacity50"],
  },
  {
    href: "/example/helpers" as LinkProps["href"],
    title: "Helpers",
    description: "view(), space(), and gridCol() for dynamic styles",
    utilities: ["view()", "space('p', 20)", "gridCol(3)"],
  },
  {
    href: "/example/theme" as LinkProps["href"],
    title: "Theme",
    description: "Dark mode with a persisted System / Light / Dark preference",
    utilities: ["useTheme()", "useStyles()", "ThemeToggle"],
  },
  {
    href: "/example/form" as LinkProps["href"],
    title: "Form",
    description: "React Hook Form with shared Input and Button components",
    utilities: ["useForm", "Controller", "Button", "Input"],
  },
  {
    href: "/example/components" as LinkProps["href"],
    title: "Components",
    description:
      "The shared component library — surfaces, overlays, and form controls",
    utilities: ["Card", "Dialog", "BottomSheet", "Toast", "ListItem"],
  },
];
