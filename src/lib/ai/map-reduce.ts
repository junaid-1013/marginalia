import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

import { createChatModel } from "@/lib/ai/models";

// The pipeline runs inside Inngest steps. Every LLM round trip is its own
// step, so no single serverless invocation has to survive the whole document
// and a failure only retries the step that failed.
// (loosely typed on purpose: Inngest's own step.run types are JSON-mapped generics)
interface IStepTools {
  run: (id: string, fn: () => Promise<any>) => Promise<any>;
}

export interface IMapReduceConfig<T extends z.ZodTypeAny> {
  /** step id prefix */
  name: string;
  mapPrompt: (text: string) => string;
  collapsePrompt: (text: string) => string;
  reducePrompt: (text: string, formatInstructions: string) => string;
  schema: T;
}

const GROUP_CHARS = 6000; // text per map call
const MAP_CONCURRENCY = 6; // map calls per step
const MAX_REDUCE_CHARS = 20000; // what the final call may receive
const MAX_COLLAPSE_ROUNDS = 5;

const toText = (content: unknown) =>
  typeof content === "string" ? content : JSON.stringify(content);

const groupBySize = (parts: string[], maxChars: number) => {
  const groups: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const part of parts) {
    if (size + part.length > maxChars && current.length > 0) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(part);
    size += part.length;
  }
  if (current.length > 0) groups.push(current);
  return groups;
};

export const mapReduce = async <T extends z.ZodTypeAny>({
  step,
  chunks,
  config,
}: {
  step: IStepTools;
  chunks: string[];
  config: IMapReduceConfig<T>;
}): Promise<z.infer<T>> => {
  const model = createChatModel();
  const ask = async (prompt: string) => toText((await model.invoke(prompt)).content);

  // 1. MAP: summarize groups of chunks
  let texts = groupBySize(chunks, GROUP_CHARS).map((g) => g.join("\n\n"));
  let summaries: string[] = [];
  for (let i = 0; i < texts.length; i += MAP_CONCURRENCY) {
    const batch = texts.slice(i, i + MAP_CONCURRENCY);
    const out: string[] = await step.run(`${config.name}-map-${i}`, () =>
      Promise.all(batch.map((text) => ask(config.mapPrompt(text))))
    );
    summaries = summaries.concat(out);
  }

  // 2. COLLAPSE: shrink until everything fits one final call
  for (let round = 1; round <= MAX_COLLAPSE_ROUNDS; round++) {
    if (summaries.join("\n\n").length <= MAX_REDUCE_CHARS) break;
    const groups = groupBySize(summaries, MAX_REDUCE_CHARS);
    if (groups.length >= summaries.length) break; // cannot shrink further
    summaries = (await step.run(`${config.name}-collapse-${round}`, () =>
      Promise.all(
        groups.map((g) => ask(config.collapsePrompt(g.join("\n\n"))))
      )
    )) as string[];
  }

  // 3. REDUCE: one structured answer
  const parser = StructuredOutputParser.fromZodSchema(config.schema as any);
  return (await step.run(`${config.name}-reduce`, async () => {
    const raw = await ask(
      config.reducePrompt(
        summaries.join("\n\n").slice(0, MAX_REDUCE_CHARS),
        parser.getFormatInstructions()
      )
    );
    return (await parser.parse(raw)) as z.infer<T>;
  })) as z.infer<T>;
};
