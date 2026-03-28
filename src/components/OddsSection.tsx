import { OddsRow } from "./OddsRow.tsx";
import type { OddsItem } from "../types.ts";

export function OddsSection({
  title,
  items,
}: {
  title: string;
  items: OddsItem[];
}) {
  return (
    <div className="px-5 py-4 border-b border-border-subtle">
      <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-muted mb-3">
        {title}
      </div>
      {items.map((item) => (
        <OddsRow key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
