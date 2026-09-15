"use client";

import { toast } from "sonner";

import { ApiClientError } from "@/apis/errors";
import { isKeyCode } from "@/components/ai/key-needed";
import { openAiSettings } from "@/hooks/use-ai-state";

/** A failed AI action: a key problem points to the settings, anything else gets the generic message. */
export const reportAiError = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError && isKeyCode(error.code)) {
    toast.error(error.message, { action: { label: "AI settings", onClick: openAiSettings } });
  } else {
    toast.error(fallback);
  }
};
