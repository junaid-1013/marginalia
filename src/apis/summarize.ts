import { ApiClientError, ensureOk } from "@/apis/errors";

interface IPayload {
  chatId: string;
}

export const summarize = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await ensureOk(response, "Failed to summarize");
    return await response.json();
  } catch (e) {
    if (e instanceof ApiClientError) throw e;
    throw new Error("Failed to summarize");
  }
};
