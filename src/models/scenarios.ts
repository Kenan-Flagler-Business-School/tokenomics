import type { SimulationInputs, ScenarioName } from '../types';
import { DEFAULT_INPUTS } from './defaults';

export const SCENARIOS: Record<ScenarioName, SimulationInputs> = {
  conservative: {
    ...DEFAULT_INPUTS,
    monthlyActiveUsers: 35_000,
    annualUserGrowthPct: 25,
    avgMonthlyAIConsumptionUnits: 24,
    pricePerUnitUSD: 0.65,
    enterprisePct: 0.08,
    enterpriseContractValueUSD: 72_000,
    apiRevenueMonthlyUSD: 65_000,
    subscriptionRevenueMonthlyUSD: 90_000,
    marketplaceRevenueMonthlyUSD: 18_000,
    gpuCostPer1MTokens: 4.50,
    inputTokensPerUserPerMonthK: 480,
    outputTokensPerUserPerMonthK: 140,
    imageGenCostPerUserMonthly: 0.55,
    agentExecutionCostPerUserMonthly: 1.40,
    dataStorageCostMonthly: 52_000,
    networkCostMonthly: 30_000,
    otherOpCostsMonthly: 1_400_000,
    tokenVelocity: 7.5,
    transactionPctRequiringAXM: 18,
    avgAXMPerUserMonthly: 9,
    computePaymentPctInAXM: 10,
    stakingParticipationPct: 12,
    tokenPriceUSD: 0.65,
    treasuryTotalUSD: 25_000_000,
  },

  base: {
    ...DEFAULT_INPUTS,
  },

  expansion: {
    ...DEFAULT_INPUTS,
    monthlyActiveUsers: 280_000,
    annualUserGrowthPct: 110,
    avgMonthlyAIConsumptionUnits: 68,
    pricePerUnitUSD: 0.88,
    enterprisePct: 0.22,
    enterpriseContractValueUSD: 144_000,
    apiRevenueMonthlyUSD: 620_000,
    subscriptionRevenueMonthlyUSD: 850_000,
    marketplaceRevenueMonthlyUSD: 195_000,
    gpuCostPer1MTokens: 2.10,
    inputTokensPerUserPerMonthK: 850,
    outputTokensPerUserPerMonthK: 260,
    imageGenCostPerUserMonthly: 0.28,
    agentExecutionCostPerUserMonthly: 0.75,
    dataStorageCostMonthly: 95_000,
    networkCostMonthly: 58_000,
    otherOpCostsMonthly: 3_800_000,
    tokenVelocity: 2.8,
    transactionPctRequiringAXM: 55,
    avgAXMPerUserMonthly: 28,
    computePaymentPctInAXM: 35,
    stakingParticipationPct: 32,
    tokenPriceUSD: 3.20,
    treasuryTotalUSD: 25_000_000,
  },
};

export const SCENARIO_LABELS: Record<ScenarioName, string> = {
  conservative: 'Conservative',
  base: 'Base Case',
  expansion: 'Expansion',
};

export const SCENARIO_DESCRIPTIONS: Record<ScenarioName, string> = {
  conservative: 'Lower user growth, higher compute costs, slower token adoption, higher velocity.',
  base: 'Moderate growth, balanced compute economics, moderate token utilization.',
  expansion: 'Higher user growth, enterprise adoption, improved compute economics, higher token utilization.',
};
