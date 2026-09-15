import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Encryption for user supplied API keys.
 *
 * AES-256-GCM with a master key from the environment (never stored in the
 * database or the repository). The user id is bound in as additional
 * authenticated data, so a ciphertext copied onto another user's row cannot be
 * decrypted. Stored format: "v<version>.<iv>.<tag>.<ciphertext>" (base64url).
 *
 * Rotation: set the new key as KEY_ENCRYPTION_SECRET and KEY_ENCRYPTION_VERSION
 * to the next number, and keep the old one as KEY_ENCRYPTION_SECRET_V<old>
 * until every row has been re-encrypted.
 */

const ALGORITHM = "aes-256-gcm";

export class CryptoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptoConfigError";
  }
}

export const currentKeyVersion = () => {
  const v = Number(process.env.KEY_ENCRYPTION_VERSION ?? 1);
  return Number.isInteger(v) && v > 0 ? v : 1;
};

const masterKey = (version: number) => {
  // the current version lives in KEY_ENCRYPTION_SECRET, older ones in KEY_ENCRYPTION_SECRET_V<n>
  const raw =
    version === currentKeyVersion()
      ? process.env.KEY_ENCRYPTION_SECRET
      : process.env[`KEY_ENCRYPTION_SECRET_V${version}`];
  if (!raw) throw new CryptoConfigError("KEY_ENCRYPTION_SECRET is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new CryptoConfigError("KEY_ENCRYPTION_SECRET must be 32 random bytes, base64 encoded");
  }
  return key;
};

/** True when the server can store user keys at all. */
export const isEncryptionConfigured = () => {
  try {
    masterKey(currentKeyVersion());
    return true;
  } catch {
    return false;
  }
};

export const encryptSecret = (plaintext: string, aad: string) => {
  const version = currentKeyVersion();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, masterKey(version), iv);
  cipher.setAAD(Buffer.from(aad));
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: ["v" + version, iv, tag, data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join("."),
    keyVersion: version,
  };
};

export const decryptSecret = (stored: string, aad: string) => {
  const [v, iv, tag, data] = stored.split(".");
  const version = Number(v?.slice(1));
  if (!v?.startsWith("v") || !Number.isInteger(version) || !iv || !tag || !data) {
    throw new Error("Malformed ciphertext");
  }
  const decipher = createDecipheriv(ALGORITHM, masterKey(version), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  // throws if the data, the tag or the user id do not match
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
};

/** What the UI may show of a key: the last four characters. */
export const lastFour = (secret: string) => secret.trim().slice(-4);

// anything shaped like a provider key: OpenAI "sk-...", Google "AIza..."
const KEY_SHAPES = /\b(sk-[A-Za-z0-9_-]{8,}|AIza[0-9A-Za-z_-]{20,})\b/g;

/** Removes anything that looks like an API key from text that may be logged or shown. */
export const redactSecrets = (text: string) => text.replace(KEY_SHAPES, "[redacted key]");
