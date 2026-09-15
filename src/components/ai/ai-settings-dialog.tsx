"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AI_STATE_KEY, useAiState, type IAiState } from "@/hooks/use-ai-state";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "@/lib/ai/providers";

type Busy = "idle" | "testing" | "saving";
interface IMessage {
  ok: boolean;
  text: string;
}

const post = async (url: string, method: string, body?: unknown) => {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string } };
};

const ProviderSelect = ({
  id,
  value,
  onChange,
}: {
  id: string;
  value: ProviderId;
  onChange: (v: ProviderId) => void;
}) => (
  <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value as ProviderId)}>
    {PROVIDER_IDS.map((p) => (
      <option key={p} value={p}>
        {PROVIDERS[p].label}
      </option>
    ))}
  </NativeSelect>
);

export const AiSettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const queryClient = useQueryClient();
  const { data: state } = useAiState();

  const [chatProvider, setChatProvider] = useState<ProviderId>("OPENAI");
  const [chatModel, setChatModel] = useState("");
  const [embedProvider, setEmbedProvider] = useState<ProviderId>("OPENAI");
  const [embedModel, setEmbedModel] = useState("");
  const [typed, setTyped] = useState<Partial<Record<ProviderId, string>>>({});
  const [shown, setShown] = useState<Partial<Record<ProviderId, boolean>>>({});
  const [messages, setMessages] = useState<Partial<Record<ProviderId, IMessage>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>("idle");

  // start from what is saved each time the dialog opens, and never keep typed keys around
  useEffect(() => {
    if (!open || !state) return;
    setChatProvider(state.settings.chatProvider);
    setChatModel(state.settings.chatModel);
    setEmbedProvider(state.settings.embedProvider);
    setEmbedModel(state.settings.embedModel);
    setTyped({});
    setShown({});
    setMessages({});
    setFormError(null);
  }, [open, state]);

  const providersInUse = useMemo(
    () => Array.from(new Set<ProviderId>([chatProvider, embedProvider])),
    [chatProvider, embedProvider]
  );
  const saved = (p: ProviderId) => state?.keys.find((k) => k.provider === p);
  const canStoreKeys = state?.encryptionConfigured !== false;

  // choosing another provider also moves the model to a sensible one for it
  const pickChatProvider = (p: ProviderId) => {
    setChatProvider(p);
    setChatModel(PROVIDERS[p].defaultChat);
  };
  const pickEmbedProvider = (p: ProviderId) => {
    setEmbedProvider(p);
    setEmbedModel(PROVIDERS[p].defaultEmbed);
  };

  const modelsFor = (p: ProviderId) => ({
    chat: p === chatProvider ? chatModel : PROVIDERS[p].defaultChat,
    embed: p === embedProvider ? embedModel : PROVIDERS[p].defaultEmbed,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: AI_STATE_KEY });
    queryClient.invalidateQueries({ queryKey: ["status"] });
  };

  const test = async () => {
    setBusy("testing");
    setFormError(null);
    const next: Partial<Record<ProviderId, IMessage>> = {};
    for (const p of providersInUse) {
      if (!typed[p] && !saved(p)) {
        next[p] = { ok: false, text: `Enter your ${PROVIDERS[p].label} key to test it.` };
        continue;
      }
      const m = modelsFor(p);
      const { data } = await post("/api/ai-settings/test", "POST", {
        provider: p,
        apiKey: typed[p] || undefined,
        chatModel: m.chat,
        embedModel: m.embed,
      });
      next[p] = data.ok
        ? { ok: true, text: "The key works for chat and for document search." }
        : { ok: false, text: data.error ?? "The test did not pass." };
    }
    setMessages(next);
    setBusy("idle");
  };

  const save = async () => {
    setBusy("saving");
    setFormError(null);
    setMessages({});
    try {
      const settings = await post("/api/ai-settings", "PUT", { chatProvider, chatModel, embedProvider, embedModel });
      if (!settings.response.ok) {
        setFormError(settings.data.error ?? "The settings could not be saved.");
        return;
      }
      // a typed key is checked with the provider first, and only saved if it works
      for (const p of providersInUse) {
        const key = typed[p]?.trim();
        if (!key) continue;
        const m = modelsFor(p);
        const result = await post("/api/ai-settings/key", "PUT", { provider: p, apiKey: key, chatModel: m.chat, embedModel: m.embed });
        if (!result.response.ok) {
          setMessages({ [p]: { ok: false, text: result.data.error ?? "The key could not be saved." } });
          refresh();
          return;
        }
      }
      refresh();
      toast.success("AI settings saved.");
      onOpenChange(false);
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy("idle");
    }
  };

  const remove = async (p: ProviderId) => {
    const { response } = await post(`/api/ai-settings/key?provider=${p}`, "DELETE");
    if (response.ok) {
      toast.success(`${PROVIDERS[p].label} key removed.`);
      refresh();
    } else toast.error("The key could not be removed. Try again.");
  };

  const platform: IAiState["platform"] | undefined = state?.platform;
  const isBusy = busy !== "idle";

  return (
    <Dialog open={open} onOpenChange={(o) => !isBusy && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI settings</DialogTitle>
          <DialogDescription>
            Marginalia uses an AI provider to read your documents and answer questions. Use your own key, so it is
            never limited by ours.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {platform?.available && (
            <Alert>
              <AlertDescription className="space-y-1">
                <p>
                  Until you add a key, Marginalia&apos;s shared key is used within a small allowance
                  {platform.freeDocumentsLeft !== null && <> ({platform.freeDocumentsLeft} documents left)</>}
                  {platform.freeActionsLeftToday !== null && <> ({platform.freeActionsLeftToday} AI actions left today)</>}.
                  When it runs out you will be asked to add your own.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <section className="space-y-3">
            <h3 className="text-heading text-base">Chat, summaries and quizzes</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="chat-provider">Provider</Label>
                <ProviderSelect id="chat-provider" value={chatProvider} onChange={pickChatProvider} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chat-model">Model</Label>
                <Input
                  id="chat-model"
                  list="chat-models"
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <datalist id="chat-models">
                  {PROVIDERS[chatProvider].chatModels.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
            <p className="text-caption">e.g. {PROVIDERS[chatProvider].chatModels.join(", ")}. Any model your key can use works.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-heading text-base">Document search (embeddings)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="embed-provider">Provider</Label>
                <ProviderSelect id="embed-provider" value={embedProvider} onChange={pickEmbedProvider} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="embed-model">Model</Label>
                <NativeSelect id="embed-model" value={embedModel} onChange={(e) => setEmbedModel(e.target.value)}>
                  {PROVIDERS[embedProvider].embedModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <p className="text-caption">
              A document is searched with the model that indexed it. Switching later keeps old documents working as long
              as you keep a key for their provider, or you can re-index them.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-heading text-base">{providersInUse.length > 1 ? "API keys" : "API key"}</h3>
            {providersInUse.map((p) => {
              const info = PROVIDERS[p];
              const existing = saved(p);
              const message = messages[p];
              return (
                <div key={p} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={`key-${p}`}>
                      {info.label} key{providersInUse.length === 1 ? " (used for chat and search)" : ""}
                    </Label>
                    {existing && (
                      <Badge variant="success" dot>
                        Saved ...{existing.last4}
                      </Badge>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id={`key-${p}`}
                      type={shown[p] ? "text" : "password"}
                      value={typed[p] ?? ""}
                      onChange={(e) => setTyped((t) => ({ ...t, [p]: e.target.value }))}
                      placeholder={existing ? "Enter a new key to replace the saved one" : info.keyExample}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={!canStoreKeys}
                      className="pr-10"
                      aria-describedby={`key-help-${p}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShown((s) => ({ ...s, [p]: !s[p] }))}
                      aria-label={shown[p] ? "Hide the key" : "Show the key"}
                      className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {shown[p] ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <p id={`key-help-${p}`} className="text-caption">
                    <a href={info.keyUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-highlight decoration-2 underline-offset-4">
                      Get a {info.label} key
                    </a>
                    {info.note && <> . {info.note}</>}
                    {existing && (
                      <>
                        {" "}
                        .{" "}
                        <button type="button" onClick={() => remove(p)} className="underline underline-offset-4 hover:text-destructive">
                          Remove the saved key
                        </button>
                      </>
                    )}
                  </p>
                  {message && (
                    <p className={`flex items-start gap-1.5 text-sm ${message.ok ? "text-success" : "text-destructive"}`} role={message.ok ? "status" : "alert"}>
                      {message.ok && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                      {message.text}
                    </p>
                  )}
                </div>
              );
            })}
            {!canStoreKeys && (
              <p className="text-sm text-destructive" role="alert">
                Saving keys is not set up on this server yet.
              </p>
            )}
          </section>

          <p className="text-caption">
            Your key is encrypted and stored for your account only. It is used only to process your documents, is never
            shown again, and you can remove it at any time.{" "}
            <Link href="/privacy" target="_blank" className="underline decoration-highlight decoration-2 underline-offset-4">
              Read the privacy notice
            </Link>
            .
          </p>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={test} disabled={isBusy || !canStoreKeys}>
            {busy === "testing" && <LoaderIcon className="h-4 w-4 animate-spin" />}
            Test connection
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isBusy}>
            {busy === "saving" && <LoaderIcon className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
