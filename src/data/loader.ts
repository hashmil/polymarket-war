import type { Analysis, Snapshot } from "../types.ts";

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
