import { selectIsAuthenticated, useSessionStore } from "@/features/auth";

import { ExamplePageName, type ExampleHref, type FeatureNavItem } from "../models";
import { examplePaths } from "../routes";

/**
 * Where a feature row should go right now.
 *
 * `/sign-in` disappears from the navigator once the user is signed in, so a
 * signed-in tap on that row must land on `/account` instead — the only route
 * the guard leaves standing for that session.
 */
export function useFeatureHref() {
  const isAuthenticated = useSessionStore(selectIsAuthenticated);

  return (screen: FeatureNavItem): ExampleHref =>
    screen.name === ExamplePageName.SIGN_IN && isAuthenticated
      ? examplePaths.account
      : screen.href;
}
