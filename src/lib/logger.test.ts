import { describe, expect, it } from "vitest";

import { errorFields } from "@/lib/logger";

describe("errorFields", () => {
  it("never lets a key reach the logs", () => {
    const e = new Error("401 Incorrect API key provided: sk-proj-abcdefghijklmnop1234");
    const logged = JSON.stringify(errorFields(e));
    expect(logged).not.toContain("sk-proj-abcdef");
    expect(logged).toContain("[redacted key]");
  });
  it("handles values that are not errors", () => {
    expect(errorFields("AIzaSyA1234567890abcdefghijk went wrong").error).toBe("[redacted key] went wrong");
  });
});
