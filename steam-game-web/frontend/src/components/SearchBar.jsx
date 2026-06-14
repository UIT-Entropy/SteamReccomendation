import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onSearch, placeholder = "Search for games by name, tag, developer..." }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div class="relative w-full max-w-2xl">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search class="h-5 w-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        class="block w-full pl-10 pr-10 py-3 border border-steam-accent/30 rounded-lg bg-steam-cardBg/90 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-steam-blue focus:border-steam-blue transition-all shadow-lg"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
        >
          <X class="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
