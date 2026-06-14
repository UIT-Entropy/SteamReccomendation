import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../api';
import GameGrid from './GameGrid';
import { Network, AlertCircle } from 'lucide-react';

export default function RecommendationPanel({ gameId, topN = 12, onViewDetail, onViewRecommendations, onTagClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameId === undefined || gameId === null) return;

    let isMounted = true;
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecommendations(gameId, topN);
        if (isMounted) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        if (isMounted) {
          setError("Could not load recommendations at this time.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [gameId, topN]);

  if (gameId === undefined || gameId === null) return null;

  return (
    <div class="space-y-6">
      <div class="flex items-center space-x-2 border-b border-steam-accent/20 pb-3">
        <Network class="h-5 w-5 text-steam-blue" />
        <h2 class="font-display font-bold text-xl text-slate-100">
          Similar Games
        </h2>
      </div>

      {loading ? (
        <div class="flex flex-col items-center justify-center py-10 space-y-2">
          <div class="h-6 w-6 border-2 border-steam-blue border-t-transparent rounded-full animate-spin" />
          <span class="text-xs text-slate-400 font-semibold">Computing similarity...</span>
        </div>
      ) : error ? (
        <div class="flex items-center space-x-2 text-orange-400 bg-orange-400/5 border border-orange-400/25 p-4 rounded-md">
          <AlertCircle class="h-5 w-5 shrink-0" />
          <span class="text-sm font-medium">{error}</span>
        </div>
      ) : recommendations.length === 0 ? (
        <p class="text-slate-400 italic text-sm">No similar games found in the dataset.</p>
      ) : (
        <GameGrid
          games={recommendations}
          onViewDetail={onViewDetail}
          onViewRecommendations={onViewRecommendations}
          onTagClick={onTagClick}
        />
      )}
    </div>
  );
}
