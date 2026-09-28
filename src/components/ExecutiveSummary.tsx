import React from 'react';
import { AlertCircle } from 'lucide-react';
import { KPICard } from './shared/KPICard';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, BusinessMetrics, CostMetrics, TokenMetrics, TreasuryMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  biz: BusinessMetrics;
  cost: CostMetrics;
  tok: TokenMetrics;
  treasury: TreasuryMetrics;
}

export const ExecutiveSummary: React.FC<Props> = ({ inputs, biz, cost, tok, treasury }) => {
  return (
    <div>
      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-900 leading-relaxed">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>Educational Disclaimer:</strong> This simulation is an educational model for classroom use.
          It does not represent financial advice, an actual security, or a prediction of real-world token prices.
          All figures are hypothetical outputs of a simplified economic model for the fictional company Kenan-Flagler AI.
        </p>
      </div>

      {/* Token Economics Block */}
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Token Economics</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KPICard
          label="Total Token Supply"
          value={fmt.compact(inputs.totalSupply)}
          sub="AXM (Fixed)"
          accent="purple"
          tooltip="The maximum number of AXM tokens that will ever exist. This is set at protocol design time."
        />
        <KPICard
          label="Circulating Supply"
          value={fmt.compact(tok.circulatingSupply)}
          sub={fmt.pct((tok.circulatingSupply / inputs.totalSupply) * 100) + ' of total'}
          accent="purple"
          tooltip="Tokens currently available on the market or in active circulation."
        />
        <KPICard
          label="Token Price (User Set)"
          value={fmt.usd(inputs.tokenPriceUSD, 4)}
          sub="Reference price"
          accent="purple"
          tooltip="User-configurable reference price used for valuation calculations. Not a market price."
        />
        <KPICard
          label="Implied Token Price"
          value={fmt.usd(tok.impliedTokenPrice, 4)}
          sub="MV=PQ model output"
          accent="blue"
          tooltip="Price implied by the monetary equation P = Economic Activity ÷ (Circulating Supply × Velocity). This is a simplified model output, not a market prediction."
        />
        <KPICard
          label="Fully Diluted Value"
          value={fmt.usdShort(tok.fullyDilutedValue)}
          sub="Total supply × price"
          accent="slate"
          tooltip="Total supply × token price. FDV assumes all tokens are unlocked at the current price — a hypothetical upper bound, not a real valuation."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <KPICard
          label="Circulating Market Value"
          value={fmt.usdShort(tok.circulatingMarketValue)}
          sub="Circulating × price"
          accent="blue"
          tooltip="Circulating supply × token price. This differs from company value — token market value and company equity value are distinct concepts."
        />
        <KPICard
          label="Token Velocity"
          value={`${inputs.tokenVelocity.toFixed(1)}×`}
          sub="Annual turns"
          accent="slate"
          tooltip="How many times each token changes hands per year. Higher velocity = tokens are used more frequently for transactions rather than held."
        />
        <KPICard
          label="Annual Token Demand"
          value={fmt.compact(tok.annualTokenDemand)}
          sub="AXM / year (modeled)"
          accent="purple"
          tooltip="Estimated annual token demand based on platform usage, staking, governance, and compute payments."
        />
        <KPICard
          label="Economic Activity"
          value={fmt.usdShort(tok.annualEconomicActivity)}
          sub="Annual (AXM-denominated)"
          accent="blue"
          tooltip="Estimated annual value of transactions that use AXM tokens."
        />
      </div>

      {/* Business Economics Block */}
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Business Economics</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          label="Annual Revenue"
          value={fmt.usdShort(biz.annualRevenue)}
          sub={`${fmt.usdShort(biz.monthlyRevenue)} / mo`}
          accent="green"
          tooltip="Total annual platform revenue from all sources: consumption, enterprise contracts, API, subscriptions, and marketplace."
        />
        <KPICard
          label="Annual Compute Cost"
          value={fmt.usdShort(cost.annualComputeCost)}
          sub={`${fmt.usdShort(cost.monthlyComputeCost)} / mo`}
          accent="amber"
          tooltip="Total annual cost of operating the AI infrastructure: GPU tokens, image generation, agents, storage, and networking."
        />
        <KPICard
          label="Gross Margin"
          value={fmt.pct(cost.grossMarginPct)}
          sub={`${fmt.usdShort(cost.grossProfit)} gross profit`}
          accent={cost.grossMarginPct >= 40 ? 'green' : cost.grossMarginPct >= 20 ? 'amber' : 'slate'}
          tooltip="(Revenue − Compute Costs) ÷ Revenue. Gross margin excludes operating expenses like R&D, sales, and G&A."
        />
        <KPICard
          label="Monthly Active Users"
          value={fmt.compact(inputs.monthlyActiveUsers)}
          sub={`${fmt.pct(inputs.annualUserGrowthPct)} annual growth`}
          accent="blue"
          tooltip="Platform monthly active users and their projected annual growth rate."
        />
        <KPICard
          label="Treasury Runway"
          value={treasury.runwayMonths >= 999 ? '∞' : `${Math.round(treasury.runwayMonths)} mo`}
          sub={fmt.usdShort(treasury.totalUSD) + ' treasury'}
          accent={treasury.runwayMonths >= 24 ? 'green' : treasury.runwayMonths >= 12 ? 'amber' : 'slate'}
          tooltip="Estimated months of operations the treasury can fund before requiring new revenue or financing. Infinity means revenue exceeds burn."
        />
      </div>
    </div>
  );
};
