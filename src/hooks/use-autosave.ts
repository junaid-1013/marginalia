"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "unsaved" | "saving" | "saved" | "error";

/**
 * Debounced autosave. `schedule(value)` on every change; the latest value is
 * saved after `delay` ms of quiet, on unmount, and (through `onLeave`) when the
 * tab is closed. A failed save keeps the value so Retry can send it again.
 */
export const useAutosave = ({
  save,
  onLeave,
  delay = 1000,
}: {
  save: (value: string) => Promise<void>;
  /** called with unsaved content when the page is being closed: use a keepalive request */
  onLeave?: (value: string) => void;
  delay?: number;
}) => {
  const [state, setState] = useState<AutosaveState>("idle");
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const saving = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (saving.current || pending.current === null) return;
    const value = pending.current;
    pending.current = null;
    saving.current = true;
    setState("saving");
    let failed = false;
    try {
      await saveRef.current(value);
    } catch {
      failed = true;
      pending.current ??= value; // keep it for Retry, unless something newer arrived
    } finally {
      saving.current = false;
    }
    if (failed) setState("error");
    else if (pending.current !== null) {
      // edited again while saving
      setState("unsaved");
      timer.current = setTimeout(flush, delay);
    } else setState("saved");
  }, [delay]);

  const schedule = useCallback(
    (value: string) => {
      pending.current = value;
      setState("unsaved");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush]
  );

  useEffect(() => {
    const leave = () => {
      if (pending.current !== null) onLeave?.(pending.current);
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      // navigating to another tool of the workspace
      void flush();
    };
  }, [flush, onLeave]);

  return { state, schedule, retry: flush };
};
