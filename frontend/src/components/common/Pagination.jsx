import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange, totalResults, resultsPerPage }) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * resultsPerPage + 1;
  const endIdx = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 space-y-3 sm:space-y-0">
      {/* Metrics summary */}
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{startIdx}</span> to{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{endIdx}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{totalResults}</span> entries
      </span>

      {/* Toggler buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-3">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
