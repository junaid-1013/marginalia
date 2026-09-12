import { cn } from "@/lib/utils";

interface IWord {
  text: string;
  value: number;
}

const MAX_WORDS = 28;
const MIN_REM = 0.9;
const MAX_REM = 2.6;

// stable pseudo-random order so the cloud looks organic but never reshuffles between renders
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/**
 * The most used words, set in the serif: size follows how often a word occurs,
 * and the top few are marked with the highlighter. Plain HTML, so it follows
 * the theme and can be read by screen readers as a list.
 */
const WordCloud = ({ words }: { words: IWord[] }) => {
  const top = [...words]
    .filter((w) => w.text.trim() && Number.isFinite(w.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_WORDS);
  if (top.length === 0) return null;

  const max = top[0].value;
  const min = top[top.length - 1].value;
  const size = (v: number) =>
    max === min ? (MIN_REM + MAX_REM) / 2 : MIN_REM + ((v - min) / (max - min)) * (MAX_REM - MIN_REM);

  const shown = [...top].sort((a, b) => hash(a.text) - hash(b.text));

  return (
    <ul
      aria-label="Most used words, larger means more frequent"
      className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1.5 py-2"
    >
      {shown.map((w) => {
        const rank = top.indexOf(w);
        return (
          <li
            key={w.text}
            title={`${w.text}: ${w.value}`}
            style={{ fontSize: `${size(w.value).toFixed(2)}rem` }}
            className={cn(
              "font-display leading-tight",
              rank < 3 ? "font-semibold text-foreground" : rank < 10 ? "text-ink-soft" : "text-muted-foreground"
            )}
          >
            {rank < 3 ? <span className="mark-hl">{w.text}</span> : w.text}
          </li>
        );
      })}
    </ul>
  );
};

export default WordCloud;
