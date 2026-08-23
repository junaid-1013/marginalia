const SEPARATORS = ["\n\n", "\n", " ", ""];

/**
 * Recursive character splitter: tries paragraph, then line, then word
 * boundaries, packs pieces up to `chunkSize` characters and repeats roughly
 * `overlap` characters between neighbouring chunks.
 */
export const splitText = (
  text: string,
  chunkSize = 1000,
  overlap = 100,
  separators: string[] = SEPARATORS
): string[] => {
  const sep = separators.find((s) => s === "" || text.includes(s)) ?? "";
  const rest = separators.slice(separators.indexOf(sep) + 1);
  const pieces = sep === "" ? Array.from(text) : text.split(sep);

  const chunks: string[] = [];
  let window: string[] = [];
  let size = 0; // length of window joined with `sep`

  const flush = () => {
    const chunk = window.join(sep).trim();
    if (chunk) chunks.push(chunk);
  };

  for (const piece of pieces) {
    if (piece.length > chunkSize) {
      // too big on its own: flush what we have and split it with finer separators
      flush();
      window = [];
      size = 0;
      chunks.push(...splitText(piece, chunkSize, overlap, rest));
      continue;
    }

    const joined = window.length > 0 ? sep.length + piece.length : piece.length;
    if (size + joined > chunkSize && window.length > 0) {
      flush();
      // keep a tail of the window as overlap for the next chunk
      while (
        window.length > 0 &&
        (size > overlap || size + sep.length + piece.length > chunkSize)
      ) {
        size -= window[0].length + (window.length > 1 ? sep.length : 0);
        window.shift();
      }
    }
    size += window.length > 0 ? sep.length + piece.length : piece.length;
    window.push(piece);
  }
  if (window.length > 0) flush();
  return chunks;
};
