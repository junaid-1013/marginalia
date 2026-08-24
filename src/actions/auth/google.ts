"use server";

import { signIn } from "@/auth";
import { googleEnabled } from "@/auth.config";
import { DEFAULT_REDIRECT_URL } from "@/lib/routes";

export const signInWithGoogle = async () => {
  if (!googleEnabled) return;
  await signIn("google", { redirectTo: DEFAULT_REDIRECT_URL });
};
