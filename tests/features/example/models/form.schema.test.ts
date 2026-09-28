import { todoSchema } from "@/features/example/models/form.schema";
import { resources } from "@/locales";

/** Reads a dotted key path out of a translation bundle. */
function valueAt(bundle: object, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (current, key) => (current as Record<string, unknown>)?.[key],
      bundle,
    );
}

/** The first error message zod reports for a field. */
function messageFor(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  field: string,
): string | undefined {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("todoSchema", () => {
  it("accepts a reasonable title", () => {
    expect(todoSchema.safeParse({ title: "Buy milk" }).success).toBe(true);
  });

  it("trims before measuring, so whitespace is not content", () => {
    const result = todoSchema.safeParse({ title: "   ab   " });

    expect(result.success).toBe(false);
    expect(messageFor(result, "title")).toBe(
      "features.example.todos.validation.titleMin",
    );
  });

  it("keeps the trimmed value on success", () => {
    const result = todoSchema.safeParse({ title: "  Buy milk  " });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Buy milk");
  });

  it("rejects a title longer than 100 characters", () => {
    const result = todoSchema.safeParse({ title: "a".repeat(101) });

    expect(result.success).toBe(false);
    expect(messageFor(result, "title")).toBe(
      "features.example.todos.validation.titleMax",
    );
  });

  it("accepts a title of exactly 100 characters", () => {
    expect(todoSchema.safeParse({ title: "a".repeat(100) }).success).toBe(true);
  });
});

describe("validation messages", () => {
  /**
   * The schemas store translation keys. A key that no longer resolves would
   * surface to the user as the raw dotted path, which is the kind of thing
   * nobody notices until a screenshot arrives.
   */
  const keys = [
    "features.example.todos.validation.titleMin",
    "features.example.todos.validation.titleMax",
  ];

  it.each(keys)("resolves %s in every language", (key) => {
    for (const bundle of Object.values(resources)) {
      expect(typeof valueAt(bundle.common, key)).toBe("string");
    }
  });
});
