import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({
  title = 'No records found',
  description = 'Add a new transaction or adjust your filters to see entries.',
  icon: Icon = HelpCircle,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/20 backdrop-blur-xs">
      <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 mb-4 text-slate-400">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
