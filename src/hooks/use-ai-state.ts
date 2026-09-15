"use client";

import { useQuery } from "@tanstack/react-query";

import type { ProviderId } from "@/lib/ai/providers";

export interface IAiState {
  encryptionConfigured: boolean;
  settings: { chatProvider: ProviderId; chatModel: string; embedProvider: ProviderId; embedModel: string };
  customized: boolean;
  keys: { provider: ProviderId; last4: string; validatedAt: string | null }[];
  platform:
    | { available: false }
    | { available: true; provider: ProviderId; freeDocumentsLeft: number | null; freeActionsLeftToday: number | null };
  /** can a new document be processed right now, and if not, why */
  readiness: { ok: true } | { ok: false; code: string; message: string };
}

export const AI_STATE_KEY = ["ai-state"] as const;

export const useAiState = () =>
  useQuery({
    queryKey: AI_STATE_KEY,
    queryFn: async (): Promise<IAiState> => {
      const response = await fetch("/api/ai-settings");
      if (!response.ok) throw new Error("Failed to load AI settings");
      return response.json();
    },
    staleTime: 30_000,
  });

/** Opens the AI settings dialog from anywhere (the dialog lives in the app layout). */
export const openAiSettings = () => window.dispatchEvent(new Event("marginalia:open-ai-settings"));
