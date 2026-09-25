import React, { useState } from 'react';
import { Check, X, Minus, ExternalLink, AlertCircle } from 'lucide-react';
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
  if (price < 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(2)}`;
}

function fmtContext(n: number): string {
  return `${(n / 1000).toFixed(0)}K`;
}

interface ModelCardProps {
  model: LLMModel;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${expanded ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                model.provider === 'Anthropic' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
              }`}>
                {model.provider}
              </span>
              {!model.pricingVerified && (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <AlertCircle size={10} /> Est. pricing
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900">{model.name}</h3>
            <code className="text-xs text-slate-400 font-mono">{model.modelId}</code>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-semibold text-slate-800">{fmtPrice(model.inputPrice)} / {fmtPrice(model.outputPrice)}</div>
            <div className="text-xs text-slate-400">input / output per 1M tokens</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${LEVEL_COLOR[model.reasoning]}`}>
            {LEVEL_LABEL[model.reasoning]} reasoning
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${LEVEL_COLOR[model.coding]}`}>
            {LEVEL_LABEL[model.coding]} coding
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${model.vision ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
            {model.vision ? 'Vision ✓' : 'No vision'}
          </span>
          <span className="text-xs px-2 py-1 rounded-lg font-medium bg-slate-100 text-slate-600">
            {fmtContext(model.contextWindow)} context
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">{model.description}</p>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50">
          {/* Pricing detail */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Pricing (per 1M tokens)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-800">{fmtPrice(model.inputPrice)}</div>
                <div className="text-xs text-slate-400">Input</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-800">{fmtPrice(model.outputPrice)}</div>
                <div className="text-xs text-slate-400">Output</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
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
                <div key={k} className="flex justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="grid md:grid-cols-2 gap-4">
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
                {model.provider === 'Anthropic' ? 'anthropic.com/pricing' : 'openai.com/pricing'}
                <ExternalLink size={10} />
              </a>
            </div>
          )}

          <a
            href={model.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} />
            View official documentation
          </a>
        </div>
      )}
    </div>
  );
};

export const ModelGuide: React.FC = () => {
  const [filterProvider, setFilterProvider] = useState<Provider | 'all'>('all');

  const filtered = MODELS.filter((m) =>
    filterProvider === 'all' || m.provider === filterProvider
  );

  const anthropicCount = MODELS.filter((m) => m.provider === 'Anthropic').length;
  const openaiCount = MODELS.filter((m) => m.provider === 'OpenAI').length;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Model Guide</h2>
        <p className="text-sm text-slate-500">
          Current models from Anthropic and OpenAI. Click any model to see full details, pricing, and use cases.
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

      {/* Category groups */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Model Categories</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Complex Reasoning', desc: 'Difficult analysis, multi-step problems, research', examples: ['claude-fable-5-1', 'claude-opus-5-5', 'gpt-6-astra', 'o3', 'o3-pro'] },
            { label: 'Fast & Efficient', desc: 'Summarization, classification, simple Q&A, drafting', examples: ['claude-haiku-4-5', 'gpt-6-luna', 'gpt-5-nano', 'gpt-4-1-nano'] },
            { label: 'Coding', desc: 'Code generation, debugging, refactoring, agents', examples: ['claude-sonnet-5', 'o4-mini', 'o3-mini', 'gpt-4-1'] },
            { label: 'Long Documents', desc: 'Research papers, case studies, large documents (1M+ context)', examples: ['gpt-4-1', 'gpt-4-1-mini', 'claude-fable-5-1', 'claude-sonnet-5'] },
          ].map((cat) => (
            <div key={cat.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-1">{cat.label}</h4>
              <p className="text-xs text-slate-500 mb-3">{cat.desc}</p>
              <div className="flex flex-wrap gap-1">
                {cat.examples.map((id) => {
                  const m = MODELS.find((x) => x.id === id);
                  return m ? (
                    <span key={id} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-600">{m.name}</span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model cards */}
      <div className="space-y-3">
        {filtered.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </div>
  );
};
