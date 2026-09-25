import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SliderInput } from './shared/SliderInput';
import { InfoBox } from './shared/InfoBox';
import { KPICard } from './shared/KPICard';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, TokenMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  tok: TokenMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

export const TokenDemand: React.FC<Props> = ({ inputs, tok, onChange, professorMode }) => {
  const mau = inputs.monthlyActiveUsers;
  const totalSupply = inputs.totalSupply;

  // Demand breakdown for chart
  const consumerDemand = mau * inputs.avgAXMPerUserMonthly * (inputs.transactionPctRequiringAXM / 100) * 12;
  const enterpriseDemand = mau * (inputs.enterprisePct / 100) * inputs.avgAXMPerUserMonthly * inputs.enterpriseAXMMultiplier * 12;
  const stakedTokens = totalSupply * (inputs.stakingParticipationPct / 100) * 0.1;
  const govTokens = totalSupply * (inputs.governanceParticipationPct / 100) * 0.05;
  const computeDemand = tok.annualTokenDemand - consumerDemand - enterpriseDemand - stakedTokens - govTokens;

  const demandBreakdown = [
    { name: 'Consumer Txns', value: Math.max(0, Math.round(consumerDemand)) },
    { name: 'Enterprise Txns', value: Math.max(0, Math.round(enterpriseDemand)) },
    { name: 'Compute Payments', value: Math.max(0, Math.round(computeDemand)) },
    { name: 'Staking', value: Math.max(0, Math.round(stakedTokens)) },
    { name: 'Governance', value: Math.max(0, Math.round(govTokens)) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Annual Token Demand"
          value={fmt.compact(tok.annualTokenDemand)}
          sub="AXM / year"
          accent="purple"
          tooltip="Total estimated annual demand for AXM tokens across all demand sources."
        />
        <KPICard
          label="Economic Activity"
          value={fmt.usdShort(tok.annualEconomicActivity)}
          sub="AXM-denominated"
          accent="blue"
        />
        <KPICard
          label="Token Velocity"
          value={`${inputs.tokenVelocity.toFixed(1)}×`}
          sub="Annual turns (user set)"
          accent="slate"
        />
        <KPICard
          label="Computed Velocity"
          value={`${tok.computedVelocity.toFixed(1)}×`}
          sub="From model (MV=PQ)"
          accent="blue"
          tooltip="Velocity implied by: V = Annual Economic Activity ÷ (Circulating Supply × Token Price)"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Token Demand Drivers</h3>
          <div className="space-y-4">
            <SliderInput
              label="Transactions Requiring AXM (%)"
              value={inputs.transactionPctRequiringAXM}
              min={0} max={100} step={1}
              unit="%"
              onChange={(v) => onChange({ transactionPctRequiringAXM: v })}
              professorNote="The fraction of platform activity that requires AXM tokens. This is a key design choice — requiring AXM for all activity creates demand but may deter users who don't want token exposure."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Avg AXM per User / Month"
              value={inputs.avgAXMPerUserMonthly}
              min={0} max={200} step={1}
              format={(v) => `${v} AXM`}
              onChange={(v) => onChange({ avgAXMPerUserMonthly: v })}
            />
            <SliderInput
              label="Enterprise AXM Multiplier"
              value={inputs.enterpriseAXMMultiplier}
              min={1} max={20} step={0.5}
              format={(v) => `${v.toFixed(1)}×`}
              onChange={(v) => onChange({ enterpriseAXMMultiplier: v })}
              professorNote="Enterprise users may require significantly more tokens due to higher AI consumption volumes and potentially mandatory AXM payment for compute services."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Compute Payments in AXM (%)"
              value={inputs.computePaymentPctInAXM}
              min={0} max={100} step={1}
              unit="%"
              onChange={(v) => onChange({ computePaymentPctInAXM: v })}
            />
            <SliderInput
              label="Staking Participation (%)"
              value={inputs.stakingParticipationPct}
              min={0} max={80} step={1}
              unit="%"
              onChange={(v) => onChange({ stakingParticipationPct: v })}
              professorNote="Staking locks tokens out of active circulation, reducing effective circulating supply and potentially affecting velocity. Staking incentives must be funded somehow — usually from token inflation or platform fees."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Governance Participation (%)"
              value={inputs.governanceParticipationPct}
              min={0} max={60} step={1}
              unit="%"
              onChange={(v) => onChange({ governanceParticipationPct: v })}
            />
            <SliderInput
              label="Avg Token Holding Period (months)"
              value={inputs.avgHoldingPeriodMonths}
              min={0.1} max={24} step={0.1}
              format={(v) => `${v.toFixed(1)} mo`}
              onChange={(v) => onChange({ avgHoldingPeriodMonths: v })}
              professorNote="Longer holding periods reduce effective velocity. V ≈ 12 / Avg Holding Period (months). This slider is for reference; the main velocity control is in the Velocity Simulator section."
              showProfessorNote={professorMode}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Demand Breakdown (Annual AXM)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={demandBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => fmt.compact(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                <Tooltip formatter={(v: number) => [fmt.compact(v) + ' AXM', 'Annual Demand']} />
                <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Annual AXM" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <InfoBox type="formula" title="Token Demand Formula" showInProfessorMode professorMode={professorMode}>
            <div className="space-y-1 mt-1">
              <div>Annual Demand = Consumer Txn Demand + Enterprise Txn Demand + Compute Demand + Staking Demand + Governance Demand</div>
              <div className="mt-2 text-slate-500">Where:</div>
              <div>Consumer Txn Demand = MAU × Avg AXM/User/Mo × Adoption% × 12</div>
              <div>Staking Demand ≈ Total Supply × Staking% × 10% (proxy for annual flow)</div>
            </div>
          </InfoBox>

          <InfoBox type="warning" title="Model Simplifications">
            This demand model uses linear approximations. Real token demand is affected by
            price sensitivity (demand-supply elasticity), competitive token alternatives, regulatory constraints,
            user psychology, and network effects — none of which are modeled here.
          </InfoBox>
        </div>
      </div>
    </div>
  );
};
