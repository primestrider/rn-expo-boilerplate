/**
 * Every removable example, as `npm run reset-project` and
 * `npm run add-example` see it.
 *
 * `files` are repo-relative paths; an entry ending in `/` claims a whole
 * directory. A file belongs to the module with the most specific (longest)
 * matching entry, so `base` keeps whatever in `src/features/example/` no other
 * module names — a new example helper needs no entry here.
 *
 * `packages` are the npm dependencies only this module imports. Their config
 * plugins need no entry: `configs/plugins.config.ts` applies an SDK plugin only
 * while its package is in `package.json`.
 *
 * `lines` are single lines the module adds to a core file: removed on reset,
 * inserted again after `after` (an existing line, compared trimmed) on add.
 */

/** @typedef {{ file: string, line: string, after: string }} LinePatch */
/**
 * @typedef {{
 *   id: string,
 *   description: string,
 *   files: string[],
 *   packages?: string[],
 *   lines?: LinePatch[],
 *   requires?: string[],
 *   hidden?: boolean,
 * }} ExampleModule
 */

/** Where reset moves the examples. Git-ignored. */
export const STORE_DIR = ".examples";

/**
 * Core files reset overwrites with a clean version after moving the original
 * into the store. `add-example` restores the original only while the file is
 * still that untouched template.
 */
export const TEMPLATES = {
  "src/app/(public)/index.tsx": "scripts/boilerplate/templates/home.tsx",
};

const sdk = (id, description, packages = [], extra = {}) => ({
  id,
  description,
  files: [
    `src/app/(public)/example/sdk/${id}.tsx`,
    `tests/app/sdk/${id}.test.tsx`,
    ...(extra.files ?? []),
  ],
  packages,
  lines: extra.lines,
});

/** @type {ExampleModule[]} */
export const modules = [
  {
    id: "base",
    hidden: true,
    description: "Shared example scaffolding every example needs",
    files: [
      "src/features/example/",
      "src/app/(public)/example/_layout.tsx",
      "tests/features/example/",
    ],
    lines: ["en", "id"].flatMap((lang) => [
      {
        file: `src/locales/${lang}.ts`,
        line: `import example from "@/features/example/languages/example.${lang}";`,
        after: `import auth from "@/features/auth/languages/auth.${lang}";`,
      },
      { file: `src/locales/${lang}.ts`, line: "      example,", after: "auth," },
    ]),
  },
  {
    id: "showcase",
    description: "Styling utilities, component library and @expo/ui showcase",
    files: ["src/app/(public)/example/", "tests/app/showcase.test.tsx"],
  },
  {
    id: "features",
    description: "Products (React Query + FlashList), todos and settings screens",
    files: ["src/app/(public)/example/features/", "tests/app/features.test.tsx"],
    packages: ["@shopify/flash-list"],
  },

  sdk("camera", "expo-camera preview, photo capture and QR scanning", [
    "expo-camera",
  ]),
  sdk("image-picker", "expo-image-picker and expo-document-picker", [
    "expo-image-picker",
    "expo-document-picker",
  ]),
  sdk("location", "expo-location position, live updates, address", [
    "expo-location",
  ]),
  sdk("biometric", "expo-local-authentication guarding expo-secure-store", [
    "expo-local-authentication",
    "expo-secure-store",
  ]),
  sdk("notifications", "expo-notifications local and scheduled", [
    "expo-notifications",
  ]),
  sdk("contacts", "expo-contacts picker and search", ["expo-contacts"]),
  sdk("clipboard", "expo-clipboard with expo-haptics feedback", [
    "expo-clipboard",
    "expo-haptics",
  ]),
  sdk("device", "expo-device info and expo-network connectivity", [
    "expo-device",
    "expo-network",
  ]),
  sdk("share", "expo-print receipt PDF shared with expo-sharing", [
    "expo-print",
    "expo-sharing",
  ]),
  sdk("web-browser", "expo-web-browser in-app pages and expo-linking"),
  sdk("payment-code", "Bright, awake, screenshot-proof pay code screen", [
    "expo-brightness",
    "expo-keep-awake",
    "expo-screen-capture",
  ]),
  sdk("media", "expo-audio voice notes and expo-video player", [
    "expo-audio",
    "expo-video",
  ]),
  sdk("sqlite", "expo-sqlite offline transaction history", ["expo-sqlite"], {
    files: [
      "src/features/example/components/TransactionHistory.tsx",
      "src/features/example/components/TransactionHistory.web.tsx",
      "tests/features/example/components/TransactionHistory.test.tsx",
    ],
  }),
  sdk("files", "expo-image-manipulator and expo-file-system", [
    "expo-file-system",
    "expo-image-manipulator",
    "expo-image-picker",
  ]),
  sdk("calendar", "expo-calendar event with a reminder", ["expo-calendar"]),
  sdk("app-info", "expo-application version and expo-store-review", [
    "expo-application",
    "expo-store-review",
  ]),
  sdk(
    "background-task",
    "expo-background-task periodic sync via expo-task-manager",
    ["expo-background-task", "expo-task-manager"],
    {
      files: ["src/features/example/tasks/", "tests/features/example/tasks/"],
      // The task must be defined at module load, before anything renders.
      lines: [
        {
          file: "src/app/_layout.tsx",
          line: 'import "@/features/example/tasks/sync.task";',
          after: '} from "@/features/auth";',
        },
      ],
    },
  ),
  sdk("effects", "expo-blur, expo-linear-gradient, expo-mesh-gradient", [
    "expo-blur",
    "expo-linear-gradient",
    "expo-mesh-gradient",
  ]),
  sdk("live-photo", "expo-live-photo playback of iOS Live Photos", [
    "expo-image-picker",
    "expo-live-photo",
  ]),
  sdk("blob", "expo-blob binary data", ["expo-blob"]),
  sdk("status-bar", "expo-status-bar style and visibility"),

  {
    id: "home",
    description: "The example directory as the home screen (adds every example)",
    files: ["src/app/(public)/index.tsx", "tests/app/sdk/routes.test.ts"],
    requires: ["*"],
  },
];
