export const fmt = {
  usd: (v: number, decimals = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v),

  usdShort: (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
  },

  number: (v: number, decimals = 0) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v),

  compact: (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toFixed(0);
  },

  pct: (v: number, decimals = 1) => `${v.toFixed(decimals)}%`,

  token: (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M AXM`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K AXM`;
    return `${v.toFixed(0)} AXM`;
  },

  changePct: (v: number) => {
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(1)}%`;
  },
};
