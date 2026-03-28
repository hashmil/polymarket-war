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
  return (
    <div className="flex-1 bg-bg-card border border-border rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase tracking-[1px] text-text-muted mb-1">
        {platform}
      </div>
      <div
        className={`font-mono text-[22px] font-bold ${color === "green" ? "text-green" : "text-red"}`}
      >
        {value}
      </div>
      <div className="text-[10px] text-text-muted mt-0.5">{label}</div>
    </div>
  );
}
