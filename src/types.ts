export interface MarketOutcome {
  question: string;
  slug: string;
  outcomes: [string, string]; // e.g. ["Yes", "No"]
  outcomePrices: [number, number]; // prices matching outcomes order
  volume: number;
  liquidity: number;
  endDate: string;
  clobTokenIds: string[];
  conditionId: string;
  groupItemTitle?: string;
}

export interface TrackedEvent {
  slug: string;
  title: string;
  markets: MarketOutcome[];
}

export interface Snapshot {
  fetchedAt: string;
  events: TrackedEvent[];
}

export interface OddsItem {
  label: string;
  value: number; // 0-100
}
