function oddsColor(value: number): string {
  if (value >= 65) return "bg-green/15 text-green";
  if (value >= 35) return "bg-yellow/15 text-yellow";
  if (value >= 15) return "bg-red/15 text-red";
  return "bg-red/10 text-red-dark";
}

export function OddsRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle/50 last:border-b-0">
      <span className="text-sm font-medium text-text">{label}</span>
      <span
        className={`font-mono text-base font-bold px-3 py-1 rounded-lg min-w-14 text-center ${oddsColor(value)}`}
      >
        {value}%
      </span>
    </div>
  );
}
