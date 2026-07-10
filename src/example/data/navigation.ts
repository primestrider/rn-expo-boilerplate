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
];
