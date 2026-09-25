export interface TokenAllocations {
  community: number;
  treasury: number;
  team: number;
  investors: number;
  ecosystem: number;
  computeProviders: number;
  liquidity: number;
  foundation: number;
}

export interface TreasuryAllocations {
  cash: number;
  computeCredits: number;
  axmTokens: number;
  stableAssets: number;
  ecosystemInvestments: number;
}

export interface SimulationInputs {
  // ── Business Model ──────────────────────────────────────
  monthlyActiveUsers: number;
  annualUserGrowthPct: number;
  avgMonthlyAIConsumptionUnits: number;
  pricePerUnitUSD: number;
  enterprisePct: number;
  enterpriseContractValueUSD: number;
  apiRevenueMonthlyUSD: number;
  subscriptionRevenueMonthlyUSD: number;
  marketplaceRevenueMonthlyUSD: number;

  // ── AI Cost Economics ────────────────────────────────────
  gpuCostPer1MTokens: number;
  inputTokensPerUserPerMonthK: number;
  outputTokensPerUserPerMonthK: number;
  imageGenCostPerUserMonthly: number;
  agentExecutionCostPerUserMonthly: number;
  dataStorageCostMonthly: number;
  networkCostMonthly: number;
  otherOpCostsMonthly: number;

  // ── Token Design ─────────────────────────────────────────
  totalSupply: number;
  allocations: TokenAllocations;

  // ── Vesting ──────────────────────────────────────────────
  teamVestingMonths: number;
  investorVestingMonths: number;
  cliffMonths: number;
  communityEmissionsMonthlyPct: number;
  ecosystemEmissionsMonthlyPct: number;
  treasuryReleaseMonthlyPct: number;

  // ── Token Demand ─────────────────────────────────────────
  transactionPctRequiringAXM: number;
  avgAXMPerUserMonthly: number;
  enterpriseAXMMultiplier: number;
  computePaymentPctInAXM: number;
  stakingParticipationPct: number;
  governanceParticipationPct: number;
  marketplaceUsagePct: number;
  avgHoldingPeriodMonths: number;

  // ── Token Velocity & Valuation ───────────────────────────
  tokenVelocity: number;
  tokenPriceUSD: number;

  // ── Treasury ─────────────────────────────────────────────
  treasuryTotalUSD: number;
  treasuryAllocations: TreasuryAllocations;
}

// ── Computed outputs ─────────────────────────────────────────────────────────

export interface BusinessMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  revenuePerUser: number;
  enterpriseRevenue: number;
  consumerRevenue: number;
  apiRevenue: number;
  subscriptionRevenue: number;
  marketplaceRevenue: number;
  projectedAnnualRevenue: number[];  // 5-year
}

export interface CostMetrics {
  monthlyComputeCost: number;
  annualComputeCost: number;
  costPerUser: number;
  gpuTokenCost: number;
  imageGenCost: number;
  agentCost: number;
  storageCost: number;
  networkCost: number;
  otherCost: number;
  grossProfit: number;
  grossMarginPct: number;
}

export interface TokenMetrics {
  circulatingSupply: number;
  impliedTokenPrice: number;
  fullyDilutedValue: number;
  circulatingMarketValue: number;
  annualTokenDemand: number;
  computedVelocity: number;
  annualEconomicActivity: number;
}

export interface VestingDataPoint {
  month: number;
  newlyUnlocked: number;
  circulatingSupply: number;
  cumulative: number;
  teamUnlocked: number;
  investorUnlocked: number;
  communityUnlocked: number;
  ecosystemUnlocked: number;
  treasuryUnlocked: number;
}

export interface TreasuryMetrics {
  totalUSD: number;
  monthlyBurn: number;
  monthlyInflow: number;
  netMonthlyChange: number;
  runwayMonths: number;
  cashUSD: number;
  computeCreditsUSD: number;
  axmTokensUSD: number;
  stableAssetsUSD: number;
  ecosystemInvestmentsUSD: number;
}

export interface SensitivityCell {
  row: number;
  col: number;
  rowLabel: string;
  colLabel: string;
  value: number;
}

export interface StressTestResult {
  label: string;
  baseline: number;
  stressed: number;
  changePct: number;
  unit: string;
}

export type ScenarioName = 'conservative' | 'base' | 'expansion';

export interface SavedScenario {
  id: string;
  name: string;
  inputs: SimulationInputs;
  createdAt: string;
}
