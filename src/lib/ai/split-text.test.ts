import { describe, expect, it } from "vitest";

import { splitText } from "@/lib/ai/split-text";

const para = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

describe("splitText", () => {
  it("returns short text as a single chunk and empty text as none", () => {
    expect(splitText("hello", 1000, 100)).toEqual(["hello"]);
    expect(splitText("", 1000, 100)).toEqual([]);
    expect(splitText("   \n\n  ", 1000, 100)).toEqual([]);
  });

  it("never exceeds the chunk size", () => {
    const text = [para(60), para(300), "short para", para(20)].join("\n\n");
    for (const chunk of splitText(text, 1000, 100)) {
      expect(chunk.length).toBeLessThanOrEqual(1000);
    }
  });

  it("does not lose any word", () => {
    const text = [para(60), para(300), para(20)].join("\n\n");
    const seen = new Set(splitText(text, 1000, 100).join(" ").split(/\s+/));
    for (const word of text.split(/\s+/)) expect(seen.has(word)).toBe(true);
  });

  it("hard splits text without separators and repeats the overlap", () => {
    const sizes = splitText("x".repeat(2500), 1000, 100).map((c) => c.length);
    expect(sizes).toEqual([1000, 1000, 700]); // 2500 chars + 2 x 100 overlap
  });

  it("repeats text between neighbouring chunks of one long paragraph", () => {
    const chunks = splitText(para(400), 500, 100);
    expect(chunks.length).toBeGreaterThan(2);
    for (let i = 1; i < chunks.length; i++) {
      const tail = chunks[i - 1].split(" ").slice(-2).join(" ");
      expect(chunks[i].includes(tail)).toBe(true);
    }
  });
});
