import { APICallError, RetryError } from "ai";

import { redactSecrets } from "@/lib/crypto";

export type AiErrorCode =
  | "NO_KEY" // nothing to call the provider with
  | "INVALID_KEY" // the provider rejected the key
  | "QUOTA" // the key is out of credit or quota
  | "PLATFORM_LIMIT" // the shared allowance is used up, or the shared key stopped working
  | "BAD_MODEL" // the provider does not know that model
  | "RATE_LIMIT" // temporary: try again shortly
  | "UNKNOWN";

/** An AI failure that has been turned into something a person can act on. */
export class AiKeyError extends Error {
  constructor(public code: AiErrorCode, message: string, public retryable = false) {
    super(message);
    this.name = "AiKeyError";
  }
}

/** Failures the user has to fix themselves: retrying the same call cannot help. */
export const isKeyProblem = (code: AiErrorCode) =>
  code === "NO_KEY" || code === "INVALID_KEY" || code === "QUOTA" || code === "PLATFORM_LIMIT" || code === "BAD_MODEL";

const MESSAGES: Record<Exclude<AiErrorCode, "BAD_MODEL" | "UNKNOWN">, string> = {
  NO_KEY: "Add your own AI key in AI settings to use this feature.",
  INVALID_KEY: "Your API key was rejected by the provider. Check or replace it in AI settings.",
  QUOTA: "Your provider says this key is out of quota or credit.",
  PLATFORM_LIMIT: "The shared AI allowance is used up right now. Add your own key in AI settings to continue.",
  RATE_LIMIT: "The provider is rate limiting requests. Try again in a moment.",
};

const unwrap = (e: unknown): unknown => {
  if (RetryError.isInstance(e)) return e.lastError ?? e;
  return e;
};

/**
 * Maps whatever the AI SDK or the provider threw to a code and a safe message.
 * `source` says whose key was used: a rejected or exhausted shared key is not the user's mistake.
 */
export const classifyAiError = (error: unknown, source: "user" | "platform", model?: string): AiKeyError => {
  if (error instanceof AiKeyError) return error;
  const e = unwrap(error);

  const status = APICallError.isInstance(e) ? e.statusCode : (e as { status?: number })?.status;
  const body = redactSecrets(
    `${APICallError.isInstance(e) ? e.responseBody ?? "" : ""} ${e instanceof Error ? e.message : ""}`
  );

  let code: AiErrorCode = "UNKNOWN";
  if (status === 401 || status === 403 || /api key not valid|invalid_api_key|incorrect api key|api_key_invalid|permission_denied/i.test(body)) {
    code = "INVALID_KEY";
  } else if (status === 429 && /insufficient_quota|quota|resource_exhausted|billing|exceeded your current/i.test(body)) {
    code = "QUOTA";
  } else if (status === 429) {
    code = "RATE_LIMIT";
  } else if (status === 404 || /model.{0,40}(not found|does not exist|not supported)|is not found for api version/i.test(body)) {
    code = "BAD_MODEL";
  }

  // the shared key failing is the app's problem: point the person at their own key
  if (source === "platform" && (code === "INVALID_KEY" || code === "QUOTA")) code = "PLATFORM_LIMIT";

  if (code === "BAD_MODEL") {
    return new AiKeyError(code, `The provider does not know the model${model ? ` "${model}"` : ""}. Choose another in AI settings.`);
  }
  if (code === "UNKNOWN") {
    return new AiKeyError(code, "The AI provider returned an error. Try again in a moment.", true);
  }
  return new AiKeyError(code, MESSAGES[code], code === "RATE_LIMIT");
};

export const noKeyError = () => new AiKeyError("NO_KEY", MESSAGES.NO_KEY);
export const platformLimitError = (detail?: string) =>
  new AiKeyError("PLATFORM_LIMIT", detail ? `${detail} Add your own key in AI settings to continue.` : MESSAGES.PLATFORM_LIMIT);
