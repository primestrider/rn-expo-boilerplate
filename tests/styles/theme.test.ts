import { renderHook, act } from "@testing-library/react-native";
import { useColorScheme } from "react-native";

import { mmkvStorage, storageKeys } from "@/plugins/mmkv";
import { useStyles, useTheme, useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

jest.mock("react-native/Libraries/Utilities/useColorScheme");

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

/**
 * Accepts values the type says cannot happen (`undefined`, `"unspecified"`),
 * because the resolver defends against them at runtime.
 */
function setSystemScheme(scheme: unknown) {
  mockedUseColorScheme.mockReturnValue(
    scheme as ReturnType<typeof useColorScheme>,
  );
}

beforeEach(async () => {
  setSystemScheme("light");
  await act(() => useThemeStore.getState().setMode("system"));
});

describe("scheme resolution", () => {
  it.each([
    ["light", "light"],
    ["dark", "dark"],
  ] as const)("follows the OS when mode is system (%s)", async (system, expected) => {
    setSystemScheme(system);

    const { result } = await renderHook(() => useTheme());

    expect(result.current.mode).toBe("system");
    expect(result.current.scheme).toBe(expected);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["unspecified", "unspecified"],
  ])("falls back to light when the OS reports %s", async (_label, system) => {
    setSystemScheme(system);

    expect((await renderHook(() => useTheme())).result.current.scheme).toBe("light");
  });

  it.each(["light", "dark"] as const)(
    "ignores the OS when pinned to %s",
    async (mode) => {
      setSystemScheme(mode === "light" ? "dark" : "light");
      await act(() => useThemeStore.getState().setMode(mode));

      const { result } = await renderHook(() => useTheme());

      expect(result.current.scheme).toBe(mode);
      expect(result.current.isDark).toBe(mode === "dark");
    },
  );

  it("exposes the matching semantic palette", async () => {
    setSystemScheme("dark");

    expect((await renderHook(() => useTheme())).result.current.colors).toBe(darkColors);

    setSystemScheme("light");

    expect((await renderHook(() => useTheme())).result.current.colors).toBe(colors);
  });

  it("reacts to a mode change without remounting", async () => {
    const { result } = await renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);

    await act(() => result.current.setMode("dark"));

    expect(result.current.scheme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });
});

describe("persistence", () => {
  it("writes the preference under the shared storage key", async () => {
    await act(() => useThemeStore.getState().setMode("dark"));

    const stored = mmkvStorage.getString(storageKeys.app.theme);

    expect(stored).toBeDefined();
    expect(JSON.parse(stored!).state.mode).toBe("dark");
  });
});

describe("useStyles", () => {
  it("resolves semantic colors for the active scheme", async () => {
    setSystemScheme("light");
    expect((await renderHook(() => useStyles())).result.current.bgBackground).toEqual({
      backgroundColor: colors.background,
    });

    setSystemScheme("dark");
    expect((await renderHook(() => useStyles())).result.current.bgBackground).toEqual({
      backgroundColor: darkColors.background,
    });
  });

  it.each([
    ["textForeground", "color"],
    ["borderBorder", "borderColor"],
    ["bgCard", "backgroundColor"],
  ] as const)("gives %s a different value per scheme", async (key, property) => {
    setSystemScheme("light");
    const light = (await renderHook(() => useStyles())).result.current[key] as Record<
      string,
      string
    >;

    setSystemScheme("dark");
    const dark = (await renderHook(() => useStyles())).result.current[key] as Record<
      string,
      string
    >;

    expect(light[property]).not.toBe(dark[property]);
  });

  it("shares theme-neutral utilities between both schemes", async () => {
    setSystemScheme("light");
    const light = (await renderHook(() => useStyles())).result.current;

    setSystemScheme("dark");
    const dark = (await renderHook(() => useStyles())).result.current;

    // Same object identity — layout never gets rebuilt when the theme changes.
    expect(light.p4).toBe(dark.p4);
    expect(light.flexRow).toBe(dark.flexRow);
    expect(light.bgGray100).toBe(dark.bgGray100);
  });

  it("returns one cached object per scheme", async () => {
    setSystemScheme("dark");

    expect((await renderHook(() => useStyles())).result.current).toBe(
      (await renderHook(() => useStyles())).result.current,
    );
  });
});
