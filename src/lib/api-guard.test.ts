import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const auth = vi.fn();
const getUserChat = vi.fn();
vi.mock("@/auth", () => ({ auth: () => auth() }));
vi.mock("@/services/db/chat", () => ({
  getUserChat: (...a: unknown[]) => getUserChat(...a),
}));

import {
  ApiError,
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
  requireUserId,
} from "@/lib/api-guard";

describe("requireUserId", () => {
  it("throws 401 without a session", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUserId()).rejects.toMatchObject({ status: 401 });
  });
  it("returns the session user id", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    await expect(requireUserId()).resolves.toBe("u1");
  });
});

describe("requireOwnedChat", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    getUserChat.mockReset();
  });

  it("looks the chat up scoped to the session user", async () => {
    getUserChat.mockResolvedValue({ id: "c1" });
    await requireOwnedChat("c1");
    expect(getUserChat).toHaveBeenCalledWith("c1", "u1");
  });

  it("reports somebody else's chat as 404, not 403", async () => {
    getUserChat.mockResolvedValue(null);
    await expect(requireOwnedChat("c-of-other-user")).rejects.toMatchObject({ status: 404 });
  });
});

describe("parseBody", () => {
  const schema = z.object({ chatId: z.string().min(1) });
  const req = (body: string) => new Request("http://x.test", { method: "POST", body });

  it("returns parsed data", async () => {
    await expect(parseBody(req('{"chatId":"a"}'), schema)).resolves.toEqual({ chatId: "a" });
  });
  it("throws 400 on invalid json or shape", async () => {
    await expect(parseBody(req("not json"), schema)).rejects.toMatchObject({ status: 400 });
    await expect(parseBody(req('{"chatId":1}'), schema)).rejects.toMatchObject({ status: 400 });
  });
});

describe("limitUser / errorResponse", () => {
  it("throws 429 once the limit is hit", () => {
    limitUser("u-limit", "k", 1);
    expect(() => limitUser("u-limit", "k", 1)).toThrowError(ApiError);
  });

  it("maps ApiError to its status and hides unknown errors", async () => {
    const known = errorResponse(new ApiError(404, "Chat not found"));
    expect(known.status).toBe(404);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const unknown = errorResponse(new Error("db password leaked"), "Failed");
    expect(unknown.status).toBe(500);
    expect(JSON.stringify(await unknown.json())).not.toContain("leaked");
    spy.mockRestore();
  });
});
