import { mkdir, writeFile } from "fs/promises";
import path from "path";

const GAMMA_API = "https://gamma-api.polymarket.com";

const EVENT_SLUGS = [
  "us-x-iran-ceasefire-by",
  "military-action-against-iran-ends-on",
  "iran-x-israelus-conflict-ends-by",
];

// Additional search terms to discover more markets
const SEARCH_TERMS = ["iran", "hormuz", "iran leader"];

interface GammaMarket {
  question: string;
  slug: string;
  outcomes: string; // JSON string like '["Yes","No"]'
  outcomePrices: string; // JSON string like "[0.4, 0.6]"
  volume: string;
  liquidity: string;
  endDate: string;
  clobTokenIds: string;
  conditionId: string;
  groupItemTitle?: string;
  active: boolean;
  closed: boolean;
}

interface GammaEvent {
  slug: string;
  title: string;
  markets: GammaMarket[];
}

async function fetchEvent(slug: string): Promise<GammaEvent | null> {
  try {
    const res = await fetch(`${GAMMA_API}/events?slug=${slug}`);
    if (!res.ok) return null;
    const events: GammaEvent[] = await res.json();
    return events[0] ?? null;
  } catch (e) {
    console.error(`Failed to fetch event ${slug}:`, e);
    return null;
  }
}

async function searchMarkets(query: string): Promise<GammaEvent[]> {
  try {
    const res = await fetch(
      `${GAMMA_API}/events?tag=politics&limit=10&active=true&_q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error(`Search failed for "${query}":`, e);
    return [];
  }
}

function isResolved(prices: [number, number]): boolean {
  return (
    (prices[0] === 0 && prices[1] === 1) ||
    (prices[0] === 1 && prices[1] === 0)
  );
}

function parseMarket(m: GammaMarket) {
  const rawPrices = JSON.parse(m.outcomePrices) as (string | number)[];
  const prices: [number, number] = [
    parseFloat(String(rawPrices[0])),
    parseFloat(String(rawPrices[1])),
  ];
  const outcomes = JSON.parse(m.outcomes || '["Yes","No"]') as [string, string];
  return {
    question: m.question,
    slug: m.slug,
    outcomes,
    outcomePrices: prices,
    volume: parseFloat(m.volume) || 0,
    liquidity: parseFloat(m.liquidity) || 0,
    endDate: m.endDate,
    clobTokenIds: JSON.parse(m.clobTokenIds || "[]"),
    conditionId: m.conditionId,
    groupItemTitle: m.groupItemTitle,
  };
}

async function main() {
  console.log("Fetching Polymarket data...\n");

  const seenSlugs = new Set<string>();
  const events: Array<{ slug: string; title: string; markets: ReturnType<typeof parseMarket>[] }> = [];

  // Fetch known events
  for (const slug of EVENT_SLUGS) {
    const event = await fetchEvent(slug);
    if (!event) {
      console.log(`  ✗ ${slug} — not found`);
      continue;
    }
    seenSlugs.add(event.slug);

    const markets = event.markets
      .filter((m) => m.active && !m.closed)
      .map(parseMarket)
      .filter((m) => !isResolved(m.outcomePrices));

    console.log(`  ✓ ${event.title} — ${markets.length} active markets`);
    events.push({ slug: event.slug, title: event.title, markets });
  }

  // Search for additional Iran-related events
  for (const term of SEARCH_TERMS) {
    const results = await searchMarkets(term);
    for (const event of results) {
      if (seenSlugs.has(event.slug)) continue;
      seenSlugs.add(event.slug);

      const markets = event.markets
        .filter((m) => m.active && !m.closed)
        .map(parseMarket)
        .filter((m) => !isResolved(m.outcomePrices));

      if (markets.length === 0) continue;

      console.log(`  + ${event.title} — ${markets.length} active markets (via search "${term}")`);
      events.push({ slug: event.slug, title: event.title, markets });
    }
  }

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    events,
  };

  // Write latest.json
  const dataDir = path.join(import.meta.dir, "..", "data");
  const snapshotsDir = path.join(dataDir, "snapshots");
  await mkdir(snapshotsDir, { recursive: true });

  await writeFile(
    path.join(dataDir, "latest.json"),
    JSON.stringify(snapshot, null, 2)
  );

  // Write timestamped snapshot
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  await writeFile(
    path.join(snapshotsDir, `${ts}.json`),
    JSON.stringify(snapshot, null, 2)
  );

  const totalMarkets = events.reduce((s, e) => s + e.markets.length, 0);
  console.log(`\nDone! ${events.length} events, ${totalMarkets} markets saved.`);
}

main();
