import {
  ExamplePageName,
  type ComponentGroup,
  type ExampleHref,
  type ExampleNavItem,
  type FeatureNavItem,
} from "../models";

/**
 * Asserts a path into the typed-routes union.
 *
 * The union is generated from files the dev server has already indexed, so a
 * freshly added route is not in it until Expo regenerates `.expo/types`. The
 * assertion is confined to this file rather than repeated at every call site.
 */
const href = (path: string): ExampleHref => path as ExampleHref;

/** Every path the example feature owns, in one place. */
export const examplePaths = {
  index: href("/example"),
  colors: href("/example/colors"),
  typography: href("/example/typography"),
  spacing: href("/example/spacing"),
  layout: href("/example/layout"),
  sizing: href("/example/sizing"),
  appearance: href("/example/appearance"),
  helpers: href("/example/helpers"),
  theme: href("/example/theme"),
  form: href("/example/form"),

  components: href("/example/components"),
  componentsLayout: href("/example/components/layout"),
  componentsDisplay: href("/example/components/display"),
  componentsForm: href("/example/components/form"),
  componentsOverlay: href("/example/components/overlay"),
  componentsNativeUniversal: href("/example/components/native-universal"),
  componentsNativeAndroid: href("/example/components/native-android"),

  features: href("/example/features"),
  signIn: href("/sign-in"),
  account: href("/account"),
  products: href("/example/features/products"),
  productDetail: (id: number | string) =>
    href(`/example/features/products/${id}`),
  todos: href("/example/features/todos"),
  settings: href("/example/features/settings"),
} as const;

/**
 * The utility-styling examples.
 *
 * Copy here stays in English on purpose: it documents the styling system for
 * whoever is reading the code, rather than being app copy a user would see.
 */
export const exampleScreens: ExampleNavItem[] = [
  {
    name: ExamplePageName.COLORS,
    href: examplePaths.colors,
    title: "Colors",
    description: "Background, text color, and palette colors",
    utilities: ["bgPrimary", "textForeground", "bgGray100", "textError"],
  },
  {
    name: ExamplePageName.TYPOGRAPHY,
    href: examplePaths.typography,
    title: "Typography",
    description: "Font size, weight, alignment, and text decoration",
    utilities: ["textLg", "fontBold", "textCenter", "trackingWide"],
  },
  {
    name: ExamplePageName.SPACING,
    href: examplePaths.spacing,
    title: "Spacing",
    description: "Padding, margin, gap, and negative margin",
    utilities: ["p4", "mx2", "gap3", "-mt2"],
  },
  {
    name: ExamplePageName.LAYOUT,
    href: examplePaths.layout,
    title: "Layout & Flex",
    description: "Flexbox, alignment, position, and grid-like layout",
    utilities: ["flexRow", "itemsCenter", "justifyBetween", "gridCols3"],
  },
  {
    name: ExamplePageName.SIZING,
    href: examplePaths.sizing,
    title: "Sizing",
    description: "Width, height, min/max size, and aspect ratio",
    utilities: ["wFull", "h12", "size16", "aspectSquare"],
  },
  {
    name: ExamplePageName.APPEARANCE,
    href: examplePaths.appearance,
    title: "Appearance",
    description: "Border, border radius, shadow, and opacity",
    utilities: ["roundedXl", "border", "shadowMd", "opacity50"],
  },
  {
    name: ExamplePageName.HELPERS,
    href: examplePaths.helpers,
    title: "Helpers",
    description: "view(), space(), and gridCol() for dynamic styles",
    utilities: ["view()", "space('p', 20)", "gridCol(3)"],
  },
  {
    name: ExamplePageName.THEME,
    href: examplePaths.theme,
    title: "Theme",
    description: "Dark mode with a persisted System / Light / Dark preference",
    utilities: ["useTheme()", "useStyles()", "ThemeToggle"],
  },
];

/** The component-library showcase, grouped by what each component is for. */
export const componentGroups: ComponentGroup[] = [
  {
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsLayout,
    title: "Layout & Surfaces",
    description: "Text, screens, dividers, cards, list rows, accordions",
    components: [
      "AppText",
      "Screen",
      "Divider",
      "Card",
      "ListItem",
      "Accordion",
    ],
  },
  {
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsDisplay,
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
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsForm,
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
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsOverlay,
    title: "Overlays & Feedback",
    description: "Dialogs, bottom sheets, toasts, and inline alerts",
    components: ["Dialog", "BottomSheet", "Toast", "Alert"],
  },
  {
    name: ExamplePageName.FORM,
    href: examplePaths.form,
    title: "Form Example",
    description: "React Hook Form wired to the shared Input and Button",
    components: ["useForm", "Controller", "Input", "Button"],
  },
];

/**
 * Native UI from `@expo/ui`, kept apart from the component library: these
 * render the platform's own controls rather than the app's themed ones.
 */
export const nativeComponentGroups: ComponentGroup[] = [
  {
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsNativeUniversal,
    title: "Universal",
    description:
      "@expo/ui on SwiftUI, Jetpack Compose and web from one tree",
    components: [
      "NativeHost",
      "Column",
      "Row",
      "Text",
      "Button",
      "Switch",
      "Checkbox",
      "Slider",
      "Picker",
      "TextInput",
      "Collapsible",
      "BottomSheet",
      "List",
      "FieldGroup",
      "Icon",
      "RNHostView",
    ],
  },
  {
    name: ExamplePageName.COMPONENTS,
    href: examplePaths.componentsNativeAndroid,
    title: "Android (Jetpack Compose)",
    description: "Material 3 components from @expo/ui/jetpack-compose",
    components: [
      "Buttons",
      "FAB",
      "Chips",
      "Selection",
      "TextField",
      "Menus",
      "Cards",
      "Badges",
      "Progress",
      "Carousel",
      "AlertDialog",
      "Material colors",
    ],
  },
];

/** The feature examples. Titles are translation keys — this is app copy. */
export const featureScreens: FeatureNavItem[] = [
  {
    name: ExamplePageName.SIGN_IN,
    href: examplePaths.signIn,
    titleKey: "features.example.signIn.title",
    descriptionKey: "features.example.signIn.subtitle",
    plugins: ["react-hook-form", "zod", "axios", "mmkv", "zustand", "expo-router"],
  },
  {
    name: ExamplePageName.PRODUCTS,
    href: examplePaths.products,
    titleKey: "features.example.products.title",
    descriptionKey: "features.example.products.subtitle",
    plugins: ["react-query", "axios", "flash-list", "expo-image"],
  },
  {
    name: ExamplePageName.TODOS,
    href: examplePaths.todos,
    titleKey: "features.example.todos.title",
    descriptionKey: "features.example.todos.subtitle",
    plugins: ["zustand", "mmkv", "zod"],
  },
  {
    name: ExamplePageName.SETTINGS,
    href: examplePaths.settings,
    titleKey: "features.example.settings.title",
    descriptionKey: "features.example.settings.subtitle",
    plugins: ["i18n", "mmkv", "date-fns", "zustand"],
  },
];
