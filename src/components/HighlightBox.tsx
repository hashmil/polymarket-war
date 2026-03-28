export function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent/8 border-l-3 border-accent py-3 px-3.5 rounded-r-lg mt-2">
      <div className="text-[13px] leading-relaxed text-text-secondary [&_strong]:text-accent">
        {children}
      </div>
    </div>
  );
}
