import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Retrieving Steam data...", cardsCount = 4 }) {
  const dummyCards = Array.from({ length: cardsCount });

  return (
    <div class="space-y-8 py-6">
      {/* Spinner and message */}
      <div class="flex flex-col items-center justify-center space-y-3 py-10">
        <Loader2 class="h-10 w-10 text-steam-blue animate-spin" />
        <p class="text-sm font-semibold text-slate-400 tracking-wide">
          {message}
        </p>
      </div>

      {/* Loading cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyCards.map((_, index) => (
          <div
            key={index}
            class="bg-steam-cardBg border border-steam-accent/10 rounded-lg overflow-hidden h-[380px] flex flex-col space-y-4 p-4 shadow"
          >
            <div class="aspect-[16/9] w-full rounded shimmer shrink-0" />
            
            <div class="space-y-3 flex-grow">
              <div class="h-5 w-3/4 rounded shimmer" />
              <div class="h-3 w-1/2 rounded shimmer" />
              <div class="h-8 w-full rounded shimmer" />
            </div>
            
            <div class="grid grid-cols-2 gap-2 mt-auto">
              <div class="h-8 rounded shimmer" />
              <div class="h-8 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
