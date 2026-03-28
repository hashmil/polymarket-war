/** Render inline markdown: **bold**, [links](url), *italic* */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/.+?)\)|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={match.index} className="text-text-bright font-semibold">
          {match[1]}
        </strong>
      );
    } else if (match[2] && match[3]) {
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent/80 hover:text-accent underline decoration-accent/30 hover:decoration-accent/60 transition-colors"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      parts.push(
        <em key={match.index} className="text-text-muted italic">
          {match[4]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

interface Props {
  analysis: string;
  generatedAt: string;
}

export function AnalysisBox({ analysis, generatedAt }: Props) {
  const time = new Date(generatedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines = analysis
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "---");

  // Separate sources from analysis bullets
  const sourcesIdx = lines.findIndex((l) => /^sources?:/i.test(l));
  const contentLines = sourcesIdx >= 0 ? lines.slice(0, sourcesIdx) : lines;
  const sourceLines = sourcesIdx >= 0 ? lines.slice(sourcesIdx + 1) : [];

  // Extract bullet points only
  const bullets = contentLines.filter(
    (l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*")
  );
  const displayLines = bullets.length > 0 ? bullets : contentLines;

  return (
    <div className="px-5 sm:px-6 py-5 border-b border-border-subtle">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted font-mono">
          🤖 AI Analysis
        </div>
        <div className="text-[10px] font-mono text-text-dim">
          {time}
        </div>
      </div>
      <div className="space-y-3 stagger-children">
        {displayLines.map((line, i) => {
          const text = line.replace(/^[•\-\*]\s*/, "");
          return (
            <div
              key={i}
              className="flex gap-3 text-[13px] leading-[1.65] text-text-secondary"
            >
              <span className="text-accent/60 shrink-0 mt-[3px] text-[10px]">▸</span>
              <span>{renderInline(text)}</span>
            </div>
          );
        })}
      </div>

      {/* Sources */}
      {sourceLines.length > 0 && (
        <details className="mt-4 group">
          <summary className="text-[10px] font-mono text-text-dim cursor-pointer hover:text-text-muted transition-colors select-none">
            <span className="group-open:hidden">▸</span>
            <span className="hidden group-open:inline">▾</span>
            {" "}Sources ({sourceLines.length})
          </summary>
          <div className="mt-2 space-y-1 pl-3 border-l border-border-subtle/50">
            {sourceLines.map((line, i) => {
              const cleaned = line.replace(/^[-•\*]\s*/, "");
              return (
                <div
                  key={i}
                  className="text-[10px] leading-relaxed text-text-dim"
                >
                  {renderInline(cleaned)}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
