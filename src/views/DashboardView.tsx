import { Link } from "react-router";
import { getLatest, getSnapshots, getAnalysis } from "../data/loader.ts";
import { yesPct } from "../data/helpers.ts";
import { OddsSection } from "../components/OddsSection.tsx";
import { OddsChart } from "../components/OddsChart.tsx";
import { AnalysisBox } from "../components/AnalysisBox.tsx";
import { useState } from "react";

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function oddsColorClass(value: number): string {
  if (value >= 65) return "text-green";
  if (value >= 35) return "text-yellow";
  return "text-red";
}

const CHART_COLORS = [
  "#3fb950",
  "#f0883e",
  "#f85149",
  "#d29922",
  "#a371f7",
  "#79c0ff",
];

export function DashboardView() {
  const data = getLatest();
  const analysis = getAnalysis();
  const snapshots = getSnapshots();
  const [selectedEvent, setSelectedEvent] = useState(
    data.events[0]?.slug ?? ""
  );

  const fetchDate = formatDate(data.fetchedAt);

  const chartEvent = data.events.find((e) => e.slug === selectedEvent);
  const chartLines =
    chartEvent?.markets.map((m, i) => ({
      key: m.question,
      color: CHART_COLORS[i % CHART_COLORS.length]!,
      label: m.groupItemTitle || m.question,
    })) ?? [];

  const chartData = snapshots.map(({ date, snapshot }) => {
    const event = snapshot.events.find((e) => e.slug === selectedEvent);
    const point: Record<string, string | number> = {
      date: date.slice(0, 10),
    };
    event?.markets.forEach((m) => {
      point[m.question] = yesPct(m);
    });
    return point;
  });

  return (
    <div className="noise min-h-screen bg-bg p-4 sm:p-6 lg:p-10">
      <div className="max-w-[1100px] mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green animate-pulse-slow" />
              <span className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">
                Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-bright tracking-[-0.03em]">
              Iran War Tracker
            </h1>
            <p className="text-[12px] text-text-muted font-mono mt-1.5">
              Updated {fetchDate} · {snapshots.length} snapshot
              {snapshots.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            to="/"
            className="text-[11px] text-accent hover:text-accent/80 font-mono transition-colors group shrink-0"
          >
            <span className="inline-block group-hover:-translate-x-0.5 transition-transform">←</span> Share View
          </Link>
        </div>

        {/* AI Analysis */}
        {analysis.analysis && (
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden mb-6">
            <AnalysisBox
              analysis={analysis.analysis}
              generatedAt={analysis.generatedAt}
            />
          </div>
        )}

        {/* Trend Chart */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted font-mono">
              📈 Odds Trends
            </h2>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-[12px] text-text font-mono focus:outline-none focus:border-accent/60 transition-colors cursor-pointer"
            >
              {data.events.map((event) => (
                <option key={event.slug} value={event.slug}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <OddsChart data={chartData} lines={chartLines} />
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {data.events.map((event) => {
            const items = event.markets.map((m) => ({
              label: m.groupItemTitle || m.question,
              value: yesPct(m),
            }));
            return (
              <div
                key={event.slug}
                className="bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-colors"
              >
                <OddsSection title={event.title} items={items} />
              </div>
            );
          })}
        </div>

        {/* Market Details Table */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted font-mono mb-5">
            📋 All Markets
          </h2>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 px-2 text-text-dim font-mono text-[10px] uppercase tracking-wider font-semibold">
                    Market
                  </th>
                  <th className="pb-3 px-2 text-text-dim font-mono text-[10px] uppercase tracking-wider font-semibold text-right">
                    Odds
                  </th>
                  <th className="pb-3 px-2 text-text-dim font-mono text-[10px] uppercase tracking-wider font-semibold text-right hidden sm:table-cell">
                    Volume
                  </th>
                  <th className="pb-3 px-2 text-text-dim font-mono text-[10px] uppercase tracking-wider font-semibold text-right hidden sm:table-cell">
                    Ends
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.events.flatMap((event) =>
                  event.markets.map((m) => {
                    const odds = yesPct(m);
                    return (
                      <tr
                        key={m.conditionId}
                        className="border-b border-border-subtle/40 hover:bg-white/[0.01] transition-colors"
                      >
                        <td className="py-2.5 px-2 pr-4 text-text-secondary">
                          {m.groupItemTitle || m.question}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono font-bold ${oddsColorClass(odds)}`}>
                          {odds}%
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-text-muted text-[12px] hidden sm:table-cell">
                          {formatVolume(m.volume)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-text-dim text-[11px] hidden sm:table-cell">
                          {m.endDate
                            ? new Date(m.endDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Snapshots */}
        {snapshots.length > 0 && (
          <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-text-muted font-mono mb-4">
              🕐 Snapshot History
            </h2>
            <div className="space-y-0">
              {[...snapshots].reverse().map(({ date, snapshot }) => {
                const totalMarkets = snapshot.events.reduce(
                  (s, e) => s + e.markets.length,
                  0
                );
                return (
                  <div
                    key={date}
                    className="flex items-center justify-between py-2.5 border-b border-border-subtle/30 last:border-b-0"
                  >
                    <span className="font-mono text-[11px] text-text-secondary">
                      {date.replace(/T/, " ").replace(/-/g, ":")}
                    </span>
                    <span className="font-mono text-[11px] text-text-dim">
                      {snapshot.events.length} events · {totalMarkets} markets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center font-mono text-[10px] text-text-dim mt-8 mb-4">
          Sources: Polymarket Gamma API · {fetchDate}
        </div>
      </div>
    </div>
  );
}
