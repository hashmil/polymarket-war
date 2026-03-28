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
      <div className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted mb-2 font-mono">
        {title}
      </div>
      <div className="stagger-children">
        {items.map((item) => (
          <OddsRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}
