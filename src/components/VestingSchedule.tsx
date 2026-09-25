import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { SliderInput } from './shared/SliderInput';
import { InfoBox } from './shared/InfoBox';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, VestingDataPoint } from '../types';

interface Props {
  inputs: SimulationInputs;
  vestingData: VestingDataPoint[];
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

export const VestingSchedule: React.FC<Props> = ({ inputs, vestingData, onChange, professorMode }) => {
  const chartData = vestingData.map((d) => ({
    month: d.month,
    Team: Math.round(d.teamUnlocked / 1_000_000 * 100) / 100,
    Investors: Math.round(d.investorUnlocked / 1_000_000 * 100) / 100,
    Community: Math.round(d.communityUnlocked / 1_000_000 * 100) / 100,
    Ecosystem: Math.round(d.ecosystemUnlocked / 1_000_000 * 100) / 100,
    Treasury: Math.round(d.treasuryUnlocked / 1_000_000 * 100) / 100,
    newlyUnlocked: Math.round(d.newlyUnlocked / 1_000),
  }));

  const totalAtMonth60 = vestingData[59]?.circulatingSupply ?? 0;
  const initialCirc = vestingData[0]?.circulatingSupply ?? 0;

  // Cliff annotation
  const cliffMonth = Math.round(inputs.cliffMonths);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Initial Circulating Supply</div>
          <div className="text-xl font-semibold font-mono text-slate-800">{fmt.compact(initialCirc)}</div>
          <div className="text-xs text-slate-400">{fmt.pct((initialCirc / inputs.totalSupply) * 100)} of total</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Circulating at Month 60</div>
          <div className="text-xl font-semibold font-mono text-slate-800">{fmt.compact(totalAtMonth60)}</div>
          <div className="text-xs text-slate-400">{fmt.pct((totalAtMonth60 / inputs.totalSupply) * 100)} of total</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Cliff Period</div>
          <div className="text-xl font-semibold font-mono text-slate-800">{cliffMonth} months</div>
          <div className="text-xs text-slate-400">Team + investor unlock begins after cliff</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Vesting Parameters</h3>
          <div className="space-y-4">
            <SliderInput
              label="Cliff Period (months)"
              value={inputs.cliffMonths}
              min={0} max={24} step={1}
              unit=" mo"
              onChange={(v) => onChange({ cliffMonths: v })}
              professorNote="A cliff means no tokens unlock until the cliff date, then vesting begins. Common to prevent early employee/investor exits."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Team Vesting (months)"
              value={inputs.teamVestingMonths}
              min={12} max={60} step={1}
              unit=" mo"
              onChange={(v) => onChange({ teamVestingMonths: v })}
            />
            <SliderInput
              label="Investor Vesting (months)"
              value={inputs.investorVestingMonths}
              min={12} max={48} step={1}
              unit=" mo"
              onChange={(v) => onChange({ investorVestingMonths: v })}
            />
            <SliderInput
              label="Community Emissions (% / month)"
              value={inputs.communityEmissionsMonthlyPct}
              min={0.1} max={5} step={0.1}
              format={(v) => `${v.toFixed(1)}%/mo`}
              onChange={(v) => onChange({ communityEmissionsMonthlyPct: v })}
              professorNote="Community emissions are the rate at which the community allocation is distributed to users. Higher rates mean faster circulation but potentially more selling pressure."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Ecosystem Emissions (% / month)"
              value={inputs.ecosystemEmissionsMonthlyPct}
              min={0.1} max={5} step={0.1}
              format={(v) => `${v.toFixed(1)}%/mo`}
              onChange={(v) => onChange({ ecosystemEmissionsMonthlyPct: v })}
            />
            <SliderInput
              label="Treasury Releases (% / month)"
              value={inputs.treasuryReleaseMonthlyPct}
              min={0} max={2} step={0.05}
              format={(v) => `${v.toFixed(2)}%/mo`}
              onChange={(v) => onChange({ treasuryReleaseMonthlyPct: v })}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Cumulative Circulating Supply (60 months)</h3>
            <p className="text-xs text-slate-400 mb-4">By allocation category (millions of AXM)</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(v) => `M${v}`}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}M`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)}M AXM`, '']} labelFormatter={(l) => `Month ${l}`} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                {cliffMonth > 0 && (
                  <Area type="monotone" dataKey="Team" stackId="1" stroke="#10b981" fill="#d1fae5" strokeWidth={1.5} />
                )}
                <Area type="monotone" dataKey="Investors" stackId="1" stroke="#f59e0b" fill="#fef3c7" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Community" stackId="1" stroke="#3b82f6" fill="#dbeafe" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Ecosystem" stackId="1" stroke="#6366f1" fill="#e0e7ff" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Treasury" stackId="1" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly New Unlocks (K AXM)</h3>
            <p className="text-xs text-slate-400 mb-3">New tokens entering circulation each month</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `M${v}`} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}K`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()}K AXM`, 'New Unlocks']} labelFormatter={(l) => `Month ${l}`} />
                <Bar dataKey="newlyUnlocked" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Newly Unlocked (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <InfoBox type="note" title="Unlock Dynamics and Selling Pressure">
        Increased circulating supply can create potential selling pressure if token demand does not
        grow proportionally. However, the relationship is not automatic — holders may not sell, staking may
        absorb supply, and demand may increase faster than supply. Token unlock schedules are a design
        parameter, not a guaranteed market outcome.
      </InfoBox>

      <InfoBox type="info" showInProfessorMode professorMode={professorMode} title="Vesting Model Simplifications">
        This model uses linear vesting after a cliff, which is the most common structure. Real vesting schedules
        may include milestone-based unlocks, back-weighted schedules, or custom curves. Community emission rates
        are modeled as a fixed percentage of remaining balance per month (declining balance), not a fixed monthly amount.
      </InfoBox>
    </div>
  );
};
