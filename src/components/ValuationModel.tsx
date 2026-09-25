import React, { useState } from 'react';
import { InfoBox } from './shared/InfoBox';
import { KPICard } from './shared/KPICard';
import { SliderInput } from './shared/SliderInput';
import { fmt } from '../utils/formatting';
import type { TokenMetrics, SimulationInputs } from '../types';

interface Props {
  inputs: SimulationInputs;
  tok: TokenMetrics;
  onChange: (patch: Partial<SimulationInputs>) => void;
  professorMode: boolean;
}

export const ValuationModel: React.FC<Props> = ({ inputs, tok, onChange, professorMode }) => {
  const [customActivity, setCustomActivity] = useState<number | null>(null);
  const [customSupply, setCustomSupply] = useState<number | null>(null);
  const [customVelocity, setCustomVelocity] = useState<number | null>(null);

  const activity = customActivity ?? tok.annualEconomicActivity;
  const supply = customSupply ?? tok.circulatingSupply;
  const velocity = customVelocity ?? inputs.tokenVelocity;

  const impliedPrice = supply > 0 && velocity > 0 ? activity / (supply * velocity) : 0;
  const impliedCircMarketCap = impliedPrice * supply;
  const impliedFDV = impliedPrice * inputs.totalSupply;

  return (
    <div className="space-y-6">
      <InfoBox type="warning" title="Simplified Model — Not a Valuation Methodology">
        The Quantity Theory of Money (MV = PQ) is a useful educational framework for understanding
        token supply, velocity, and price relationships. It is NOT a complete token valuation methodology.
        Real market prices are also affected by speculation, sentiment, regulatory risk, competitive dynamics,
        and information asymmetries that this model does not capture.
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Interactive sliders for the valuation model */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Model Inputs</h3>
          <p className="text-xs text-slate-400 mb-4">
            Adjust independently from the main model to explore relationships
          </p>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-slate-600">Annual Economic Activity ($)</label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
                    {fmt.usdShort(activity)}
                  </span>
                  {customActivity !== null && (
                    <button onClick={() => setCustomActivity(null)} className="text-[10px] text-slate-400 hover:text-red-500">reset</button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={100_000}
                max={1_000_000_000}
                step={100_000}
                value={activity}
                onChange={(e) => setCustomActivity(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>$100K</span>
                <span>$1B</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-400">
                Model value: {fmt.usdShort(tok.annualEconomicActivity)}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-slate-600">Circulating Token Supply</label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
                    {fmt.compact(supply)}
                  </span>
                  {customSupply !== null && (
                    <button onClick={() => setCustomSupply(null)} className="text-[10px] text-slate-400 hover:text-red-500">reset</button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={500_000}
                max={100_000_000}
                step={100_000}
                value={supply}
                onChange={(e) => setCustomSupply(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>500K</span>
                <span>100M</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-400">
                Model value: {fmt.compact(tok.circulatingSupply)}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-slate-600">Token Velocity (×)</label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
                    {velocity.toFixed(1)}×
                  </span>
                  {customVelocity !== null && (
                    <button onClick={() => setCustomVelocity(null)} className="text-[10px] text-slate-400 hover:text-red-500">reset</button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={0.5}
                max={25}
                step={0.5}
                value={velocity}
                onChange={(e) => setCustomVelocity(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.5× slow</span>
                <span>25× fast</span>
              </div>
            </div>
          </div>

          {/* Formula display */}
          <div className="mt-6 bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-600 space-y-1.5">
            <div className="text-slate-400 text-[10px] uppercase tracking-wide mb-2">Model Formula</div>
            <div>P = Q ÷ (M × V)</div>
            <div className="text-slate-400">P = {fmt.usdShort(activity)} ÷ ({fmt.compact(supply)} × {velocity.toFixed(1)})</div>
            <div className="text-slate-400">P = {fmt.usdShort(activity)} ÷ {fmt.compact(supply * velocity)}</div>
            <div className="font-semibold text-slate-700">P = {fmt.usd(impliedPrice, 4)}</div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <KPICard
              label="Implied Token Price"
              value={fmt.usd(impliedPrice, 4)}
              sub="Model output (not market price)"
              accent="purple"
              tooltip="The token price that would result if economic activity equals (Circulating Supply × Velocity × Price). This is a simplified educational model."
            />
            <KPICard
              label="Implied Circulating Market Value"
              value={fmt.usdShort(impliedCircMarketCap)}
              sub={`${fmt.compact(supply)} circulating tokens`}
              accent="blue"
              tooltip="Implied price × circulating supply. A hypothetical market capitalization, not a company valuation."
            />
            <KPICard
              label="Implied Fully Diluted Valuation"
              value={fmt.usdShort(impliedFDV)}
              sub={`${fmt.compact(inputs.totalSupply)} total supply`}
              accent="slate"
              tooltip="Implied price × total supply. This assumes all tokens are valued at the current implied price — a hypothetical upper bound."
            />
          </div>

          <InfoBox type="info" title="Model Assumptions" showInProfessorMode professorMode={professorMode}>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>All economic activity is denominated in AXM tokens</li>
              <li>Velocity is constant across all transaction types</li>
              <li>No speculative or store-of-value demand</li>
              <li>No price impact from large transactions (no market depth)</li>
              <li>Token price does not affect usage or demand (no elasticity)</li>
              <li>No consideration of competing tokens or alternatives</li>
            </ol>
          </InfoBox>

          <InfoBox type="warning" title="Token Market Value ≠ Company Value">
            This model estimates a notional token market value based on transaction flows.
            This is distinct from the intrinsic equity value of Axiom AI as a company. Equity value
            depends on cash flows, growth prospects, competitive moats, and risk — factors not captured
            by the token monetary model.
          </InfoBox>
        </div>
      </div>
    </div>
  );
};
