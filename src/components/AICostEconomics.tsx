import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SliderInput } from './shared/SliderInput';
import { InfoBox } from './shared/InfoBox';
import { KPICard } from './shared/KPICard';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, CostMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  cost: CostMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export const AICostEconomics: React.FC<Props> = ({ inputs, cost, onChange, professorMode }) => {
  const costBreakdown = [
    { name: 'GPU / Tokens', value: parseFloat(cost.gpuTokenCost.toFixed(0)) },
    { name: 'Image Gen', value: parseFloat(cost.imageGenCost.toFixed(0)) },
    { name: 'Agent Exec', value: parseFloat(cost.agentCost.toFixed(0)) },
    { name: 'Storage', value: parseFloat(cost.storageCost.toFixed(0)) },
    { name: 'Network', value: parseFloat(cost.networkCost.toFixed(0)) },
    { name: 'Other Ops', value: parseFloat(cost.otherCost.toFixed(0)) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Monthly Compute Cost" value={fmt.usdShort(cost.monthlyComputeCost)} accent="amber" size="sm" />
        <KPICard label="Cost per User / Month" value={fmt.usd(cost.costPerUser, 2)} accent="amber" size="sm" />
        <KPICard label="Gross Margin" value={fmt.pct(cost.grossMarginPct)} accent={cost.grossMarginPct > 40 ? 'green' : 'amber'} size="sm" />
        <KPICard label="Annual Gross Profit" value={fmt.usdShort(cost.grossProfit)} accent="green" size="sm" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Compute Cost Inputs</h3>
          <div className="space-y-4">
            <SliderInput
              label="GPU Cost per 1M Tokens ($)"
              value={inputs.gpuCostPer1MTokens}
              min={0.05} max={5} step={0.05}
              format={(v) => `$${v.toFixed(2)}`}
              onChange={(v) => onChange({ gpuCostPer1MTokens: v })}
              professorNote="Output tokens typically cost 3–5× more than input tokens due to autoregressive generation. This slider applies input cost; output is multiplied by 3 internally."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Input Tokens / User / Month (K)"
              value={inputs.inputTokensPerUserPerMonthK}
              min={10} max={2000} step={10}
              unit="K"
              onChange={(v) => onChange({ inputTokensPerUserPerMonthK: v })}
            />
            <SliderInput
              label="Output Tokens / User / Month (K)"
              value={inputs.outputTokensPerUserPerMonthK}
              min={5} max={500} step={5}
              unit="K"
              onChange={(v) => onChange({ outputTokensPerUserPerMonthK: v })}
            />
            <SliderInput
              label="Image Gen Cost / User / Month ($)"
              value={inputs.imageGenCostPerUserMonthly}
              min={0} max={5} step={0.05}
              format={(v) => `$${v.toFixed(2)}`}
              onChange={(v) => onChange({ imageGenCostPerUserMonthly: v })}
            />
            <SliderInput
              label="Agent Execution Cost / User / Month ($)"
              value={inputs.agentExecutionCostPerUserMonthly}
              min={0} max={10} step={0.10}
              format={(v) => `$${v.toFixed(2)}`}
              onChange={(v) => onChange({ agentExecutionCostPerUserMonthly: v })}
              professorNote="AI agents consume tokens across multiple steps per task. Costs compound with task complexity and number of tool calls."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Data Storage Cost / Month ($)"
              value={inputs.dataStorageCostMonthly}
              min={0} max={500_000} step={5000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ dataStorageCostMonthly: v })}
            />
            <SliderInput
              label="Network / API Infrastructure ($)"
              value={inputs.networkCostMonthly}
              min={0} max={300_000} step={5000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ networkCostMonthly: v })}
            />
            <SliderInput
              label="Other Operating Costs / Month ($)"
              value={inputs.otherOpCostsMonthly}
              min={0} max={1_000_000} step={10_000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ otherOpCostsMonthly: v })}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly Cost Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Where AI infrastructure spending goes</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt.usdShort(v), 'Monthly']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <InfoBox
            type="warning"
            title="Token Economics Cannot Be Separated from Compute Economics"
          >
            The underlying cost of providing AI services is a fundamental constraint on tokenomics design.
            A token that promises to pay for compute must either reflect the real cost of compute, or the
            treasury must subsidize the difference. This is a key design challenge for AI platforms.
          </InfoBox>

          <InfoBox
            type="info"
            showInProfessorMode
            professorMode={professorMode}
            title="Gross Margin in AI Platforms"
          >
            AI platform gross margins vary widely: commodity inference providers often run 20–40%, while
            specialized or fine-tuned model providers can achieve higher margins. Agent workloads typically
            have lower margins due to multi-step token consumption. Scale drives cost improvements through
            reserved GPU capacity and custom silicon.
          </InfoBox>
        </div>
      </div>
    </div>
  );
};
