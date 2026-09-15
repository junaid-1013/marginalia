"use client";

import { useEffect, useState } from "react";

import { AiSettingsDialog } from "@/components/ai/ai-settings-dialog";

/** Mounted once in the app layout: anything can open the dialog with openAiSettings(). */
export const AiSettingsHost = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("marginalia:open-ai-settings", show);
    return () => window.removeEventListener("marginalia:open-ai-settings", show);
  }, []);

  return <AiSettingsDialog open={open} onOpenChange={setOpen} />;
};
