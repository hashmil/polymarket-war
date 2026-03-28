import type { MarketOutcome } from "../types.ts";

/** Get the "Yes" probability (0-1) for a binary market */
export function yesPrice(market: MarketOutcome): number {
  const yesIdx = market.outcomes.indexOf("Yes");
  if (yesIdx === -1) return market.outcomePrices[0]!; // fallback
  return market.outcomePrices[yesIdx]!;
}

/** Get the "Yes" probability as a percentage (0-100) */
export function yesPct(market: MarketOutcome): number {
  return Math.round(yesPrice(market) * 100);
}
