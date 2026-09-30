import React, { useEffect, useState } from 'react';
import { Check, Minus, ExternalLink, AlertCircle, X } from 'lucide-react';
import { MODELS } from '../../data/models';
import type { LLMModel, Provider } from '../../types/llm';

const LEVEL_COLOR: Record<string, string> = {
  basic: 'bg-slate-100 text-slate-600',
  standard: 'bg-blue-50 text-blue-700',
  strong: 'bg-violet-50 text-violet-700',
  exceptional: 'bg-emerald-50 text-emerald-700',
};

const LEVEL_LABEL: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  strong: 'Strong',
  exceptional: 'Exceptional',
};

function fmtPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function fmtContext(n: number): string {
  return `${(n / 1000).toFixed(0)}K`;
}

const ProviderBadge: React.FC<{ model: LLMModel }> = ({ model }) => (
  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
    model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
  }`}>
    {model.provider}
  </span>
);

interface ModelTileProps {
  model: LLMModel;
  onOpen: (model: LLMModel) => void;
}

const ModelTile: React.FC<ModelTileProps> = ({ model, onOpen }) => (
  <button
    onClick={() => onOpen(model)}
    className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-2 mb-1.5">
      <ProviderBadge model={model} />
      {!model.pricingVerified && (
        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 flex items-center gap-1">
          <AlertCircle size={10} /> Est.
        </span>
      )}
    </div>
    <h3 className="font-semibold text-slate-900 text-sm">{model.name}</h3>
    <div className="text-xs text-slate-500 mt-1">{fmtPrice(model.inputPrice)} / {fmtPrice(model.outputPrice)} per 1M tokens</div>
    <div className="mt-2.5 flex flex-wrap gap-1">
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${LEVEL_COLOR[model.reasoning]}`}>
        {LEVEL_LABEL[model.reasoning]} reasoning
      </span>
      <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
        {fmtContext(model.contextWindow)} context
      </span>
    </div>
  </button>
);

interface ModelDetailModalProps {
  model: LLMModel;
  onClose: () => void;
}

const ModelDetailModal: React.FC<ModelDetailModalProps> = ({ model, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ProviderBadge model={model} />
              {!model.pricingVerified && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <AlertCircle size={10} /> Est. pricing
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
            <code className="text-xs text-slate-400 font-mono">{model.modelId}</code>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-slate-600 leading-relaxed">{model.description}</p>

          {/* Pricing detail */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Pricing (per 1M tokens)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-800">{fmtPrice(model.inputPrice)}</div>
                <div className="text-xs text-slate-400">Input</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-800">{fmtPrice(model.outputPrice)}</div>
                <div className="text-xs text-slate-400">Output</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-800">
                  {model.cachedInputPrice != null ? fmtPrice(model.cachedInputPrice) : '—'}
                </div>
                <div className="text-xs text-slate-400">Cached input</div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Capabilities</h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                ['Context window', fmtContext(model.contextWindow) + ' tokens'],
                ['Max output', model.maxOutputTokens.toLocaleString() + ' tokens'],
                ['Vision / multimodal', model.vision ? 'Yes' : 'No'],
                ['Tool use', model.toolUse ? 'Yes' : 'No'],
                ['Agent suitability', model.agentSuitable],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Well suited for</h4>
              <ul className="space-y-1">
                {model.useCases.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Less appropriate for</h4>
              <ul className="space-y-1">
                {model.lessAppropriate.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-xs text-slate-500">
                    <Minus size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {!model.pricingVerified && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              Pricing for this model is estimated. Verify at{' '}
              <a href={model.pricingUrl} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                {model.provider === 'Anthropic' ? 'claude.com/pricing' : 'developers.openai.com/api/docs/pricing'}
                <ExternalLink size={10} />
              </a>
            </div>
          )}

          <a
            href={model.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={12} />
            View official documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export const ModelDetails: React.FC = () => {
  const [filterProvider, setFilterProvider] = useState<Provider | 'all'>('all');
  const [activeModel, setActiveModel] = useState<LLMModel | null>(null);

  const filtered = MODELS.filter((m) =>
    filterProvider === 'all' || m.provider === filterProvider
  );

  const anthropicCount = MODELS.filter((m) => m.provider === 'Anthropic').length;
  const openaiCount = MODELS.filter((m) => m.provider === 'OpenAI').length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Model Details</h2>
        <p className="text-sm text-slate-500">
          Full pricing, capabilities, and use-case guidance for every current model. Click any model for details.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {([['all', 'All Models'], ['Anthropic', `Anthropic (${anthropicCount})`], ['OpenAI', `OpenAI (${openaiCount})`]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterProvider(val)}
            className={`text-sm px-4 py-2 rounded-lg border font-medium transition-colors ${
              filterProvider === val
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Model tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((model) => (
          <ModelTile key={model.id} model={model} onOpen={setActiveModel} />
        ))}
      </div>

      {activeModel && <ModelDetailModal model={activeModel} onClose={() => setActiveModel(null)} />}
    </div>
  );
};
