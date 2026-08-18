import { EventSchemas, Inngest } from "inngest";

type Events = {
  /** a PDF was uploaded (or re-processing was requested): parse, index, then fan out */
  "document/uploaded": { data: { chatId: string } };
  "document/summarize": { data: { chatId: string } };
  "document/flashcards": { data: { chatId: string } };
};

export const inngest = new Inngest({
  id: "innovated",
  schemas: new EventSchemas().fromRecord<Events>(),
});
