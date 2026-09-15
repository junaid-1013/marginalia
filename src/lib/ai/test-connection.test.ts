import { APICallError } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateText = vi.fn();
const embed = vi.fn();
vi.mock("ai", async (orig) => ({ ...(await orig<typeof import("ai")>()), generateText: (a: unknown) => generateText(a), embed: (a: unknown) => embed(a) }));
vi.mock("@/lib/ai/provider", () => ({ buildChatModel: () => "chat", buildEmbeddingModel: () => "embed" }));

import { testConnection } from "@/lib/ai/test-connection";

const args = { provider: "OPENAI" as const, apiKey: "sk-test-1234567890abcdef", chatModel: "gpt-4o-mini", embedModel: "text-embedding-3-small" };
const api = (statusCode: number, responseBody = "") => new APICallError({ message: "x", url: "u", requestBodyValues: {}, statusCode, responseBody });

describe("testConnection", () => {
  beforeEach(() => {
    generateText.mockReset().mockResolvedValue({ text: "ok" });
    embed.mockReset().mockResolvedValue({ embedding: new Array(1536).fill(0.1) });
  });

  it("passes when chat works and embeddings have the right size", async () => {
    await expect(testConnection(args)).resolves.toEqual({ dimensions: 1536 });
  });

  it("reports a rejected key from the chat call", async () => {
    generateText.mockRejectedValue(api(401, "invalid_api_key"));
    await expect(testConnection(args)).rejects.toMatchObject({ code: "INVALID_KEY" });
    expect(embed).not.toHaveBeenCalled();
  });

  it("reports an unknown embedding model", async () => {
    embed.mockRejectedValue(api(404, "model not found"));
    await expect(testConnection(args)).rejects.toMatchObject({ code: "BAD_MODEL" });
  });

  it("rejects an embedding model with the wrong dimensions", async () => {
    embed.mockResolvedValue({ embedding: new Array(768).fill(0.1) });
    const e = await testConnection(args).catch((x) => x);
    expect(e.code).toBe("BAD_MODEL");
    expect(e.message).toMatch(/768/);
    expect(e.message).toMatch(/1536/);
  });

  it("never retries: a test must be one cheap call", async () => {
    await testConnection(args);
    expect(generateText.mock.calls[0][0].maxRetries).toBe(0);
    expect(embed.mock.calls[0][0].maxRetries).toBe(0);
  });
});
