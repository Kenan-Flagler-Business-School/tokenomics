import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SliderInput } from './shared/SliderInput';
import { InfoBox } from './shared/InfoBox';
import { KPICard } from './shared/KPICard';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, TreasuryMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  treasury: TreasuryMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1'];

type TAllocKey = keyof SimulationInputs['treasuryAllocations'];

const ALLOC_LABELS: Record<TAllocKey, string> = {
  cash: 'Cash',
  computeCredits: 'AI Compute Credits',
  axmTokens: 'AXM Tokens',
  stableAssets: 'Stable-Value Assets',
  ecosystemInvestments: 'Ecosystem Investments',
};

export const TreasuryModel: React.FC<Props> = ({ inputs, treasury, onChange, professorMode }) => {
  const ta = inputs.treasuryAllocations;

  const pieData = Object.entries(ta).map(([key, pct]) => ({
    name: ALLOC_LABELS[key as TAllocKey],
    value: parseFloat(pct.toFixed(1)),
    usd: (pct / 100) * treasury.totalUSD,
  }));

  // 12-month runway projection
  const runwayData = Array.from({ length: 12 }, (_, i) => {
    const mo = i + 1;
    const balance = Math.max(0, treasury.totalUSD + treasury.netMonthlyChange * mo);
    return { month: `M${mo}`, balance: Math.round(balance / 1_000) };
  });

  const handleAllocChange = (key: TAllocKey, newVal: number) => {
    const remaining = 100 - newVal;
    const otherKeys = Object.keys(ta).filter(k => k !== key) as TAllocKey[];
    const otherSum = otherKeys.reduce((a, k) => a + ta[k], 0);
    const normalized = otherKeys.reduce((acc, k) => {
      acc[k] = otherSum > 0 ? (ta[k] / otherSum) * remaining : remaining / otherKeys.length;
      return acc;
    }, {} as Record<string, number>);
    onChange({
      treasuryAllocations: { ...ta, [key]: newVal, ...normalized } as SimulationInputs['treasuryAllocations'],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Treasury Balance"
          value={fmt.usdShort(treasury.totalUSD)}
          accent="green"
          size="sm"
        />
        <KPICard
          label="Monthly Burn"
          value={fmt.usdShort(treasury.monthlyBurn)}
          sub="compute + ops"
          accent="amber"
          size="sm"
        />
        <KPICard
          label="Monthly Revenue"
          value={fmt.usdShort(treasury.monthlyInflow)}
          sub="platform"
          accent="green"
          size="sm"
        />
        <KPICard
          label="Operating Runway"
          value={treasury.runwayMonths >= 999 ? '∞ mo' : `${Math.round(treasury.runwayMonths)} mo`}
          sub={treasury.netMonthlyChange >= 0 ? 'Cash-flow positive' : 'Burning cash'}
          accent={treasury.runwayMonths >= 24 || treasury.netMonthlyChange >= 0 ? 'green' : treasury.runwayMonths >= 12 ? 'amber' : 'slate'}
          size="sm"
          tooltip="Months until treasury is depleted, assuming net cash outflow continues at current rate. Infinity means revenue exceeds operating burn."
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Treasury Settings</h3>
          <div className="space-y-4">
            <SliderInput
              label="Total Treasury (USD)"
              value={inputs.treasuryTotalUSD}
              min={1_000_000} max={500_000_000} step={1_000_000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ treasuryTotalUSD: v })}
              professorNote="Treasury size determines how long the platform can survive if revenues decline or costs spike. Initial treasury is typically funded through token sales or equity raises."
              showProfessorNote={professorMode}
            />
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-semibold text-slate-600 mb-3">Treasury Allocation</h4>
            <div className="space-y-3">
              {(Object.keys(ta) as TAllocKey[]).map((key) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-600">{ALLOC_LABELS[key]}</span>
                    <span className="text-xs font-mono font-semibold text-blue-700">{ta[key].toFixed(1)}%</span>
                  </div>
                  <div className="relative h-3 flex items-center">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${ta[key]}%`, backgroundColor: COLORS[Object.keys(ta).indexOf(key)] }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0} max={80} step={1}
                      value={ta[key]}
                      onChange={(e) => handleAllocChange(key, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{fmt.usdShort((ta[key] / 100) * treasury.totalUSD)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-600 mb-3">Treasury Composition</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, _n, props) => [fmt.usdShort(props.payload?.usd ?? 0), `${v}%`]} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-600 mb-1">12-Month Balance Projection</h3>
              <p className="text-[10px] text-slate-400 mb-3">At current net burn / inflow rate ($K)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={runwayData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(2)}M`, 'Balance']} />
                  <Bar dataKey="balance" fill={treasury.netMonthlyChange >= 0 ? '#10b981' : '#f59e0b'} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-600 mb-3">Monthly Cash Flow Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400">Revenue Inflow</div>
                <div className="text-lg font-semibold font-mono text-emerald-600">+{fmt.usdShort(treasury.monthlyInflow)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Operating Burn</div>
                <div className="text-lg font-semibold font-mono text-red-500">−{fmt.usdShort(treasury.monthlyBurn)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Net Monthly</div>
                <div className={`text-lg font-semibold font-mono ${treasury.netMonthlyChange >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {treasury.netMonthlyChange >= 0 ? '+' : ''}{fmt.usdShort(treasury.netMonthlyChange)}
                </div>
              </div>
            </div>
          </div>

          <InfoBox type="info" showInProfessorMode professorMode={professorMode} title="Treasury Management in Token Projects">
            Effective treasury management is critical for token-issuing companies. Key considerations:
            (1) Diversification across stable and growth assets reduces concentration risk.
            (2) Compute credits can be strategically valuable if the company can lock in advantageous GPU rates.
            (3) Holding native tokens in treasury creates reflexive risk — if token price falls, so does treasury value.
            (4) Treasury size relative to monthly burn (runway) is a key solvency signal investors examine.
          </InfoBox>
        </div>
      </div>
    </div>
  );
};
