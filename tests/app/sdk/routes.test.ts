/// <reference types="node" />
import fs from "fs";
import path from "path";

import { examplePaths, sdkScreens } from "@/features/example/routes";

/**
 * Typed routes only check paths the dev server has already indexed, so a
 * typo in `examplePaths` would compile and then 404. Every SDK nav entry must
 * point at a screen file that exists.
 */
const APP_DIR = path.resolve(__dirname, "../../../src/app/(public)");

describe("SDK example routes", () => {
  it.each(sdkScreens.map((screen) => [screen.title, screen.href]))(
    "%s links to an existing screen",
    (_title, href) => {
      const file = path.join(APP_DIR, `${String(href)}.tsx`);

      expect(fs.existsSync(file)).toBe(true);
    },
  );

  it("lists every SDK path exactly once", () => {
    const sdkPaths = Object.entries(examplePaths)
      .filter(([key]) => key.startsWith("sdk"))
      .map(([, href]) => href);

    expect(sdkScreens.map((screen) => screen.href).sort()).toEqual(
      [...sdkPaths].sort(),
    );
  });
});
