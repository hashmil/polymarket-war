function oddsColor(value: number): { badge: string; bar: "green" | "yellow" | "red" } {
  if (value >= 65) return { badge: "bg-green-dim text-green", bar: "green" };
  if (value >= 35) return { badge: "bg-yellow-dim text-yellow", bar: "yellow" };
  if (value >= 15) return { badge: "bg-red-dim text-red", bar: "red" };
  return { badge: "bg-red-dim/60 text-red-dark", bar: "red" };
}

export function OddsRow({ label, value, delta }: { label: string; value: number; delta?: number }) {
  const color = oddsColor(value);
  const showDelta = delta !== undefined && delta !== 0;
  return (
    <div
      className="odds-bar flex items-center justify-between py-3 px-1 border-b border-border-subtle/40 last:border-b-0 transition-colors hover:bg-white/[0.02] rounded-md"
      data-color={color.bar}
      style={{ "--bar-width": `${value}%` } as React.CSSProperties}
    >
      <span className="text-[13px] font-medium text-text leading-tight pr-3">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {showDelta && (
          <span className={`font-mono text-[11px] ${delta! > 0 ? "text-green" : "text-red"}`}>
            {delta! > 0 ? "+" : ""}{delta}
          </span>
        )}
        <span
          className={`font-mono text-[15px] font-bold px-3 py-1 rounded-md min-w-[52px] text-center ${color.badge}`}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}
