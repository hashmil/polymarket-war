import type { Analysis, Snapshot } from "../types.ts";
import { yesPrice } from "./helpers.ts";

// Latest data (overwritten each fetch)
import latestData from "../../data/latest.json";
import analysisData from "../../data/analysis.json";

// All historical snapshots
const snapshotModules = import.meta.glob<Snapshot>("../../data/snapshots/*.json", {
  eager: true,
  import: "default",
});

export function getLatest(): Snapshot {
  return latestData as unknown as Snapshot;
}

export function getAnalysis(): Analysis {
  return analysisData as unknown as Analysis;
}

export function getSnapshots(): { date: string; snapshot: Snapshot }[] {
  return Object.entries(snapshotModules)
    .map(([path, snapshot]) => {
      const filename = path.split("/").pop()?.replace(".json", "") ?? "";
      return { date: filename, snapshot };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Build a map of conditionId → yes% for a snapshot */
function buildOddsMap(snapshot: Snapshot): Map<string, number> {
  const map = new Map<string, number>();
  for (const event of snapshot.events) {
    for (const market of event.markets) {
      map.set(market.conditionId, Math.round(yesPrice(market) * 100));
    }
  }
  return map;
}

/** Get deltas between latest and previous snapshot, keyed by conditionId */
export function getDeltas(): Map<string, number> {
  const snapshots = getSnapshots();
  if (snapshots.length < 2) return new Map();

  const prev = buildOddsMap(snapshots[snapshots.length - 2]!.snapshot);
  const curr = buildOddsMap(snapshots[snapshots.length - 1]!.snapshot);

  const deltas = new Map<string, number>();
  for (const [id, currVal] of curr) {
    const prevVal = prev.get(id);
    if (prevVal !== undefined) {
      deltas.set(id, currVal - prevVal);
    }
  }
  return deltas;
}
