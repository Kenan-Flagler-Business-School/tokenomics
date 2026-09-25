import React from 'react';

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: string;
}

export const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, badge }) => (
  <section id={id} className="scroll-mt-20 py-10">
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
        {badge && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-slate-500 max-w-2xl">{subtitle}</p>}
      <div className="mt-3 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
    {children}
  </section>
);
