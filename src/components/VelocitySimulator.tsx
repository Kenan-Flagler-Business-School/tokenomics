import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { InfoBox } from './shared/InfoBox';
import { fmt } from '../utils/formatting';
import type { SimulationInputs, TokenMetrics } from '../types';

interface Props {
  inputs: SimulationInputs;
  tok: TokenMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

const VELOCITY_STEPS = [0.5, 1, 2, 3, 5, 7.5, 10, 15, 20];

export const VelocitySimulator: React.FC<Props> = ({ inputs, tok, onChange, professorMode }) => {
  const economicActivity = tok.annualEconomicActivity;
  const circulating = tok.circulatingSupply;

  const chartData = VELOCITY_STEPS.map((v) => ({
    velocity: v,
    impliedPrice: circulating > 0 ? economicActivity / (circulating * v) : 0,
    supplyRequired: v > 0 && inputs.tokenPriceUSD > 0 ? economicActivity / (inputs.tokenPriceUSD * v) : 0,
  }));

  const currentVelocity = inputs.tokenVelocity;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
        <strong>Concept:</strong> Token velocity describes how many times a single token changes hands in a year.
        Higher velocity means each token is used more frequently to support economic activity.
        Lower velocity means tokens are held for longer periods.
        Neither is inherently better — it depends on the platform's design objectives and user behavior.
      </div>

      {/* Velocity Slider */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-6">Current Velocity Setting</h3>
        <div className="flex items-center gap-4 mb-6">
          {VELOCITY_STEPS.map((v) => (
            <button
              key={v}
              onClick={() => onChange({ tokenVelocity: v })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                Math.abs(currentVelocity - v) < 0.1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v}×
            </button>
          ))}
        </div>

        <div className="relative h-8 flex items-center mb-2">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-700 rounded-full transition-all"
              style={{ width: `${((currentVelocity - 0.5) / 19.5) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0.5} max={20} step={0.5}
            value={currentVelocity}
            onChange={(e) => onChange({ tokenVelocity: parseFloat(e.target.value) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-8"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>0.5× (very slow turnover)</span>
          <span className="font-semibold text-blue-700 text-sm">{currentVelocity.toFixed(1)}×</span>
          <span>20× (very fast turnover)</span>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Implied Token Price</div>
            <div className="text-lg font-semibold font-mono text-slate-800">{fmt.usd(tok.impliedTokenPrice, 4)}</div>
            <div className="text-xs text-slate-400">at V={currentVelocity}×</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Avg Holding Period</div>
            <div className="text-lg font-semibold font-mono text-slate-800">
              {currentVelocity > 0 ? `${(12 / currentVelocity).toFixed(1)} mo` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400">12 ÷ velocity</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Supply Required</div>
            <div className="text-lg font-semibold font-mono text-slate-800">
              {circulating > 0 ? fmt.compact(circulating) : '—'}
            </div>
            <div className="text-xs text-slate-400">to support activity at V={currentVelocity}×</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Implied Token Price vs Velocity</h3>
          <p className="text-xs text-slate-400 mb-4">
            P = Economic Activity ÷ (Circulating Supply × V). Holding other inputs constant.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="velocity" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}×`} label={{ value: 'Velocity', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip
                formatter={(v: number) => [fmt.usd(v, 4), 'Implied Price']}
                labelFormatter={(l) => `Velocity: ${l}×`}
              />
              <ReferenceLine x={currentVelocity} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Current', fontSize: 10, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="impliedPrice" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed' }} name="Implied Price ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Supply Required vs Velocity</h3>
          <p className="text-xs text-slate-400 mb-4">
            M = Economic Activity ÷ (P × V). At fixed token price: {fmt.usd(inputs.tokenPriceUSD, 2)}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="velocity" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}×`} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => fmt.compact(v)} />
              <Tooltip
                formatter={(v: number) => [fmt.compact(v) + ' AXM', 'Supply Required']}
                labelFormatter={(l) => `Velocity: ${l}×`}
              />
              <Line type="monotone" dataKey="supplyRequired" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="Supply Required" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <InfoBox type="formula" title="The Monetary Equation" showInProfessorMode professorMode={professorMode}>
        <div className="space-y-2 mt-1">
          <div><strong>MV = PQ</strong> (Fisher's Equation of Exchange)</div>
          <div>Where: M = Token monetary base (circulating supply)</div>
          <div>V = Velocity (annual turnover of tokens)</div>
          <div>P = Token price (USD per token)</div>
          <div>Q = Real economic output (volume of transactions)</div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <strong>Rearranged: P = Q ÷ (M × V)</strong>
          </div>
          <div className="text-slate-500">
            This model treats AXM as a medium of exchange. It does not capture speculative holding,
            store-of-value demand, or network effects. Real token markets are far more complex.
          </div>
        </div>
      </InfoBox>
    </div>
  );
};
