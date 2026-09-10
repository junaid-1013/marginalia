// The assistant cites pages as "(p. 3)", "(pp. 3-5)" or "(p. 2, p. 4)".
// These helpers turn them into links the chat can render as clickable chips.

const PARENTHETICAL = /\(([^()]*)\)/g;
// "p. 2", "pp. 3-5", separated by comma, semicolon, "and" or "&"
const ONLY_PAGES = /^\s*(?:pp?\.\s*\d+(?:\s*[-–]\s*\d+)?\s*(?:[,;]|and|&)?\s*)+$/i;
const PAGE_TOKEN = /\bpp?\.\s*(\d+)(?:\s*[-–]\s*\d+)?/gi;

/** "(p. 3)" -> "([p. 3](#page-3))". Parentheses that hold anything else are left alone. */
export const linkCitations = (text: string) =>
  text.replace(PARENTHETICAL, (whole, inner: string) =>
    ONLY_PAGES.test(inner)
      ? `(${inner.replace(PAGE_TOKEN, (token, first: string) => `[${token}](#page-${first})`)})`
      : whole
  );

/** The page number from a "#page-3" link, or null for every other link. */
export const pageFromHref = (href?: string | null) => {
  const match = href?.match(/^#page-(\d+)$/);
  return match ? Number(match[1]) : null;
};
