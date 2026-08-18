interface IPayload {
  chatId: string;
}

/** Asks the server to (re)run the processing pipeline. Returns immediately. */
export const processDocumentAPI = async (payload: IPayload) => {
  const response = await fetch("/api/process-document", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to start processing");
  }
  return response.json();
};
