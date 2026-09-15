// Minimal structured logger: one JSON line per event, which Vercel logs (and
// any log drain) can filter by level or field. Swap the body for pino/Sentry
// later without touching call sites.
import { redactSecrets } from "@/lib/crypto";

type Fields = Record<string, unknown>;

const write = (level: "info" | "warn" | "error", message: string, fields?: Fields) => {
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (message: string, fields?: Fields) => write("info", message, fields),
  warn: (message: string, fields?: Fields) => write("warn", message, fields),
  error: (message: string, fields?: Fields) => write("error", message, fields),
};

/** Error objects do not survive JSON.stringify, so flatten them. */
export const errorFields = (e: unknown): Fields =>
  e instanceof Error
    ? {
        error: redactSecrets(e.message),
        stack: redactSecrets(e.stack?.split("\n").slice(0, 5).join("\n") ?? ""),
      }
    : { error: redactSecrets(String(e)) };
