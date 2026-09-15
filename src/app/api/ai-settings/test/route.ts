import { z } from "zod";

import { AiKeyError } from "@/lib/ai/errors";
import { PROVIDERS, PROVIDER_IDS, looksLikeKey, type ProviderId } from "@/lib/ai/providers";
import { testConnection } from "@/lib/ai/test-connection";
import { ApiError, errorResponse, limitUser, parseBody, requireUserId } from "@/lib/api-guard";
import { getUserKey } from "@/services/db/ai";

const bodySchema = z.object({
  provider: z.enum(PROVIDER_IDS as [ProviderId, ...ProviderId[]]),
  // omitted: test the key that is already saved
  apiKey: z.string().trim().min(1).max(300).optional(),
  chatModel: z.string().trim().min(1).max(80).regex(/^[\w.\-:/]+$/),
  embedModel: z.string().trim().min(1).max(80).regex(/^[\w.\-:/]+$/),
});

/** "Test connection": a real, tiny call with the key and models in the form. Nothing is saved. */
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    limitUser(userId, "ai-test", 10);
    const body = await parseBody(req, bodySchema);

    const apiKey = body.apiKey ?? (await getUserKey(userId, body.provider));
    if (!apiKey) throw new ApiError(400, `Enter your ${PROVIDERS[body.provider].label} key first.`);
    if (body.apiKey && !looksLikeKey(body.provider, body.apiKey)) {
      throw new ApiError(400, `That does not look like a ${PROVIDERS[body.provider].label} key (${PROVIDERS[body.provider].keyExample}).`);
    }

    const result = await testConnection({ ...body, apiKey });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof AiKeyError) return Response.json({ ok: false, code: e.code, error: e.message }, { status: 200 });
    return errorResponse(e, "The connection test failed");
  }
}
