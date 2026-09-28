import { signInSchema } from "@/features/auth/models/signIn.schema";
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

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      username: "emilys",
      password: "emilyspass",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a username shorter than 3 characters", () => {
    const result = signInSchema.safeParse({ username: "ab", password: "secret123" });

    expect(result.success).toBe(false);
    expect(messageFor(result, "username")).toBe(
      "features.auth.signIn.validation.usernameMin",
    );
  });

  it("accepts a username of exactly 3 characters", () => {
    const result = signInSchema.safeParse({ username: "abc", password: "secret123" });

    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = signInSchema.safeParse({ username: "emilys", password: "short" });

    expect(result.success).toBe(false);
    expect(messageFor(result, "password")).toBe(
      "features.auth.signIn.validation.passwordMin",
    );
  });

  it("accepts a password of exactly 6 characters", () => {
    const result = signInSchema.safeParse({ username: "emilys", password: "abcdef" });

    expect(result.success).toBe(true);
  });
});

describe("validation messages", () => {
  /**
   * The schema stores translation keys. A key that no longer resolves would
   * surface to the user as the raw dotted path.
   */
  const keys = [
    "features.auth.signIn.validation.usernameMin",
    "features.auth.signIn.validation.passwordMin",
  ];

  it.each(keys)("resolves %s in every language", (key) => {
    for (const bundle of Object.values(resources)) {
      expect(typeof valueAt(bundle.common, key)).toBe("string");
    }
  });
});
