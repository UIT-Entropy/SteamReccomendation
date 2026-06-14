import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Calculate sliding window of pages
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // number of pages to show before and after current page

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (start > 2) {
      pages.push('ellipsis1');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('ellipsis2');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div class="flex items-center justify-center space-x-1 sm:space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        class="bg-steam-cardBg border border-steam-accent/20 hover:border-steam-blue text-slate-300 hover:text-steam-blue disabled:opacity-40 disabled:hover:border-steam-accent/20 disabled:hover:text-slate-300 p-2 rounded transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((p, idx) => {
        if (p === 'ellipsis1' || p === 'ellipsis2') {
          return (
            <span key={`ellipsis-${idx}`} class="px-2 py-1 text-slate-500 select-none">
              ...
            </span>
          );
        }

        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            class={`px-3 py-1.5 rounded text-sm font-semibold transition-all duration-150 border ${
              isActive
                ? 'bg-steam-blue border-steam-blue text-steam-darkBg font-bold shadow-steam-glow'
                : 'bg-steam-cardBg border-steam-accent/20 text-slate-300 hover:border-steam-blue/60 hover:text-steam-blue'
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        class="bg-steam-cardBg border border-steam-accent/20 hover:border-steam-blue text-slate-300 hover:text-steam-blue disabled:opacity-40 disabled:hover:border-steam-accent/20 disabled:hover:text-slate-300 p-2 rounded transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  );
}
