import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * RoyalPagination Component
 * Ultra-luxury Sri Lankan Royal Heritage Design System
 * Reusable client-side pagination with smooth page windowing
 */
export const RoyalPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex flex-col items-center justify-center gap-2 mt-8 mb-4 select-none"
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border border-amber-500/30 text-amber-200 bg-neutral-900/80 hover:bg-amber-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        {/* Numbered Pills */}
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-9 flex items-center justify-center text-amber-400/60 font-serif text-sm select-none"
              >
                •••
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange && onPageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={
                isActive
                  ? 'w-9 h-9 rounded-xl font-serif font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 flex items-center justify-center border-0 cursor-default'
                  : 'w-9 h-9 rounded-xl font-serif text-sm border border-amber-500/20 text-stone-300 bg-neutral-900/60 hover:border-amber-400 hover:text-amber-200 transition-all flex items-center justify-center cursor-pointer'
              }
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border border-amber-500/30 text-amber-200 bg-neutral-900/80 hover:bg-amber-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Optional Range / Total Label */}
      {totalItems !== undefined && itemsPerPage !== undefined && totalItems > 0 && (
        <div className="text-xs text-stone-400 font-sans tracking-wide mt-1">
          Showing{' '}
          <span className="text-amber-300 font-semibold">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>
          {' – '}
          <span className="text-amber-300 font-semibold">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          of <span className="text-amber-300 font-semibold">{totalItems}</span> items
        </div>
      )}
    </nav>
  );
};

export default RoyalPagination;
