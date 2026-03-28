import { Link } from "react-router";
import { getLatest } from "../data/loader.ts";
import { OddsSection } from "../components/OddsSection.tsx";
import { HighlightBox } from "../components/HighlightBox.tsx";
import { DivergenceCard } from "../components/DivergenceCard.tsx";
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

  // Collect "other" events not in the main three
  const mainSlugs = new Set([
    "us-x-iran-ceasefire-by",
    "military-action-against-iran-ends-on",
    "iran-x-israelus-conflict-ends-by",
  ]);
  const otherEvents = data.events.filter((e) => !mainSlugs.has(e.slug));

  return (
    <div className="min-h-screen bg-bg p-5">
      <div className="max-w-[420px] mx-auto">
        <div className="bg-gradient-to-br from-bg-card to-bg border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-6 pb-4 border-b border-border-subtle bg-gradient-to-br from-bg-header to-bg-card">
            <div className="font-mono text-[10px] uppercase tracking-[2px] text-accent mb-2">
              📊 Prediction Market Report
            </div>
            <h1 className="text-xl font-bold leading-tight text-text-bright">
              Iran War: What the Markets Say
            </h1>
            <div className="text-xs text-text-muted mt-1.5 font-mono">
              {fetchDate} · Polymarket
            </div>
          </div>

          {/* Ceasefire */}
          {ceasefireOdds.length > 0 && (
            <OddsSection title="🕊️ Ceasefire Odds" items={ceasefireOdds} />
          )}

          {/* Military Action Ends */}
          {militaryOdds.length > 0 && (
            <OddsSection
              title="⚔️ Military Action Ends"
              items={militaryOdds}
            />
          )}

          {/* Conflict Resolution */}
          {conflictOdds.length > 0 && (
            <OddsSection
              title="🏁 Conflict Resolution"
              items={conflictOdds}
            />
          )}

          {/* Other discovered events */}
          {otherEvents.map((event) => {
            const items = event.markets.map((m) => ({
              label: m.groupItemTitle || m.question,
              value: yesPct(m),
            }));
            return (
              <OddsSection key={event.slug} title={event.title} items={items} />
            );
          })}

          {/* Divergence section — static for now */}
          <div className="px-5 py-4 border-b border-border-subtle">
            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-muted mb-3">
              🔍 Cross-Platform Divergence
            </div>
            <div className="flex gap-2.5 mt-2">
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
                ceasefire than Polymarket traders. Key reasons: existential war
                for Iran's leadership, Pentagon preparing for prolonged conflict.
              </p>
            </HighlightBox>
          </div>

          {/* Caveat */}
          <div className="px-5 py-4 border-b border-border-subtle">
            <HighlightBox>
              <p>
                ⚠️ <strong>Caveat:</strong> Polymarket's Iran odds are under
                scrutiny for possible insider trading. Cross-reference with
                Metaculus & analyst views.
              </p>
            </HighlightBox>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 text-center font-mono text-[10px] text-text-dim border-t border-border-subtle">
            <Link
              to="/dashboard"
              className="text-accent hover:underline mr-3"
            >
              Open Dashboard →
            </Link>
            Sources: Polymarket · Updated {fetchDate}
          </div>
        </div>
      </div>
    </div>
  );
}
