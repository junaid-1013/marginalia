import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomBytes } from "crypto";

import {
  CryptoConfigError,
  decryptSecret,
  encryptSecret,
  isEncryptionConfigured,
  lastFour,
  redactSecrets,
} from "@/lib/crypto";

const b64 = () => randomBytes(32).toString("base64");
const original = { ...process.env };

describe("crypto", () => {
  beforeEach(() => {
    process.env.KEY_ENCRYPTION_SECRET = b64();
    delete process.env.KEY_ENCRYPTION_VERSION;
  });
  afterEach(() => {
    process.env = { ...original };
  });

  it("round trips a secret", () => {
    const { cipher } = encryptSecret("sk-test-123456789", "user-1");
    expect(cipher).not.toContain("sk-test");
    expect(decryptSecret(cipher, "user-1")).toBe("sk-test-123456789");
  });

  it("never produces the same ciphertext twice", () => {
    expect(encryptSecret("same", "u").cipher).not.toBe(encryptSecret("same", "u").cipher);
  });

  it("refuses a ciphertext moved to another user", () => {
    const { cipher } = encryptSecret("sk-secret-secret", "user-1");
    expect(() => decryptSecret(cipher, "user-2")).toThrow();
  });

  it("refuses tampered data", () => {
    const { cipher } = encryptSecret("sk-secret-secret", "user-1");
    const parts = cipher.split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");
    expect(() => decryptSecret(parts.join("."), "user-1")).toThrow();
  });

  it("rejects malformed input", () => {
    expect(() => decryptSecret("nonsense", "u")).toThrow("Malformed");
  });

  it("needs a valid master key", () => {
    delete process.env.KEY_ENCRYPTION_SECRET;
    expect(isEncryptionConfigured()).toBe(false);
    expect(() => encryptSecret("x", "u")).toThrow(CryptoConfigError);
    process.env.KEY_ENCRYPTION_SECRET = Buffer.from("too short").toString("base64");
    expect(isEncryptionConfigured()).toBe(false);
  });

  it("rotates: old ciphertext still opens with the old key kept as _V<n>", () => {
    const oldSecret = process.env.KEY_ENCRYPTION_SECRET!;
    const { cipher } = encryptSecret("sk-rotating-key", "u"); // version 1
    process.env.KEY_ENCRYPTION_SECRET = b64(); // new current key
    process.env.KEY_ENCRYPTION_VERSION = "2";
    expect(() => decryptSecret(cipher, "u")).toThrow(); // old key not kept yet
    process.env.KEY_ENCRYPTION_SECRET_V1 = oldSecret;
    expect(decryptSecret(cipher, "u")).toBe("sk-rotating-key");
    expect(encryptSecret("new", "u").cipher.startsWith("v2.")).toBe(true);
  });

  it("shows only the last four characters", () => {
    expect(lastFour("  sk-abcdef1234 ")).toBe("1234");
  });

  it("redacts anything shaped like a key", () => {
    expect(redactSecrets("401 for sk-proj-abcdEFGH12345678 and AIzaSyA1234567890abcdefghijk")).toBe(
      "401 for [redacted key] and [redacted key]"
    );
    expect(redactSecrets("nothing to hide")).toBe("nothing to hide");
  });
});
