export function DivergenceCard({
  platform,
  value,
  label,
  color,
}: {
  platform: string;
  value: string;
  label: string;
  color: "green" | "red";
}) {
  const glow = color === "green" ? "shadow-[0_0_20px_rgba(63,185,80,0.08)]" : "shadow-[0_0_20px_rgba(248,81,73,0.08)]";
  return (
    <div className={`flex-1 bg-bg-card border border-border rounded-xl p-4 text-center transition-all hover:border-border/80 ${glow}`}>
      <div className="text-[9px] uppercase tracking-[1.5px] text-text-dim mb-2 font-mono">
        {platform}
      </div>
      <div
        className={`font-mono text-2xl font-bold tracking-tight ${color === "green" ? "text-green" : "text-red"}`}
      >
        {value}
      </div>
      <div className="text-[10px] text-text-muted mt-1 font-mono">{label}</div>
    </div>
  );
}
