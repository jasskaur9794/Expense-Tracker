import React from 'react';

const Table = ({ headers, children, loading = false, colCount = 5 }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {loading ? (
            // Skeleton Loading State
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {Array.from({ length: colCount }).map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-5">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
