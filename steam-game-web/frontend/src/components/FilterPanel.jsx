import React from 'react';
import { Filter, RotateCcw, ArrowUpDown, DollarSign } from 'lucide-react';

export default function FilterPanel({
  tags,
  developers,
  publishers,
  selectedTag,
  setSelectedTag,
  selectedDev,
  setSelectedDev,
  selectedPub,
  setSelectedPub,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  freeOnly,
  setFreeOnly,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset
}) {
  const sortOptions = [
    { value: 'rank', label: 'Steam Rank' },
    { value: 'name', label: 'Alphabetical' },
    { value: 'price', label: 'Price' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'total_reviews', label: 'Total Reviews' },
    { value: 'review_ratio', label: 'Review Score' }
  ];

  return (
    <div class="bg-steam-cardBg border border-steam-accent/20 rounded-lg p-5 shadow-md flex flex-col space-y-6">
      
      {/* Header */}
      <div class="flex items-center justify-between border-b border-steam-accent/10 pb-3">
        <h3 class="font-display font-bold text-sm uppercase tracking-wider text-slate-300 flex items-center">
          <Filter class="h-4 w-4 mr-2 text-steam-blue" />
          Filter & Sort
        </h3>
        <button
          onClick={onReset}
          class="text-xs text-slate-400 hover:text-steam-blue flex items-center transition-colors"
        >
          <RotateCcw class="h-3 w-3 mr-1" />
          Reset All
        </button>
      </div>

      {/* Sorting */}
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Sort Results By
        </label>
        <div class="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            class="block w-full bg-steam-darkBg border border-steam-accent/30 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-steam-blue focus:border-steam-blue"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Toggle sort order (current: ${sortOrder.toUpperCase()})`}
            class="bg-steam-darkBg border border-steam-accent/30 hover:border-steam-blue rounded p-2 text-slate-300 hover:text-steam-blue transition-colors flex items-center justify-center shrink-0"
          >
            <ArrowUpDown class="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tags Dropdown */}
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Game Tag
        </label>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          class="block w-full bg-steam-darkBg border border-steam-accent/30 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-steam-blue focus:border-steam-blue"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t.tag} value={t.tag}>
              {t.tag} ({t.count.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {/* Price Filtering */}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Price Range
          </label>
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              class="rounded bg-steam-darkBg border-steam-accent/30 text-steam-blue focus:ring-steam-blue focus:ring-offset-0 h-4 w-4"
            />
            <span class="text-xs text-slate-300">Free Only</span>
          </label>
        </div>

        {!freeOnly && (
          <div class="flex items-center space-x-2">
            <div class="relative w-full">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-xs text-slate-500">
                Min
              </span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                class="block w-full pl-9 pr-2 py-1.5 bg-steam-darkBg border border-steam-accent/30 rounded text-sm text-slate-200 focus:outline-none focus:border-steam-blue"
              />
            </div>
            <span class="text-slate-500 text-xs">-</span>
            <div class="relative w-full">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-xs text-slate-500">
                Max
              </span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="200"
                min="0"
                class="block w-full pl-9 pr-2 py-1.5 bg-steam-darkBg border border-steam-accent/30 rounded text-sm text-slate-200 focus:outline-none focus:border-steam-blue"
              />
            </div>
          </div>
        )}
      </div>

      {/* Developer Dropdown / Text Search */}
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Developer
        </label>
        <div class="relative">
          <input
            type="text"
            list="developers-list"
            value={selectedDev}
            onChange={(e) => setSelectedDev(e.target.value)}
            placeholder="Type developer name..."
            class="block w-full bg-steam-darkBg border border-steam-accent/30 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-steam-blue focus:border-steam-blue"
          />
          <datalist id="developers-list">
            {developers.map((d) => (
              <option key={d.developer} value={d.developer} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Publisher Dropdown / Text Search */}
      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Publisher
        </label>
        <div class="relative">
          <input
            type="text"
            list="publishers-list"
            value={selectedPub}
            onChange={(e) => setSelectedPub(e.target.value)}
            placeholder="Type publisher name..."
            class="block w-full bg-steam-darkBg border border-steam-accent/30 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-steam-blue focus:border-steam-blue"
          />
          <datalist id="publishers-list">
            {publishers.map((p) => (
              <option key={p.publisher} value={p.publisher} />
            ))}
          </datalist>
        </div>
      </div>

    </div>
  );
}
