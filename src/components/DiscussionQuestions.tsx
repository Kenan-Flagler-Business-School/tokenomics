import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  hints: string[];
  category: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Does Axiom AI actually need a token?',
    category: 'Strategy',
    hints: [
      'What functionality requires a token that cannot be achieved with fiat payments, subscription pricing, or conventional loyalty points?',
      'Consider: what specific coordination or incentive problems does the token solve for this platform?',
      'Compare: Stripe, Twilio, and OpenAI all operate large API platforms without utility tokens. What would change if Axiom AI did the same?',
    ],
  },
  {
    id: 2,
    question: 'What creates fundamental demand for AXM beyond speculation?',
    category: 'Demand',
    hints: [
      'Which demand sources in the model represent genuine utility (compute payments, platform access) vs. financial speculation?',
      'What would happen to demand if the token price increased significantly? Would platform users consume more or fewer tokens?',
      'How does the mandatory payment fraction assumption affect your answer?',
    ],
  },
  {
    id: 3,
    question: 'How does token velocity affect the amount of supply required to support a given level of economic activity?',
    category: 'Economics',
    hints: [
      'Refer to the MV=PQ model. What does doubling velocity imply for the monetary base required at a fixed price?',
      'What behaviors would lower velocity (tokens held longer)? What would raise it?',
      'Is higher velocity good or bad for existing token holders? For the platform?',
    ],
  },
  {
    id: 4,
    question: 'What happens when token unlock rates outpace platform usage growth?',
    category: 'Supply',
    hints: [
      'Review the vesting schedule. When do large unlocks occur relative to expected user growth milestones?',
      'Under what conditions would new circulating supply be absorbed without impacting price?',
      'What mechanisms could a company use to manage excess supply? What are the tradeoffs?',
    ],
  },
  {
    id: 5,
    question: 'How does AI compute cost affect the long-term sustainability of the tokenomics model?',
    category: 'Operations',
    hints: [
      'If AI inference costs fall 80% over 5 years (as has historically happened), what changes in the model?',
      'If tokens are used to pay for compute, and compute costs fall, does token demand increase or decrease?',
      'How should the token design account for technological change in the underlying AI infrastructure?',
    ],
  },
  {
    id: 6,
    question: 'Should users be rewarded for holding AXM? What are the tradeoffs?',
    category: 'Incentives',
    hints: [
      'Staking rewards fund holders but must come from somewhere — typically inflation. Who bears the cost?',
      'Does incentivizing holding reduce velocity? How does that affect the monetary model?',
      'When platform utility is the primary value driver, what behavior should incentives encourage?',
    ],
  },
  {
    id: 7,
    question: 'What tradeoffs exist between decentralization and corporate control of the platform?',
    category: 'Governance',
    hints: [
      'Axiom AI is a corporation. Can it simultaneously decentralize governance and fulfill legal obligations to shareholders?',
      'What decisions should the community govern? What decisions require corporate judgment?',
      'What happens when community and shareholder interests conflict?',
    ],
  },
  {
    id: 8,
    question: 'How might mandatory token usage change user behavior?',
    category: 'Strategy',
    hints: [
      'If users must acquire AXM to access the platform, how does this affect the customer acquisition funnel?',
      'For enterprise customers, how does token exposure change procurement and contracting?',
      'Is there a risk that token requirements disadvantage Axiom AI relative to competitors without token requirements?',
    ],
  },
  {
    id: 9,
    question: 'What risks arise if token speculation becomes more important than platform utility?',
    category: 'Risk',
    hints: [
      'If speculative demand drives token price up, what happens to compute costs for users paying in AXM?',
      'How might regulatory bodies respond if the token becomes primarily a speculative instrument?',
      'What signals in real-world data would suggest speculation is dominating utility demand?',
    ],
  },
  {
    id: 10,
    question: 'Which model assumptions are most sensitive, and what are the implications for tokenomics design?',
    category: 'Modeling',
    hints: [
      'Use the sensitivity analysis table. Which input changes produce the largest changes in implied token price?',
      'If an assumption has high sensitivity, how should the design team account for that uncertainty?',
      'What assumptions are most likely to be wrong in practice? Why?',
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-blue-50 text-blue-700',
  Demand: 'bg-violet-50 text-violet-700',
  Economics: 'bg-emerald-50 text-emerald-700',
  Supply: 'bg-amber-50 text-amber-700',
  Operations: 'bg-orange-50 text-orange-700',
  Incentives: 'bg-pink-50 text-pink-700',
  Governance: 'bg-indigo-50 text-indigo-700',
  Risk: 'bg-red-50 text-red-700',
  Modeling: 'bg-teal-50 text-teal-700',
};

export const DiscussionQuestions: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
        The following questions are designed for Kenan-Flagler MBA-level discussion. They do not have single correct answers.
        Their purpose is to develop critical thinking about AI platform economics, token design tradeoffs, and
        the relationship between digital asset mechanisms and business fundamentals.
      </div>

      {QUESTIONS.map((q) => (
        <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === q.id ? null : q.id)}
            className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center">
                {q.id}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[q.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {q.category}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-snug">{q.question}</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-slate-400 mt-1">
              {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {expanded === q.id && (
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <MessageSquare size={12} />
                  Discussion Prompts
                </div>
                <ul className="space-y-2.5">
                  {q.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
