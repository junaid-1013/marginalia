import { z } from "zod";

import { auth } from "@/auth";
import { getUserChat } from "@/services/db/chat";
import { AiKeyError, classifyAiError, isKeyProblem } from "@/lib/ai/errors";
import { errorFields, logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Returns the logged in user's id, or throws a 401. */
export const requireUserId = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  return userId;
};

/**
 * Returns the chat only if it belongs to the logged in user.
 * A chat owned by someone else is reported as 404 so ids cannot be probed.
 */
export const requireOwnedChat = async (chatId: string) => {
  const userId = await requireUserId();
  const chat = await getUserChat(chatId, userId);
  if (!chat) throw new ApiError(404, "Chat not found");
  return { userId, chat };
};

/** Throws a 429 when the user went over `limit` calls per `windowMs` for `key`. */
export const limitUser = (
  userId: string,
  key: string,
  limit: number,
  windowMs = 60_000
) => {
  if (!rateLimit(`${key}:${userId}`, limit, windowMs)) {
    throw new ApiError(429, "Too many requests, please slow down");
  }
};

/** Parses the JSON body with a zod schema, throws a 400 when it does not match. */
export const parseBody = async <T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<z.infer<T>> => {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError(400, "Invalid request body");
  return parsed.data;
};

/** Parses the query string with a zod schema, throws a 400 when it does not match. */
export const parseQuery = <T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): z.infer<T> => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new ApiError(400, "Invalid query");
  return parsed.data;
};

/** Turns anything thrown inside a route into a JSON error response. */
export const errorResponse = (e: unknown, fallback = "Something went wrong") => {
  if (e instanceof ApiError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  // a missing, rejected or used-up AI key: 402, with a code the UI turns into "Add your key"
  if (e instanceof AiKeyError && isKeyProblem(e.code)) {
    return Response.json({ error: e.message, code: e.code }, { status: 402 });
  }
  logger.error("unhandled route error", errorFields(e));
  return Response.json({ error: fallback }, { status: 500 });
};
