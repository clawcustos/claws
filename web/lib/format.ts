/**
 * Smart USD formatting — handles $0 through $999M+
 * Converts ETH amount to USD display string.
 */
export function formatUSD(eth: number, ethPriceUsd: number = 2500): string {
  const usd = eth * ethPriceUsd;
  if (usd === 0 || eth === 0) return '$0';
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  if (usd < 1_000_000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${(usd / 1_000_000).toFixed(2)}M`;
}

/**
 * Smart USD formatting from raw USD value (not ETH).
 */
export function formatUSDValue(usd: number): string {
  if (usd === 0) return '$0';
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  if (usd < 1_000_000) return `$${(usd / 1000).toFixed(1)}K`;
  return `$${(usd / 1_000_000).toFixed(2)}M`;
}
