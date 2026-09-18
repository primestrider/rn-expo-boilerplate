/**
 * Global Jest setup.
 *
 * Only native modules that cannot run inside Jest are mocked here; everything
 * else is exercised for real so the tests reflect actual app behavior.
 */

// `Input` calls `useResizeMode()` and `KeyboardController.dismiss()`, both of
// which need the native keyboard module. The library ships its own mock.
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);
