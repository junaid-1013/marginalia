"use client";

import { KeyRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { openAiSettings } from "@/hooks/use-ai-state";

const TITLES: Record<string, string> = {
  NO_KEY: "Add your AI key",
  INVALID_KEY: "Your key was rejected",
  QUOTA: "Your key is out of credit",
  PLATFORM_LIMIT: "The shared allowance is used up",
  BAD_MODEL: "That model is not available",
};

/** The codes that mean "the person has to do something about their key". */
export const isKeyCode = (code?: string | null): code is string => !!code && code in TITLES;

/** What to show when an AI call fails because of the key: say why, and open the settings in one click. */
export const KeyNeeded = ({ code, message, className }: { code: string; message?: string; className?: string }) => (
  <Alert className={className}>
    <KeyRoundIcon className="h-4 w-4" />
    <AlertTitle>{TITLES[code] ?? "AI settings need attention"}</AlertTitle>
    <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
      <span>{message ?? "Add or update your AI key to continue."}</span>
      <Button size="sm" onClick={openAiSettings}>
        Open AI settings
      </Button>
    </AlertDescription>
  </Alert>
);

/** The AI SDK hands a failed chat request's body over as the error message: pull the code out of it. */
export const parseAiError = (raw?: string | null): { code: string; message: string } | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { code?: string; message?: string; error?: string };
    return isKeyCode(parsed.code) ? { code: parsed.code, message: parsed.message ?? parsed.error ?? "" } : null;
  } catch {
    return null;
  }
};
