/** An API failure that kept the server's message and its machine readable code (for example NO_KEY). */
export class ApiClientError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** Throws an ApiClientError built from a failed response, or returns the response when it is fine. */
export const ensureOk = async (response: Response, fallback: string) => {
  if (response.ok) return response;
  const body = (await response.json().catch(() => null)) as { error?: string; code?: string } | null;
  throw new ApiClientError(body?.error ?? fallback, body?.code, response.status);
};
