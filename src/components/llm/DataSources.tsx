import React from 'react';
import { ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { MODELS } from '../../data/models';

const SOURCES = [
  {
    provider: 'Anthropic',
    color: 'orange',
    links: [
      { label: 'Model Overview', url: 'https://docs.anthropic.com/en/docs/about-claude/models', desc: 'Official list of available Claude models with IDs and capabilities' },
      { label: 'Pricing', url: 'https://www.anthropic.com/pricing', desc: 'Current pricing for all Claude models' },
      { label: 'API Documentation', url: 'https://docs.anthropic.com', desc: 'Full Claude API reference' },
      { label: 'Prompt Caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', desc: 'How prompt caching works and supported models' },
    ],
  },
  {
    provider: 'OpenAI',
    color: 'green',
    links: [
      { label: 'Models Overview', url: 'https://platform.openai.com/docs/models', desc: 'Official list of available OpenAI models with capabilities' },
      { label: 'Pricing', url: 'https://openai.com/pricing', desc: 'Current pricing for all OpenAI models' },
      { label: 'API Documentation', url: 'https://platform.openai.com/docs', desc: 'Full OpenAI API reference' },
      { label: 'Prompt Caching', url: 'https://platform.openai.com/docs/guides/prompt-caching', desc: 'How prompt caching works in the OpenAI API' },
    ],
  },
];

const verifiedModels = MODELS.filter((m) => m.pricingVerified);
const estimatedModels = MODELS.filter((m) => !m.pricingVerified);

export const DataSources: React.FC = () => {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Data Sources & Pricing</h2>
        <p className="text-sm text-slate-500">
          All model data is sourced from official provider documentation. Verify current pricing before
          making procurement or budgeting decisions.
        </p>
      </div>

      {/* Important notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong>Pricing verification required.</strong> AI model pricing changes frequently as providers update
          their offerings. This application stores pricing data that was accurate at the time of writing, but
          some models — particularly newer ones — may have different current pricing. Always verify at the
          official provider website before making budget or cost decisions.
        </div>
      </div>

      {/* Provider sources */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {SOURCES.map(({ provider, color, links }) => (
          <div key={provider} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className={`px-5 py-3 border-b border-slate-100 ${color === 'orange' ? 'bg-orange-50' : 'bg-green-50'}`}>
              <div className="font-semibold text-slate-800">{provider}</div>
            </div>
            <div className="p-4 space-y-3">
              {links.map(({ label, url, desc }) => (
                <div key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 mb-0.5"
                  >
                    {label}
                    <ExternalLink size={12} />
                  </a>
                  <div className="text-xs text-slate-500">{desc}</div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5 truncate">{url}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Model verification status */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="font-semibold text-slate-700 text-sm">Model Pricing Verification Status</div>
        </div>
        <div className="p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={15} className="text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Verified pricing ({verifiedModels.length} models)</span>
              </div>
              <div className="space-y-1">
                {verifiedModels.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-100 last:border-0">
                    <span>{m.name}</span>
                    <span className="text-slate-400">Verified {m.pricingLastVerified}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={15} className="text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Estimated pricing ({estimatedModels.length} models)</span>
              </div>
              <div className="space-y-1">
                {estimatedModels.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-100 last:border-0">
                    <span>{m.name}</span>
                    <a
                      href={m.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-0.5"
                    >
                      Verify <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                These models were released or updated after the last verified data snapshot.
                Pricing shown is estimated based on comparable models.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
        <div className="font-semibold text-slate-700">Educational Use Disclaimer</div>
        <p>
          This application is an educational tool designed for Kenan-Flagler Business School students, faculty, and researchers to
          understand LLM capabilities and API pricing concepts. It does not constitute financial advice,
          procurement recommendations, or endorsement of any specific AI provider or model.
        </p>
        <p>
          All pricing data, model capabilities, and cost estimates are for educational illustration only.
          Actual costs depend on your specific usage patterns, provider agreements, and any applicable
          volume discounts, enterprise pricing, or promotional rates. Always consult official provider
          documentation and your institution's procurement policies before making purchasing decisions.
        </p>
        <p>
          Model capabilities described here reflect publicly available documentation and may not capture
          the full range of each model's performance across all tasks and domains.
        </p>
      </div>
    </div>
  );
};
