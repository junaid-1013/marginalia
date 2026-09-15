import { z } from "zod";

import { describePlatform, getEffectiveSettings, processingReadiness } from "@/lib/ai/credentials";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "@/lib/ai/providers";
import { errorResponse, limitUser, parseBody, requireUserId } from "@/lib/api-guard";
import { isEncryptionConfigured } from "@/lib/crypto";
import { getPublicState, saveSettings } from "@/services/db/ai";

export const dynamic = "force-dynamic";

/** Everything the settings screen needs. Contains no key and no ciphertext, only the last four characters. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const [state, effective, platform, readiness] = await Promise.all([
      getPublicState(userId),
      getEffectiveSettings(userId),
      describePlatform(userId),
      processingReadiness(userId),
    ]);
    return Response.json(
      {
        encryptionConfigured: isEncryptionConfigured(),
        settings: effective,
        customized: !!state.settings,
        keys: state.keys,
        platform,
        // can a new document be processed right now, and if not, why
        readiness,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return errorResponse(e, "Failed to load AI settings");
  }
}

const provider = z.enum(PROVIDER_IDS as [ProviderId, ...ProviderId[]]);
const model = z.string().trim().min(1).max(80).regex(/^[\w.\-:/]+$/, "Use only letters, numbers and . - _ : /");

const bodySchema = z
  .object({ chatProvider: provider, chatModel: model, embedProvider: provider, embedModel: model })
  // embeddings must come from a model that can produce the size of our vector column
  .refine((b) => PROVIDERS[b.embedProvider].embedModels.includes(b.embedModel), {
    message: "Choose one of the supported embedding models",
    path: ["embedModel"],
  });

export async function PUT(req: Request) {
  try {
    const userId = await requireUserId();
    limitUser(userId, "ai-settings", 20);
    const body = await parseBody(req, bodySchema);
    await saveSettings(userId, body);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to save AI settings");
  }
}
