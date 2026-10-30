import { screen } from "@testing-library/react-native";
import type { ComponentType } from "react";

/**
 * Native host elements rendered under a type name, in tree order.
 *
 * RNTL v14 renders host elements only and dropped `UNSAFE_*ByType`, so this
 * matches on the host name instead of the component: `ScrollView` is
 * "RCTScrollView", `View` / `ActivityIndicator` / `Text` keep their own names.
 */
export function queryAllByHostType(type: string) {
  return screen.container.queryAll((node) => node.type === type);
}

export function queryByHostType(type: string) {
  return queryAllByHostType(type)[0] ?? null;
}

export function getByHostType(type: string) {
  const node = queryByHostType(type);
  if (!node) throw new Error(`No host element of type "${type}" was rendered`);
  return node;
}

interface Fiber {
  tag: number;
  type: unknown;
  elementType: unknown;
  memoizedProps: unknown;
  stateNode: { current?: Fiber } | null;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
}

const HOST_ROOT = 3;

// Typed like the `UNSAFE_*ByType` results the tests were written against.
interface Instance {
  props: Record<string, any>;
}

/**
 * Rendered instances of a composite component, in tree order — the v14
 * stand-in for `UNSAFE_getAllByType`. `@expo/ui` controls all render the same
 * native host, so tests that drive them through their props need the
 * component itself. It walks React's committed fiber tree, reached through
 * any host element's fiber.
 */
export function queryAllByComponent(
  component: ComponentType<any>,
): Instance[] {
  const host = screen.container.queryAll(() => true)[0];
  let fiber = host?.unstable_fiber as Fiber | null | undefined;
  while (fiber && fiber.tag !== HOST_ROOT) fiber = fiber.return;
  if (!fiber) return [];

  const matches: Instance[] = [];
  const visit = (node: Fiber | null) => {
    for (; node; node = node.sibling) {
      if (node.type === component || node.elementType === component) {
        matches.push({ props: node.memoizedProps as Instance["props"] });
      }
      visit(node.child);
    }
  };
  // The root's `current` is the committed tree; the fiber reached from a host
  // element may be its stale alternate.
  visit(fiber.stateNode?.current?.child ?? fiber.child);
  return matches;
}

export function queryByComponent(component: ComponentType<any>) {
  return queryAllByComponent(component)[0] ?? null;
}

export function getAllByComponent(component: ComponentType<any>) {
  const matches = queryAllByComponent(component);
  if (!matches.length) throw new Error(`No ${nameOf(component)} was rendered`);
  return matches;
}

export function getByComponent(component: ComponentType<any>) {
  return getAllByComponent(component)[0];
}

function nameOf(component: ComponentType<any>) {
  return component.displayName ?? component.name ?? "component";
}
