import { z } from "zod";

import { AiKeyError } from "@/lib/ai/errors";
import { PROVIDERS, PROVIDER_IDS, looksLikeKey, type ProviderId } from "@/lib/ai/providers";
import { testConnection } from "@/lib/ai/test-connection";
import { ApiError, errorResponse, limitUser, parseBody, parseQuery, requireUserId } from "@/lib/api-guard";
import { isEncryptionConfigured } from "@/lib/crypto";
import { deleteKey, getSettings, saveKey, saveSettings } from "@/services/db/ai";

const provider = z.enum(PROVIDER_IDS as [ProviderId, ...ProviderId[]]);

const putSchema = z.object({
  provider,
  apiKey: z.string().trim().min(1).max(300),
  // the models the key will be used with: it is tested against exactly these
  chatModel: z.string().trim().min(1).max(80).regex(/^[\w.\-:/]+$/).optional(),
  embedModel: z.string().trim().min(1).max(80).regex(/^[\w.\-:/]+$/).optional(),
});

/** Saves a key, but only after the provider has accepted it. The key is encrypted and never returned. */
export async function PUT(req: Request) {
  try {
    const userId = await requireUserId();
    limitUser(userId, "ai-key", 10);
    const body = await parseBody(req, putSchema);

    if (!isEncryptionConfigured()) {
      throw new ApiError(503, "Saving keys is not set up on this server (KEY_ENCRYPTION_SECRET is missing).");
    }
    if (!looksLikeKey(body.provider, body.apiKey)) {
      throw new ApiError(400, `That does not look like a ${PROVIDERS[body.provider].label} key (${PROVIDERS[body.provider].keyExample}).`);
    }

    const info = PROVIDERS[body.provider];
    const settings = await getSettings(userId);
    const chatModel = body.chatModel ?? (settings?.chatProvider === body.provider ? settings.chatModel : info.defaultChat);
    const embedModel = body.embedModel ?? (settings?.embedProvider === body.provider ? settings.embedModel : info.defaultEmbed);

    try {
      await testConnection({ provider: body.provider, apiKey: body.apiKey, chatModel, embedModel });
    } catch (e) {
      if (e instanceof AiKeyError) return Response.json({ ok: false, code: e.code, error: e.message }, { status: 422 });
      throw e;
    }

    await saveKey(userId, body.provider, body.apiKey, true);
    // the first key a person adds also decides what they use, so it works straight away
    if (!settings) {
      await saveSettings(userId, {
        chatProvider: body.provider,
        chatModel,
        embedProvider: body.provider,
        embedModel,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to save the key");
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await requireUserId();
    limitUser(userId, "ai-key", 10);
    const { provider: p } = parseQuery(req, z.object({ provider }));
    await deleteKey(userId, p);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to remove the key");
  }
}
