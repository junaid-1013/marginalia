import { describe, expect, it } from "vitest";

import { linkCitations, pageFromHref } from "@/lib/citations";

describe("linkCitations", () => {
  it("links a single page citation", () => {
    expect(linkCitations("Rereading is weak (p. 12).")).toBe("Rereading is weak ([p. 12](#page-12)).");
  });

  it("links a page range to its first page", () => {
    expect(linkCitations("See (pp. 3-5).")).toBe("See ([pp. 3-5](#page-3)).");
    expect(linkCitations("See (pp. 3–5).")).toBe("See ([pp. 3–5](#page-3)).");
  });

  it("links several pages in one parenthesis", () => {
    expect(linkCitations("Both agree (p. 2, p. 4).")).toBe(
      "Both agree ([p. 2](#page-2), [p. 4](#page-4))."
    );
    expect(linkCitations("(p. 2 and p. 9)")).toBe("([p. 2](#page-2) and [p. 9](#page-9))");
  });

  it("leaves other parentheses and plain text alone", () => {
    const text = "The cycle (see the diagram) runs in the stroma (p. about 12).";
    expect(linkCitations(text)).toBe(text);
    expect(linkCitations("Page numbers like p. 12 outside parentheses stay plain.")).toBe(
      "Page numbers like p. 12 outside parentheses stay plain."
    );
  });

  it("handles several citations in one answer", () => {
    expect(linkCitations("A (p. 1). B (p. 2).")).toBe("A ([p. 1](#page-1)). B ([p. 2](#page-2)).");
  });
});

describe("pageFromHref", () => {
  it("reads the page of a citation link", () => {
    expect(pageFromHref("#page-12")).toBe(12);
  });
  it("ignores every other link", () => {
    expect(pageFromHref("https://example.com")).toBeNull();
    expect(pageFromHref("#page-x")).toBeNull();
    expect(pageFromHref(undefined)).toBeNull();
  });
});
