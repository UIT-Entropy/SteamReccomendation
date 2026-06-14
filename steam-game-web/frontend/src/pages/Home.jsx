import React, { useState, useEffect } from 'react';
import { getStats, getGames } from '../api';
import StatCard from '../components/StatCard';
import GameGrid from '../components/GameGrid';
import { Database, Tag, MessageSquare, Flame, CheckCircle, ArrowRight, Search, TrendingUp } from 'lucide-react';

export default function Home({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadHomeData = async () => {
      try {
        const statsData = await getStats();
        const gamesData = await getGames({ page: 1, limit: 4, sort_by: "rank", order: "asc" });
        
        if (isMounted) {
          setStats(statsData);
          setFeaturedGames(gamesData.items);
        }
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div class="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dataset header */}
      <section class="bg-steam-cardBg border border-steam-accent/30 rounded overflow-hidden shadow-steam-glow">
        <div class="grid grid-cols-1 lg:grid-cols-[1.45fr_0.85fr]">
          <div class="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-steam-accent/20">
            <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-steam-green mb-4">
              <Database class="h-4 w-4" />
              <span>Cleaned Steam Catalog</span>
            </div>

            <h1 class="text-3xl md:text-4xl font-extrabold font-display leading-tight text-slate-100">
              Steam Game Explorer
            </h1>

            <p class="mt-4 max-w-2xl text-slate-300 text-base leading-relaxed">
              Browse cleaned Steam game records, inspect review and price signals, then compare similar games from the recommendation API.
            </p>

            <div class="flex flex-wrap gap-3 pt-6">
              <button
                onClick={() => onNavigate('explore')}
                class="bg-steam-green hover:bg-lime-300 text-steam-darkBg font-bold py-2.5 px-5 rounded transition-colors flex items-center text-sm cursor-pointer"
              >
                Browse Games
                <ArrowRight class="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={() => onNavigate('recommend')}
                class="bg-steam-darkBlue border border-steam-accent/50 hover:border-steam-blue/60 text-slate-100 font-semibold py-2.5 px-5 rounded transition-colors text-sm cursor-pointer flex items-center space-x-2"
              >
                <Search class="h-4 w-4 text-steam-blue" />
                <span>Find Similar</span>
              </button>
            </div>
          </div>

          <div class="bg-steam-darkBlue/70 p-6 md:p-8">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Pipeline Status</p>
            <div class="space-y-3 text-sm">
              {[
                ['Raw data', 'data/raw/SteamGames.csv'],
                ['Cleaned data', 'data/processed/SteamGames_cleaned.csv'],
                ['Backend API', 'localhost:8000'],
                ['Frontend', 'localhost:3000']
              ].map(([label, value]) => (
                <div key={label} class="flex items-start gap-3 border-b border-steam-accent/15 pb-3 last:border-0 last:pb-0">
                  <CheckCircle class="h-4 w-4 text-steam-green mt-0.5 shrink-0" />
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-200">{label}</p>
                    <p class="text-xs text-slate-500 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Statistics */}
      <section class="space-y-6">
        <div class="flex items-center space-x-2 border-b border-steam-accent/10 pb-3">
          <TrendingUp class="h-5 w-5 text-steam-blue" />
          <h2 class="font-display font-bold text-xl text-slate-100">Dataset Overview</h2>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Cleaned Games"
            value={stats?.total_games}
            icon={Database}
            color="text-steam-blue"
          />
          <StatCard
            label="Free to Play Games"
            value={stats?.free_games}
            icon={CheckCircle}
            color="text-steam-green"
          />
          <StatCard
            label="Unique Gaming Tags"
            value={stats?.unique_tags}
            icon={Tag}
            color="text-steam-accent"
          />
          <StatCard
            label="Aggregated Reviews"
            value={stats?.total_reviews}
            icon={MessageSquare}
            color="text-slate-300"
          />
        </div>
      </section>

      {/* Featured / Top Ranked Games Showcase */}
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-steam-accent/10 pb-3">
          <div class="flex items-center space-x-2">
            <Flame class="h-5 w-5 text-steam-green" />
            <h2 class="font-display font-bold text-xl text-slate-100">Top-Ranked Steam Games</h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            class="text-xs font-semibold text-steam-blue hover:underline flex items-center"
          >
            Browse all
            <ArrowRight class="h-3 w-3 ml-1" />
          </button>
        </div>

        {loading ? (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} class="bg-steam-cardBg border border-steam-accent/10 rounded-lg overflow-hidden h-[360px] shimmer" />
            ))}
          </div>
        ) : (
          <GameGrid
            games={featuredGames}
            onViewDetail={(id) => onNavigate('detail', id)}
            onViewRecommendations={(id) => onNavigate('recommend', id)}
            onTagClick={(tag) => onNavigate('explore', { tag })}
          />
        )}
      </section>
    </div>
  );
}
