import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

interface InfoBoxProps {
  type?: 'info' | 'formula' | 'warning' | 'note';
  title?: string;
  children: React.ReactNode;
  showInProfessorMode?: boolean;
  professorMode?: boolean;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  type = 'info',
  title,
  children,
  showInProfessorMode,
  professorMode,
}) => {
  if (showInProfessorMode && !professorMode) return null;

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    formula: 'bg-slate-50 border-slate-200 text-slate-700 font-mono',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    note: 'bg-violet-50 border-violet-200 text-violet-800',
  };

  const icons = {
    info: <BookOpen size={14} className="flex-shrink-0 mt-0.5" />,
    formula: <span className="text-xs font-bold flex-shrink-0">f(x)</span>,
    warning: <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />,
    note: <BookOpen size={14} className="flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`border rounded-xl p-4 text-xs leading-relaxed ${styles[type]}`}>
      <div className="flex gap-2.5">
        {icons[type]}
        <div>
          {title && <div className="font-semibold mb-1">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
};
