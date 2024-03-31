import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT } from "@/constants";

export const qdClient = new QdrantClient({
  url: QDRANT.url,
  apiKey: QDRANT.apiKey,
});
