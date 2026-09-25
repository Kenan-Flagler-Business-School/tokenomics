import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { InfoBox } from './shared/InfoBox';
import { fmt } from '../utils/formatting';
import type { SimulationInputs } from '../types';

interface Props {
  inputs: SimulationInputs;
  tokenPrice: number;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

const ALLOC_COLORS: Record<string, string> = {
  community: '#3b82f6',
  treasury: '#8b5cf6',
  team: '#10b981',
  investors: '#f59e0b',
  ecosystem: '#6366f1',
  computeProviders: '#14b8a6',
  liquidity: '#f97316',
  foundation: '#94a3b8',
};

const ALLOC_LABELS: Record<string, string> = {
  community: 'Community / Users',
  treasury: 'Treasury',
  team: 'Team',
  investors: 'Investors',
  ecosystem: 'Ecosystem Incentives',
  computeProviders: 'AI Compute Providers',
  liquidity: 'Liquidity',
  foundation: 'Foundation',
};

const VESTING_STATUS: Record<string, string> = {
  community: 'Emitted over time',
  treasury: 'Governance-controlled',
  team: '12-mo cliff, 4-yr linear',
  investors: '12-mo cliff, 3-yr linear',
  ecosystem: 'Emitted over time',
  computeProviders: 'Performance-based',
  liquidity: 'Immediately circulating',
  foundation: 'Partially at TGE',
};

type AllocKey = keyof SimulationInputs['allocations'];

export const TokenDesign: React.FC<Props> = ({ inputs, tokenPrice, onChange, professorMode }) => {
  const alloc = inputs.allocations;
  const total = inputs.totalSupply;

  const sum = Object.values(alloc).reduce((a, b) => a + b, 0);
  const diff = Math.abs(sum - 100);
  const valid = diff < 0.05;

  const pieData = Object.entries(alloc).map(([key, pct]) => ({
    name: ALLOC_LABELS[key],
    value: parseFloat(pct.toFixed(2)),
    key,
  }));

  const handleAllocChange = (key: AllocKey, newVal: number) => {
    const remaining = 100 - newVal;
    const otherKeys = Object.keys(alloc).filter(k => k !== key) as AllocKey[];
    const otherSum = otherKeys.reduce((a, k) => a + alloc[k], 0);
    const normalized = otherKeys.reduce((acc, k) => {
      acc[k] = otherSum > 0 ? (alloc[k] / otherSum) * remaining : remaining / otherKeys.length;
      return acc;
    }, {} as Record<string, number>);

    onChange({
      allocations: {
        ...alloc,
        [key]: newVal,
        ...normalized,
      } as SimulationInputs['allocations'],
    });
  };

  return (
    <div className="space-y-6">
      {!valid && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          <AlertCircle size={14} />
          Allocations sum to {sum.toFixed(2)}% — auto-normalizing when you adjust a slider.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Token Allocation</h3>
          <p className="text-xs text-slate-400 mb-4">Total Supply: {fmt.compact(total)} AXM</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={115}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={ALLOC_COLORS[entry.key] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _n, props) => {
                  const tokens = (v / 100) * total;
                  return [
                    `${v.toFixed(1)}% · ${fmt.compact(tokens)} AXM · ${fmt.usdShort(tokens * tokenPrice)}`,
                    props.payload?.name,
                  ];
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Sliders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Adjust Allocations</h3>
          <p className="text-xs text-slate-400 mb-4">Adjusting one category auto-scales others to maintain 100%</p>
          <div className="space-y-3">
            {(Object.keys(alloc) as AllocKey[]).map((key) => {
              const pct = alloc[key];
              const tokens = (pct / 100) * total;
              const usdVal = tokens * tokenPrice;
              return (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">{ALLOC_LABELS[key]}</span>
                    <span className="text-xs font-semibold text-blue-700 font-mono">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-4 flex items-center mb-1">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor: ALLOC_COLORS[key] ?? '#94a3b8',
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={60}
                      step={0.5}
                      value={pct}
                      onChange={(e) => handleAllocChange(key, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-4"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{fmt.compact(tokens)} AXM</span>
                    <span>{fmt.usdShort(usdVal)}</span>
                    <span className="text-slate-300 italic">{VESTING_STATUS[key]}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs font-medium">
            <span className="text-slate-500">Total</span>
            <span className={valid ? 'text-emerald-600' : 'text-red-500'}>
              {sum.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Allocation Detail</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-100">
              <th className="text-left pb-2 font-medium">Category</th>
              <th className="text-right pb-2 font-medium">%</th>
              <th className="text-right pb-2 font-medium">Tokens</th>
              <th className="text-right pb-2 font-medium">Est. Value</th>
              <th className="text-right pb-2 font-medium">Vesting</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(alloc) as AllocKey[]).map((key) => {
              const pct = alloc[key];
              const tokens = (pct / 100) * total;
              return (
                <tr key={key} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ALLOC_COLORS[key] }} />
                    {ALLOC_LABELS[key]}
                  </td>
                  <td className="py-2 text-right font-mono">{pct.toFixed(1)}%</td>
                  <td className="py-2 text-right font-mono">{fmt.compact(tokens)}</td>
                  <td className="py-2 text-right font-mono">{fmt.usdShort(tokens * tokenPrice)}</td>
                  <td className="py-2 text-right text-slate-400 italic">{VESTING_STATUS[key]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InfoBox type="warning" title="Token Allocation ≠ Company Ownership">
        Token allocations determine who receives tokens at what schedule. They do not automatically correspond
        to equity ownership, voting rights in the corporate entity, or entitlement to corporate revenue.
        The legal and economic relationship between token holders and the company requires careful design and legal analysis.
      </InfoBox>

      <InfoBox type="info" showInProfessorMode professorMode={professorMode} title="Allocation Design Principles">
        Common allocation design considerations: (1) Community allocations should be large enough to incentivize
        meaningful ecosystem participation. (2) Team and investor allocations typically vest to align long-term
        incentives. (3) Treasury allocations provide operational reserves and ecosystem development funding.
        (4) Liquidity allocations ensure the token can be traded effectively from launch.
        The optimal allocation depends heavily on the specific platform design and governance objectives.
      </InfoBox>
    </div>
  );
};
