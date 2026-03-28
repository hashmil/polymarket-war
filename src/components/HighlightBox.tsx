export function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent-dim border-l-2 border-accent py-3 px-4 rounded-r-lg mt-3">
      <div className="text-[13px] leading-[1.6] text-text-secondary [&_strong]:text-accent [&_strong]:font-semibold">
        {children}
      </div>
    </div>
  );
}
