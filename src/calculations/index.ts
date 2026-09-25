import type {
  SimulationInputs,
  BusinessMetrics,
  CostMetrics,
  TokenMetrics,
  VestingDataPoint,
  TreasuryMetrics,
  SensitivityCell,
  StressTestResult,
} from '../types';

const safe = (v: number): number => (isFinite(v) && !isNaN(v) ? v : 0);

// ── Business Metrics ──────────────────────────────────────────────────────────

export function computeBusinessMetrics(inp: SimulationInputs): BusinessMetrics {
  const mau = safe(inp.monthlyActiveUsers);
  const consumerPct = (100 - safe(inp.enterprisePct)) / 100;
  const consumerMAU = mau * consumerPct;
  const enterpriseCount = Math.max(1, mau * (safe(inp.enterprisePct) / 100));

  const consumptionRevenue = consumerMAU * safe(inp.avgMonthlyAIConsumptionUnits) * safe(inp.pricePerUnitUSD);
  const enterpriseRevenue = enterpriseCount * (safe(inp.enterpriseContractValueUSD) / 12);
  const apiRev = safe(inp.apiRevenueMonthlyUSD);
  const subRev = safe(inp.subscriptionRevenueMonthlyUSD);
  const mktRev = safe(inp.marketplaceRevenueMonthlyUSD);

  const monthlyRevenue = consumptionRevenue + enterpriseRevenue + apiRev + subRev + mktRev;
  const annualRevenue = monthlyRevenue * 12;

  const growthRate = safe(inp.annualUserGrowthPct) / 100;
  const projectedAnnualRevenue = Array.from({ length: 5 }, (_, i) =>
    annualRevenue * Math.pow(1 + growthRate, i)
  );

  return {
    monthlyRevenue: safe(monthlyRevenue),
    annualRevenue: safe(annualRevenue),
    revenuePerUser: safe(mau > 0 ? annualRevenue / mau : 0),
    enterpriseRevenue: safe(enterpriseRevenue * 12),
    consumerRevenue: safe(consumptionRevenue * 12),
    apiRevenue: safe(apiRev * 12),
    subscriptionRevenue: safe(subRev * 12),
    marketplaceRevenue: safe(mktRev * 12),
    projectedAnnualRevenue,
  };
}

// ── Cost Metrics ──────────────────────────────────────────────────────────────

export function computeCostMetrics(
  inp: SimulationInputs,
  biz: BusinessMetrics
): CostMetrics {
  const mau = safe(inp.monthlyActiveUsers);

  const inputTokenCost =
    (mau * safe(inp.inputTokensPerUserPerMonthK) * 1000 * safe(inp.gpuCostPer1MTokens)) / 1_000_000;
  const outputTokenCost =
    (mau * safe(inp.outputTokensPerUserPerMonthK) * 1000 * safe(inp.gpuCostPer1MTokens) * 3) / 1_000_000;
  const gpuTokenCost = inputTokenCost + outputTokenCost;

  const imageGenCost = mau * safe(inp.imageGenCostPerUserMonthly);
  const agentCost = mau * safe(inp.agentExecutionCostPerUserMonthly);
  const storageCost = safe(inp.dataStorageCostMonthly);
  const networkCost = safe(inp.networkCostMonthly);
  const otherCost = safe(inp.otherOpCostsMonthly);

  const monthlyComputeCost = gpuTokenCost + imageGenCost + agentCost + storageCost + networkCost + otherCost;
  const annualComputeCost = monthlyComputeCost * 12;

  const grossProfit = biz.annualRevenue - annualComputeCost;
  const grossMarginPct = safe(biz.annualRevenue > 0 ? (grossProfit / biz.annualRevenue) * 100 : 0);

  return {
    monthlyComputeCost: safe(monthlyComputeCost),
    annualComputeCost: safe(annualComputeCost),
    costPerUser: safe(mau > 0 ? monthlyComputeCost / mau : 0),
    gpuTokenCost: safe(gpuTokenCost),
    imageGenCost: safe(imageGenCost),
    agentCost: safe(agentCost),
    storageCost: safe(storageCost),
    networkCost: safe(networkCost),
    otherCost: safe(otherCost),
    grossProfit: safe(grossProfit),
    grossMarginPct: safe(grossMarginPct),
  };
}

// ── Token Metrics ─────────────────────────────────────────────────────────────

export function computeInitialCirculatingSupply(inp: SimulationInputs): number {
  const total = safe(inp.totalSupply);
  const alloc = inp.allocations;
  // Immediately circulating at launch: liquidity + portion of community + foundation
  const liquidity = (alloc.liquidity / 100) * total;
  const communityInitial = (alloc.community / 100) * total * 0.05; // 5% of community unlocked at TGE
  const foundationInitial = (alloc.foundation / 100) * total * 0.1;
  return safe(liquidity + communityInitial + foundationInitial);
}

export function computeTokenMetrics(
  inp: SimulationInputs,
  biz: BusinessMetrics
): TokenMetrics {
  const mau = safe(inp.monthlyActiveUsers);
  const totalSupply = safe(inp.totalSupply);
  const circulating = computeInitialCirculatingSupply(inp);

  // Token demand calculation
  const consumerDemand = mau * safe(inp.avgAXMPerUserMonthly) * (safe(inp.transactionPctRequiringAXM) / 100) * 12;
  const enterpriseDemand = mau * (safe(inp.enterprisePct) / 100) * safe(inp.avgAXMPerUserMonthly) * safe(inp.enterpriseAXMMultiplier) * 12;
  const computeDemand = (biz.annualRevenue * 0.6) * (safe(inp.computePaymentPctInAXM) / 100) / Math.max(0.01, safe(inp.tokenPriceUSD));
  const stakedTokens = totalSupply * (safe(inp.stakingParticipationPct) / 100);
  const govTokens = totalSupply * (safe(inp.governanceParticipationPct) / 100);

  const annualTokenDemand = safe(consumerDemand + enterpriseDemand + computeDemand + stakedTokens * 0.1 + govTokens * 0.05);

  // Annual economic activity = transactions denominated in AXM
  const annualEconomicActivity = safe(
    consumerDemand * safe(inp.tokenPriceUSD) +
    enterpriseDemand * safe(inp.tokenPriceUSD) +
    biz.annualRevenue * (safe(inp.transactionPctRequiringAXM) / 100)
  );

  // MV = PQ ⟹ P = Q / (M * V)
  const velocity = safe(inp.tokenVelocity);
  const impliedTokenPrice = safe(
    circulating > 0 && velocity > 0
      ? annualEconomicActivity / (circulating * velocity)
      : inp.tokenPriceUSD
  );

  const displayPrice = safe(inp.tokenPriceUSD); // user-set price for display

  const computedVelocity = safe(
    circulating > 0 && displayPrice > 0
      ? annualEconomicActivity / (circulating * displayPrice)
      : velocity
  );

  return {
    circulatingSupply: safe(circulating),
    impliedTokenPrice: safe(impliedTokenPrice),
    fullyDilutedValue: safe(totalSupply * displayPrice),
    circulatingMarketValue: safe(circulating * displayPrice),
    annualTokenDemand: safe(annualTokenDemand),
    computedVelocity: safe(computedVelocity),
    annualEconomicActivity: safe(annualEconomicActivity),
  };
}

// ── Vesting Schedule ──────────────────────────────────────────────────────────

export function computeVestingSchedule(inp: SimulationInputs): VestingDataPoint[] {
  const total = safe(inp.totalSupply);
  const alloc = inp.allocations;

  const teamTotal = (alloc.team / 100) * total;
  const investorTotal = (alloc.investors / 100) * total;
  const communityTotal = (alloc.community / 100) * total;
  const ecosystemTotal = (alloc.ecosystem / 100) * total;
  const treasuryTotal = (alloc.treasury / 100) * total;
  const liquidityTotal = (alloc.liquidity / 100) * total;

  const cliff = Math.max(0, Math.round(safe(inp.cliffMonths)));
  const teamVest = Math.max(1, Math.round(safe(inp.teamVestingMonths)));
  const invVest = Math.max(1, Math.round(safe(inp.investorVestingMonths)));

  // Monthly emissions (% of remaining)
  const commEmitPct = safe(inp.communityEmissionsMonthlyPct) / 100;
  const ecoEmitPct = safe(inp.ecosystemEmissionsMonthlyPct) / 100;
  const treasEmitPct = safe(inp.treasuryReleaseMonthlyPct) / 100;

  let teamUnlocked = 0;
  let investorUnlocked = 0;
  let communityUnlocked = communityTotal * 0.05; // TGE unlock
  let ecosystemUnlocked = 0;
  let treasuryUnlocked = 0;

  // Start with immediately circulating (liquidity + TGE unlocks)
  let cumulative = liquidityTotal + communityUnlocked;

  const points: VestingDataPoint[] = [];

  for (let month = 1; month <= 60; month++) {
    let newTeam = 0;
    let newInvestor = 0;

    // Team: cliff then linear vest
    if (month > cliff && month <= cliff + teamVest) {
      newTeam = teamTotal / teamVest;
      teamUnlocked += newTeam;
    }

    // Investors: cliff then linear vest
    if (month > cliff && month <= cliff + invVest) {
      newInvestor = investorTotal / invVest;
      investorUnlocked += newInvestor;
    }

    // Community: monthly emissions from remaining
    const communityRemaining = communityTotal - communityUnlocked;
    const newCommunity = communityRemaining * commEmitPct;
    communityUnlocked += newCommunity;

    // Ecosystem: monthly emissions from remaining
    const ecosystemRemaining = ecosystemTotal - ecosystemUnlocked;
    const newEcosystem = ecosystemRemaining * ecoEmitPct;
    ecosystemUnlocked += newEcosystem;

    // Treasury releases
    const treasuryRemaining = treasuryTotal - treasuryUnlocked;
    const newTreasury = treasuryRemaining * treasEmitPct;
    treasuryUnlocked += newTreasury;

    const newlyUnlocked = newTeam + newInvestor + newCommunity + newEcosystem + newTreasury;
    cumulative += newlyUnlocked;

    const circ = liquidityTotal + teamUnlocked + investorUnlocked + communityUnlocked + ecosystemUnlocked + treasuryUnlocked;

    points.push({
      month,
      newlyUnlocked: safe(newlyUnlocked),
      circulatingSupply: safe(circ),
      cumulative: safe(cumulative),
      teamUnlocked: safe(teamUnlocked),
      investorUnlocked: safe(investorUnlocked),
      communityUnlocked: safe(communityUnlocked),
      ecosystemUnlocked: safe(ecosystemUnlocked),
      treasuryUnlocked: safe(treasuryUnlocked),
    });
  }

  return points;
}

// ── Treasury Metrics ──────────────────────────────────────────────────────────

export function computeTreasuryMetrics(
  inp: SimulationInputs,
  biz: BusinessMetrics,
  cost: CostMetrics
): TreasuryMetrics {
  const total = safe(inp.treasuryTotalUSD);
  const ta = inp.treasuryAllocations;

  const cashUSD = total * (ta.cash / 100);
  const computeCreditsUSD = total * (ta.computeCredits / 100);
  const axmTokensUSD = total * (ta.axmTokens / 100);
  const stableAssetsUSD = total * (ta.stableAssets / 100);
  const ecosystemInvestmentsUSD = total * (ta.ecosystemInvestments / 100);

  const monthlyBurn = cost.monthlyComputeCost + safe(inp.otherOpCostsMonthly);
  const monthlyInflow = biz.monthlyRevenue;
  const netMonthlyChange = monthlyInflow - monthlyBurn;

  const liquidAssets = cashUSD + computeCreditsUSD + stableAssetsUSD;
  const runwayMonths = safe(monthlyBurn > monthlyInflow ? liquidAssets / (monthlyBurn - monthlyInflow) : 999);

  return {
    totalUSD: safe(total),
    monthlyBurn: safe(monthlyBurn),
    monthlyInflow: safe(monthlyInflow),
    netMonthlyChange: safe(netMonthlyChange),
    runwayMonths: Math.min(999, safe(runwayMonths)),
    cashUSD: safe(cashUSD),
    computeCreditsUSD: safe(computeCreditsUSD),
    axmTokensUSD: safe(axmTokensUSD),
    stableAssetsUSD: safe(stableAssetsUSD),
    ecosystemInvestmentsUSD: safe(ecosystemInvestmentsUSD),
  };
}

// ── Sensitivity Analysis ──────────────────────────────────────────────────────

export type SensitivityVar =
  | 'annualRevenue'
  | 'userGrowth'
  | 'computeCost'
  | 'tokenAdoption'
  | 'circulatingSupply';

export function computeSensitivityTable(
  inp: SimulationInputs,
  rowVar: SensitivityVar,
  colVar: SensitivityVar
): SensitivityCell[][] {
  const velocitySteps = [1, 2, 4, 6, 8, 12];
  const revenueSteps = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const growthSteps = [10, 30, 60, 90, 120, 150];
  const computeSteps = [0.3, 0.5, 0.7, 0.9, 1.1, 1.5];
  const adoptionSteps = [10, 20, 35, 50, 65, 80];
  const supplySteps = [0.05, 0.1, 0.2, 0.3, 0.5, 0.7];

  const getSteps = (v: SensitivityVar) => {
    switch (v) {
      case 'annualRevenue': return revenueSteps;
      case 'userGrowth': return growthSteps;
      case 'computeCost': return computeSteps;
      case 'tokenAdoption': return adoptionSteps;
      case 'circulatingSupply': return supplySteps;
      default: return velocitySteps;
    }
  };

  const getLabel = (v: SensitivityVar, val: number) => {
    switch (v) {
      case 'annualRevenue': return `${val}× rev`;
      case 'userGrowth': return `${val}% growth`;
      case 'computeCost': return `${val}× cost`;
      case 'tokenAdoption': return `${val}% adopt`;
      case 'circulatingSupply': return `${Math.round(val * 100)}% supply`;
      default: return `${val}×`;
    }
  };

  const rows = getSteps(rowVar);
  const cols = velocitySteps; // velocity is always the column axis

  return rows.map((rowVal) =>
    cols.map((velocity) => {
      const modified: SimulationInputs = {
        ...inp,
        tokenVelocity: velocity,
      };

      switch (rowVar) {
        case 'annualRevenue':
          modified.pricePerUnitUSD = inp.pricePerUnitUSD * rowVal;
          break;
        case 'userGrowth':
          modified.annualUserGrowthPct = rowVal;
          break;
        case 'computeCost':
          modified.gpuCostPer1MTokens = inp.gpuCostPer1MTokens * rowVal;
          break;
        case 'tokenAdoption':
          modified.transactionPctRequiringAXM = rowVal;
          break;
        case 'circulatingSupply':
          modified.allocations = {
            ...inp.allocations,
            liquidity: rowVal * 100,
            community: Math.max(0, inp.allocations.community - (rowVal * 100 - inp.allocations.liquidity)),
          };
          break;
      }

      const biz = computeBusinessMetrics(modified);
      const cost = computeCostMetrics(modified, biz);
      const tok = computeTokenMetrics(modified, biz);

      return {
        row: rows.indexOf(rowVal),
        col: cols.indexOf(velocity),
        rowLabel: getLabel(rowVar, rowVal),
        colLabel: `V=${velocity}×`,
        value: safe(tok.impliedTokenPrice),
      };
    })
  );
}

// ── Stress Test ───────────────────────────────────────────────────────────────

export interface StressFlags {
  doubleUserGrowth: boolean;
  computeCostPlus50: boolean;
  tokenUnlock30: boolean;
  tokenUsageMinus20: boolean;
  doubleVelocity: boolean;
  enterpriseMinus50: boolean;
}

export function computeStressTest(
  inp: SimulationInputs,
  flags: StressFlags
): StressTestResult[] {
  const baseBiz = computeBusinessMetrics(inp);
  const baseCost = computeCostMetrics(inp, baseBiz);
  const baseTok = computeTokenMetrics(inp, baseBiz);
  const baseTreasury = computeTreasuryMetrics(inp, baseBiz, baseCost);

  const stressed: SimulationInputs = { ...inp };

  if (flags.doubleUserGrowth) {
    stressed.monthlyActiveUsers = inp.monthlyActiveUsers * 2;
    stressed.annualUserGrowthPct = inp.annualUserGrowthPct * 2;
  }
  if (flags.computeCostPlus50) {
    stressed.gpuCostPer1MTokens = inp.gpuCostPer1MTokens * 1.5;
    stressed.imageGenCostPerUserMonthly = inp.imageGenCostPerUserMonthly * 1.5;
    stressed.agentExecutionCostPerUserMonthly = inp.agentExecutionCostPerUserMonthly * 1.5;
  }
  if (flags.tokenUnlock30) {
    stressed.communityEmissionsMonthlyPct = inp.communityEmissionsMonthlyPct * 1.5;
    stressed.treasuryReleaseMonthlyPct = inp.treasuryReleaseMonthlyPct * 3;
  }
  if (flags.tokenUsageMinus20) {
    stressed.transactionPctRequiringAXM = inp.transactionPctRequiringAXM * 0.8;
    stressed.avgAXMPerUserMonthly = inp.avgAXMPerUserMonthly * 0.8;
  }
  if (flags.doubleVelocity) {
    stressed.tokenVelocity = inp.tokenVelocity * 2;
  }
  if (flags.enterpriseMinus50) {
    stressed.enterprisePct = inp.enterprisePct * 0.5;
    stressed.enterpriseContractValueUSD = inp.enterpriseContractValueUSD * 0.5;
  }

  const stressedBiz = computeBusinessMetrics(stressed);
  const stressedCost = computeCostMetrics(stressed, stressedBiz);
  const stressedTok = computeTokenMetrics(stressed, stressedBiz);
  const stressedTreasury = computeTreasuryMetrics(stressed, stressedBiz, stressedCost);

  const pct = (a: number, b: number) => safe(b > 0 ? ((a - b) / b) * 100 : 0);

  return [
    {
      label: 'Annual Revenue',
      baseline: baseBiz.annualRevenue,
      stressed: stressedBiz.annualRevenue,
      changePct: pct(stressedBiz.annualRevenue, baseBiz.annualRevenue),
      unit: '$',
    },
    {
      label: 'Annual Compute Cost',
      baseline: baseCost.annualComputeCost,
      stressed: stressedCost.annualComputeCost,
      changePct: pct(stressedCost.annualComputeCost, baseCost.annualComputeCost),
      unit: '$',
    },
    {
      label: 'Gross Margin',
      baseline: baseCost.grossMarginPct,
      stressed: stressedCost.grossMarginPct,
      changePct: stressedCost.grossMarginPct - baseCost.grossMarginPct,
      unit: '%',
    },
    {
      label: 'Token Demand (Annual)',
      baseline: baseTok.annualTokenDemand,
      stressed: stressedTok.annualTokenDemand,
      changePct: pct(stressedTok.annualTokenDemand, baseTok.annualTokenDemand),
      unit: 'AXM',
    },
    {
      label: 'Circulating Supply',
      baseline: baseTok.circulatingSupply,
      stressed: stressedTok.circulatingSupply,
      changePct: pct(stressedTok.circulatingSupply, baseTok.circulatingSupply),
      unit: 'AXM',
    },
    {
      label: 'Implied Token Price',
      baseline: baseTok.impliedTokenPrice,
      stressed: stressedTok.impliedTokenPrice,
      changePct: pct(stressedTok.impliedTokenPrice, baseTok.impliedTokenPrice),
      unit: '$',
    },
    {
      label: 'Treasury Runway',
      baseline: baseTreasury.runwayMonths,
      stressed: stressedTreasury.runwayMonths,
      changePct: pct(stressedTreasury.runwayMonths, baseTreasury.runwayMonths),
      unit: 'mo',
    },
  ];
}

// ── Randomize Inputs ──────────────────────────────────────────────────────────

export function randomizeInputs(base: SimulationInputs): SimulationInputs {
  const rnd = (min: number, max: number) => min + Math.random() * (max - min);
  const rndInt = (min: number, max: number) => Math.round(rnd(min, max));

  // Ensure allocations sum to 100
  const raw = {
    community: rnd(15, 40),
    treasury: rnd(10, 25),
    team: rnd(8, 20),
    investors: rnd(5, 18),
    ecosystem: rnd(5, 15),
    computeProviders: rnd(3, 10),
    liquidity: rnd(2, 8),
    foundation: rnd(1, 6),
  };
  const rawSum = Object.values(raw).reduce((a, b) => a + b, 0);
  const allocations = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, (v / rawSum) * 100])
  ) as unknown as typeof base.allocations;

  const treasuryRaw = {
    cash: rnd(20, 50),
    computeCredits: rnd(10, 30),
    axmTokens: rnd(5, 20),
    stableAssets: rnd(5, 25),
    ecosystemInvestments: rnd(2, 15),
  };
  const tSum = Object.values(treasuryRaw).reduce((a, b) => a + b, 0);
  const treasuryAllocations = Object.fromEntries(
    Object.entries(treasuryRaw).map(([k, v]) => [k, (v / tSum) * 100])
  ) as unknown as typeof base.treasuryAllocations;

  return {
    ...base,
    monthlyActiveUsers: rndInt(20_000, 500_000),
    annualUserGrowthPct: rnd(15, 150),
    avgMonthlyAIConsumptionUnits: rnd(10, 120),
    pricePerUnitUSD: rnd(0.40, 2.50),
    enterprisePct: rnd(3, 30),
    enterpriseContractValueUSD: rnd(20_000, 200_000),
    apiRevenueMonthlyUSD: rnd(50_000, 1_500_000),
    subscriptionRevenueMonthlyUSD: rnd(100_000, 2_000_000),
    marketplaceRevenueMonthlyUSD: rnd(20_000, 500_000),
    gpuCostPer1MTokens: rnd(0.20, 1.50),
    inputTokensPerUserPerMonthK: rnd(80, 600),
    outputTokensPerUserPerMonthK: rnd(25, 200),
    imageGenCostPerUserMonthly: rnd(0.05, 1.00),
    agentExecutionCostPerUserMonthly: rnd(0.20, 2.50),
    tokenVelocity: rnd(1, 15),
    tokenPriceUSD: rnd(0.20, 8.00),
    transactionPctRequiringAXM: rnd(5, 80),
    avgAXMPerUserMonthly: rnd(4, 60),
    stakingParticipationPct: rnd(5, 45),
    allocations,
    treasuryAllocations,
  };
}
