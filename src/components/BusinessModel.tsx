import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import { SliderInput } from './shared/SliderInput';
import { InfoBox } from './shared/InfoBox';
import { KPICard } from './shared/KPICard';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, BusinessMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  biz: BusinessMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

export const BusinessModel: React.FC<Props> = ({ inputs, biz, onChange, professorMode }) => {
  const revenueBreakdown = [
    { name: 'AI Consumption', value: Math.round(biz.consumerRevenue / 1_000_000 * 100) / 100 },
    { name: 'Enterprise', value: Math.round(biz.enterpriseRevenue / 1_000_000 * 100) / 100 },
    { name: 'API', value: Math.round(biz.apiRevenue / 1_000_000 * 100) / 100 },
    { name: 'Subscriptions', value: Math.round(biz.subscriptionRevenue / 1_000_000 * 100) / 100 },
    { name: 'Marketplace', value: Math.round(biz.marketplaceRevenue / 1_000_000 * 100) / 100 },
  ];

  const projectionData = biz.projectedAnnualRevenue.map((rev, i) => ({
    year: `Year ${i + 1}`,
    revenue: Math.round(rev / 1_000),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Monthly Revenue" value={fmt.usdShort(biz.monthlyRevenue)} accent="green" size="sm" />
        <KPICard label="Annual Revenue" value={fmt.usdShort(biz.annualRevenue)} accent="green" size="sm" />
        <KPICard label="Revenue / User" value={fmt.usd(biz.revenuePerUser, 2)} sub="annual" accent="blue" size="sm" />
        <KPICard label="User Growth" value={fmt.pct(inputs.annualUserGrowthPct)} sub="annual" accent="slate" size="sm" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Platform Parameters</h3>
          <div className="space-y-4">
            <SliderInput
              label="Monthly Active Users"
              value={inputs.monthlyActiveUsers}
              min={5000} max={2_000_000} step={5000}
              format={(v) => fmt.compact(v)}
              onChange={(v) => onChange({ monthlyActiveUsers: v })}
              professorNote="MAU is the primary demand driver for AI consumption revenue. Enterprise users are a subset of MAU with higher ARPU."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Annual User Growth"
              value={inputs.annualUserGrowthPct}
              min={0} max={300} step={5}
              unit="%"
              onChange={(v) => onChange({ annualUserGrowthPct: v })}
              professorNote="High growth rates are common in early-stage AI platforms but become harder to sustain at scale."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Avg Monthly AI Units / User"
              value={inputs.avgMonthlyAIConsumptionUnits}
              min={1} max={500} step={1}
              onChange={(v) => onChange({ avgMonthlyAIConsumptionUnits: v })}
              professorNote="A 'unit' is an abstraction representing a bundle of AI compute. Actual consumption varies dramatically by product type."
              showProfessorNote={professorMode}
            />
            <SliderInput
              label="Price per AI Unit (USD)"
              value={inputs.pricePerUnitUSD}
              min={0.05} max={10} step={0.05}
              format={(v) => `$${v.toFixed(2)}`}
              onChange={(v) => onChange({ pricePerUnitUSD: v })}
            />
            <SliderInput
              label="Enterprise Customer %"
              value={inputs.enterprisePct}
              min={0} max={80} step={1}
              unit="%"
              onChange={(v) => onChange({ enterprisePct: v })}
            />
            <SliderInput
              label="Enterprise Contract Value"
              value={inputs.enterpriseContractValueUSD}
              min={5000} max={500_000} step={5000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ enterpriseContractValueUSD: v })}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Streams (Monthly)</h3>
          <div className="space-y-4 mb-6">
            <SliderInput
              label="API Revenue"
              value={inputs.apiRevenueMonthlyUSD}
              min={0} max={5_000_000} step={10_000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ apiRevenueMonthlyUSD: v })}
            />
            <SliderInput
              label="Subscription Revenue"
              value={inputs.subscriptionRevenueMonthlyUSD}
              min={0} max={5_000_000} step={10_000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ subscriptionRevenueMonthlyUSD: v })}
            />
            <SliderInput
              label="Marketplace Revenue"
              value={inputs.marketplaceRevenueMonthlyUSD}
              min={0} max={2_000_000} step={10_000}
              format={(v) => fmt.usdShort(v)}
              onChange={(v) => onChange({ marketplaceRevenueMonthlyUSD: v })}
            />
          </div>

          <InfoBox
            type="info"
            title="Revenue Stream Composition"
            showInProfessorMode
            professorMode={professorMode}
          >
            AI platforms typically blend usage-based consumption (metered), enterprise contracts (prepaid commitments),
            API access (developer tier), and SaaS subscriptions (productivity tools). Each stream has different
            unit economics, churn dynamics, and sensitivity to compute cost changes.
          </InfoBox>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue Breakdown (Annual, $M)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}M`, 'Revenue']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($M)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">5-Year Revenue Projection ($K)</h3>
          <p className="text-xs text-slate-400 mb-3">Based on current growth rate — illustrative only</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(2)}M`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="Revenue ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
