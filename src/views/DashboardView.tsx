import { Link } from "react-router";
import { getLatest, getSnapshots } from "../data/loader.ts";
import { yesPct } from "../data/helpers.ts";
import { OddsSection } from "../components/OddsSection.tsx";
import { OddsChart } from "../components/OddsChart.tsx";
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
  const snapshots = getSnapshots();
  const [selectedEvent, setSelectedEvent] = useState(
    data.events[0]?.slug ?? ""
  );

  const fetchDate = formatDate(data.fetchedAt);

  // Build chart data from snapshots
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
    <div className="min-h-screen bg-bg p-5">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-bright">
              Iran War Dashboard
            </h1>
            <p className="text-sm text-text-muted font-mono mt-1">
              Last updated: {fetchDate} · {snapshots.length} snapshot
              {snapshots.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-accent hover:underline font-mono"
          >
            ← Share View
          </Link>
        </div>

        {/* Trend Chart */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              📈 Odds Trends
            </h2>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text font-mono focus:outline-none focus:border-accent"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {data.events.map((event) => {
            const items = event.markets.map((m) => ({
              label: m.groupItemTitle || m.question,
              value: yesPct(m),
            }));
            return (
              <div
                key={event.slug}
                className="bg-bg-card border border-border rounded-2xl overflow-hidden"
              >
                <OddsSection title={event.title} items={items} />
              </div>
            );
          })}
        </div>

        {/* Market Details Table */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            📋 All Markets
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="pb-2 text-text-muted font-mono text-xs">
                    Market
                  </th>
                  <th className="pb-2 text-text-muted font-mono text-xs text-right">
                    Odds
                  </th>
                  <th className="pb-2 text-text-muted font-mono text-xs text-right">
                    Volume
                  </th>
                  <th className="pb-2 text-text-muted font-mono text-xs text-right">
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
                        className="border-b border-border-subtle/50"
                      >
                        <td className="py-2 pr-4 text-text-secondary">
                          {m.groupItemTitle || m.question}
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-text-bright">
                          {odds}%
                        </td>
                        <td className="py-2 text-right font-mono text-text-muted">
                          {formatVolume(m.volume)}
                        </td>
                        <td className="py-2 text-right font-mono text-text-muted text-xs">
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
          <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
              🕐 Snapshot History
            </h2>
            <div className="space-y-2">
              {[...snapshots].reverse().map(({ date, snapshot }) => {
                const totalMarkets = snapshot.events.reduce(
                  (s, e) => s + e.markets.length,
                  0
                );
                return (
                  <div
                    key={date}
                    className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-b-0"
                  >
                    <span className="font-mono text-xs text-text-secondary">
                      {date.replace(/T/, " ").replace(/-/g, ":")}
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      {snapshot.events.length} events · {totalMarkets} markets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center font-mono text-[10px] text-text-dim mt-6 mb-4">
          Sources: Polymarket Gamma API · Data fetched {fetchDate}
        </div>
      </div>
    </div>
  );
}
