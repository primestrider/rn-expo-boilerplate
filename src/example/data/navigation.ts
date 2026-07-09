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
    description: "Background, text color, dan palette warna",
    utilities: ["bgPrimary", "textForeground", "bgGray100", "textError"],
  },
  {
    href: "/example/typography" as LinkProps["href"],
    title: "Typography",
    description: "Ukuran font, weight, alignment, dan dekorasi teks",
    utilities: ["textLg", "fontBold", "textCenter", "trackingWide"],
  },
  {
    href: "/example/spacing" as LinkProps["href"],
    title: "Spacing",
    description: "Padding, margin, gap, dan negative margin",
    utilities: ["p4", "mx2", "gap3", "-mt2"],
  },
  {
    href: "/example/layout" as LinkProps["href"],
    title: "Layout & Flex",
    description: "Flexbox, alignment, position, dan grid-like layout",
    utilities: ["flexRow", "itemsCenter", "justifyBetween", "gridCols3"],
  },
  {
    href: "/example/sizing" as LinkProps["href"],
    title: "Sizing",
    description: "Width, height, min/max size, dan aspect ratio",
    utilities: ["wFull", "h12", "size16", "aspectSquare"],
  },
  {
    href: "/example/appearance" as LinkProps["href"],
    title: "Appearance",
    description: "Border, border radius, shadow, dan opacity",
    utilities: ["roundedXl", "border", "shadowMd", "opacity50"],
  },
  {
    href: "/example/helpers" as LinkProps["href"],
    title: "Helpers",
    description: "cx(), space(), dan gridCol() untuk style dinamis",
    utilities: ["cx()", "space('p', 20)", "gridCol(3)"],
  },
];
