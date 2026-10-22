/**
 * The little markup the help text uses: **bold**, *italic* and `code`.
 * Not a Markdown parser — just enough to emphasise a sentence without
 * writing JSX inside the content file.
 */
const PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;

export function RichText({ children }: { children: string }) {
  return (
    <>
      {children.split(PATTERN).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-raised px-1 py-0.5 font-mono text-[0.9em] text-amber">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}
