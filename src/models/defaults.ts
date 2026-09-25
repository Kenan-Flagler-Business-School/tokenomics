import type { SimulationInputs } from '../types';

export const DEFAULT_INPUTS: SimulationInputs = {
  // Business Model
  monthlyActiveUsers: 85_000,
  annualUserGrowthPct: 65,
  avgMonthlyAIConsumptionUnits: 42,
  pricePerUnitUSD: 0.80,
  enterprisePct: 0.15,            // ~127 enterprise accounts (companies, not users)
  enterpriseContractValueUSD: 96_000,  // $8K/month per enterprise contract
  apiRevenueMonthlyUSD: 185_000,
  subscriptionRevenueMonthlyUSD: 260_000,
  marketplaceRevenueMonthlyUSD: 55_000,

  // AI Cost Economics
  gpuCostPer1MTokens: 3.20,
  inputTokensPerUserPerMonthK: 680,   // ~680K tokens per user per month
  outputTokensPerUserPerMonthK: 200,
  imageGenCostPerUserMonthly: 0.42,
  agentExecutionCostPerUserMonthly: 1.10,
  dataStorageCostMonthly: 68_000,
  networkCostMonthly: 42_000,
  otherOpCostsMonthly: 1_850_000,     // Team, infra overhead, cloud beyond compute

  // Token Design
  totalSupply: 100_000_000,
  allocations: {
    community: 30,
    treasury: 20,
    team: 15,
    investors: 12,
    ecosystem: 10,
    computeProviders: 6,
    liquidity: 4,
    foundation: 3,
  },

  // Vesting
  teamVestingMonths: 48,
  investorVestingMonths: 36,
  cliffMonths: 12,
  communityEmissionsMonthlyPct: 1.5,
  ecosystemEmissionsMonthlyPct: 1.8,
  treasuryReleaseMonthlyPct: 0.5,

  // Token Demand
  transactionPctRequiringAXM: 35,
  avgAXMPerUserMonthly: 18,
  enterpriseAXMMultiplier: 4.5,
  computePaymentPctInAXM: 20,
  stakingParticipationPct: 22,
  governanceParticipationPct: 8,
  marketplaceUsagePct: 40,
  avgHoldingPeriodMonths: 3.5,

  // Token Velocity & Valuation
  tokenVelocity: 4.2,
  tokenPriceUSD: 1.85,

  // Treasury
  treasuryTotalUSD: 25_000_000,
  treasuryAllocations: {
    cash: 40,
    computeCredits: 25,
    axmTokens: 15,
    stableAssets: 15,
    ecosystemInvestments: 5,
  },
};
