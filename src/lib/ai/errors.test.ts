import { APICallError, RetryError } from "ai";
import { describe, expect, it } from "vitest";

import { AiKeyError, classifyAiError, isKeyProblem } from "@/lib/ai/errors";

const api = (statusCode: number, responseBody: string) =>
  new APICallError({ message: "failed", url: "https://x", requestBodyValues: {}, statusCode, responseBody });

describe("classifyAiError", () => {
  it("maps rejected keys, for both providers", () => {
    expect(classifyAiError(api(401, '{"error":{"code":"invalid_api_key"}}'), "user").code).toBe("INVALID_KEY");
    expect(classifyAiError(api(400, '{"error":{"message":"API key not valid. Please pass a valid API key."}}'), "user").code).toBe("INVALID_KEY");
    expect(classifyAiError(api(403, "PERMISSION_DENIED"), "user").code).toBe("INVALID_KEY");
  });

  it("tells quota apart from a plain rate limit", () => {
    expect(classifyAiError(api(429, '{"error":{"code":"insufficient_quota"}}'), "user").code).toBe("QUOTA");
    expect(classifyAiError(api(429, '{"status":"RESOURCE_EXHAUSTED"}'), "user").code).toBe("QUOTA");
    const rate = classifyAiError(api(429, "Rate limit reached, slow down"), "user");
    expect(rate.code).toBe("RATE_LIMIT");
    expect(rate.retryable).toBe(true);
  });

  it("names an unknown model", () => {
    const e = classifyAiError(api(404, "The model `gpt-9` does not exist"), "user", "gpt-9");
    expect(e.code).toBe("BAD_MODEL");
    expect(e.message).toContain("gpt-9");
  });

  it("unwraps the SDK's retry wrapper", () => {
    const wrapped = new RetryError({ message: "retries", reason: "maxRetriesExceeded", errors: [api(401, "bad")] });
    expect(classifyAiError(wrapped, "user").code).toBe("INVALID_KEY");
  });

  it("blames the app, not the user, when the shared key fails", () => {
    expect(classifyAiError(api(401, "bad"), "platform").code).toBe("PLATFORM_LIMIT");
    expect(classifyAiError(api(429, "insufficient_quota"), "platform").code).toBe("PLATFORM_LIMIT");
    // a transient rate limit stays transient
    expect(classifyAiError(api(429, "slow down"), "platform").code).toBe("RATE_LIMIT");
  });

  it("treats the rest as retryable unknowns, and never leaks a key", () => {
    const e = classifyAiError(api(500, "boom sk-proj-abcdefghijklmnop1234"), "user");
    expect(e.code).toBe("UNKNOWN");
    expect(e.retryable).toBe(true);
    expect(e.message).not.toMatch(/sk-/);
  });

  it("passes AiKeyError through and flags which codes the user must fix", () => {
    const own = new AiKeyError("NO_KEY", "x");
    expect(classifyAiError(own, "user")).toBe(own);
    expect(isKeyProblem("INVALID_KEY")).toBe(true);
    expect(isKeyProblem("RATE_LIMIT")).toBe(false);
    expect(isKeyProblem("UNKNOWN")).toBe(false);
  });
});
