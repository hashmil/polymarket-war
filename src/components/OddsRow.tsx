function oddsColor(value: number): { badge: string; bar: "green" | "yellow" | "red" } {
  if (value >= 65) return { badge: "bg-green-dim text-green", bar: "green" };
  if (value >= 35) return { badge: "bg-yellow-dim text-yellow", bar: "yellow" };
  if (value >= 15) return { badge: "bg-red-dim text-red", bar: "red" };
  return { badge: "bg-red-dim/60 text-red-dark", bar: "red" };
}

export function OddsRow({ label, value }: { label: string; value: number }) {
  const color = oddsColor(value);
  return (
    <div
      className="odds-bar flex items-center justify-between py-3 px-1 border-b border-border-subtle/40 last:border-b-0 transition-colors hover:bg-white/[0.02] rounded-md"
      data-color={color.bar}
      style={{ "--bar-width": `${value}%` } as React.CSSProperties}
    >
      <span className="text-[13px] font-medium text-text leading-tight pr-3">{label}</span>
      <span
        className={`font-mono text-[15px] font-bold px-3 py-1 rounded-md min-w-[52px] text-center shrink-0 ${color.badge}`}
      >
        {value}%
      </span>
    </div>
  );
}
