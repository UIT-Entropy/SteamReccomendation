import React from 'react';
import GameCard from './GameCard';
import { Ghost } from 'lucide-react';

export default function GameGrid({ games, onViewDetail, onViewRecommendations, onTagClick }) {
  if (!games || games.length === 0) {
    return (
      <div class="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-steam-accent/20 rounded-xl bg-steam-cardBg/30">
        <Ghost class="h-16 w-16 text-slate-500 mb-4 animate-bounce" />
        <h3 class="text-xl font-semibold text-slate-300 mb-2">No games found</h3>
        <p class="text-slate-500 max-w-md">
          We couldn't find any Steam games matching your criteria. Try widening your filters or modifying your search query!
        </p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard
          key={game.game_id}
          game={game}
          onViewDetail={onViewDetail}
          onViewRecommendations={onViewRecommendations}
          onTagClick={onTagClick}
          similarityScore={game.similarity_score}
          sharedTags={game.shared_tags}
          explanation={game.explanation}
        />
      ))}
    </div>
  );
}
