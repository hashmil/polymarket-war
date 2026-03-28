import { Link } from "react-router";
import { getLatest, getAnalysis } from "../data/loader.ts";
import { OddsSection } from "../components/OddsSection.tsx";
import { HighlightBox } from "../components/HighlightBox.tsx";
import { DivergenceCard } from "../components/DivergenceCard.tsx";
import { AnalysisBox } from "../components/AnalysisBox.tsx";
import { yesPct } from "../data/helpers.ts";
import type { OddsItem } from "../types.ts";

function extractOdds(
  events: ReturnType<typeof getLatest>["events"],
  eventSlug: string
): OddsItem[] {
  const event = events.find((e) => e.slug === eventSlug);
  if (!event) return [];
  return event.markets.map((m) => ({
    label: m.groupItemTitle || m.question,
    value: yesPct(m),
  }));
}

export function ReportView() {
  const data = getLatest();
  const analysis = getAnalysis();
  const fetchDate = new Date(data.fetchedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const ceasefireOdds = extractOdds(data.events, "us-x-iran-ceasefire-by");
  const militaryOdds = extractOdds(
    data.events,
    "military-action-against-iran-ends-on"
  );
  const conflictOdds = extractOdds(
    data.events,
    "iran-x-israelus-conflict-ends-by"
  );

  const mainSlugs = new Set([
    "us-x-iran-ceasefire-by",
    "military-action-against-iran-ends-on",
    "iran-x-israelus-conflict-ends-by",
  ]);
  const otherEvents = data.events.filter((e) => !mainSlugs.has(e.slug));

  return (
    <div className="noise min-h-screen bg-bg p-4 sm:p-6 lg:p-10">
      {/* Desktop: centered card with max-width. Mobile: full-width */}
      <div className="max-w-[480px] lg:max-w-[680px] mx-auto">
        <div className="animate-fade-in bg-gradient-to-b from-bg-card to-bg border border-border rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]">

          {/* Header */}
          <div className="relative px-5 sm:px-6 pt-6 pb-5 border-b border-border-subtle bg-gradient-to-br from-bg-header via-bg-card to-bg-card overflow-hidden">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "linear-gradient(rgba(240,136,62,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,136,62,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green animate-pulse-slow" />
                <span className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">
                  Live Market Report
                </span>
              </div>
              <h1 className="text-[22px] sm:text-2xl font-bold leading-tight text-text-bright tracking-[-0.02em]">
                Iran War: What the Markets Say
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-text-muted font-mono">{fetchDate}</span>
                <span className="text-border">·</span>
                <span className="text-[11px] text-text-muted font-mono">Polymarket</span>
              </div>
            </div>
          </div>

          {/* Odds Sections — on desktop (lg), show ceasefire + military side by side */}
          <div className="lg:grid lg:grid-cols-2 lg:divide-x lg:divide-border-subtle">
            <div>
              {ceasefireOdds.length > 0 && (
                <OddsSection title="🕊️ Ceasefire Odds" items={ceasefireOdds} />
              )}
            </div>
            <div>
              {conflictOdds.length > 0 && (
                <OddsSection title="🏁 Conflict Resolution" items={conflictOdds} />
              )}
            </div>
          </div>

          {militaryOdds.length > 0 && (
            <OddsSection title="⚔️ Military Action Ends" items={militaryOdds} />
          )}

          {otherEvents.map((event) => {
            const items = event.markets.map((m) => ({
              label: m.groupItemTitle || m.question,
              value: yesPct(m),
            }));
            return (
              <OddsSection key={event.slug} title={event.title} items={items} />
            );
          })}

          {/* AI Analysis */}
          {analysis.analysis && (
            <AnalysisBox
              analysis={analysis.analysis}
              generatedAt={analysis.generatedAt}
            />
          )}

          {/* Divergence */}
          <div className="px-5 sm:px-6 py-5 border-b border-border-subtle">
            <div className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted mb-3 font-mono">
              🔍 Cross-Platform Divergence
            </div>
            <div className="flex gap-3 mt-2">
              <DivergenceCard
                platform="Polymarket"
                value="~60%"
                label="$56M volume"
                color="green"
              />
              <DivergenceCard
                platform="Metaculus"
                value="8%"
                label="343 forecasters"
                color="red"
              />
            </div>
            <HighlightBox>
              <p>
                Metaculus forecasters (no money at stake) are{" "}
                <strong>far more pessimistic</strong> about a near-term
                ceasefire than Polymarket traders.
              </p>
            </HighlightBox>
          </div>

          {/* Caveat */}
          <div className="px-5 sm:px-6 py-4 border-b border-border-subtle">
            <HighlightBox>
              <p>
                ⚠️ <strong>Caveat:</strong> Polymarket's Iran odds are under
                scrutiny for possible insider trading. Cross-reference with
                Metaculus &amp; analyst views.
              </p>
            </HighlightBox>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
            {import.meta.env.DEV ? (
              <Link
                to="/dashboard"
                className="text-[11px] text-accent hover:text-accent/80 font-mono transition-colors group"
              >
                Dashboard <span className="inline-block group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ) : (
              <span />
            )}
            <span className="text-[10px] text-text-dim font-mono">
              Sources: Polymarket · {fetchDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
