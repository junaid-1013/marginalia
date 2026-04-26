interface IPayload {
  pdfStoragePath: string;
  collectionName: string;
}

export const processDocumentAPI = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/process-document", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to process document");
    }
    const collection = await response.json();
    return collection;
  } catch (e) {
    console.error("Error processing document:", { e });
    throw new Error("Failed to process document");
  }
};
