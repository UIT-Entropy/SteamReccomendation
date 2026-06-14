import React, { useState, useEffect, useRef } from 'react';
import { getGame, getRecommendations, getAutocomplete, recommendByName } from '../api';
import GameGrid from '../components/GameGrid';
import GameCard from '../components/GameCard';
import { Search, HelpCircle, Network, Gamepad2, Award } from 'lucide-react';

export default function Recommendation({ initialGameId, onNavigate, clearInitialGameId }) {
  const [searchVal, setSearchVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState(null);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load game selected from another page
  useEffect(() => {
    if (initialGameId !== undefined && initialGameId !== null) {
      handleSelectGameById(initialGameId);
      clearInitialGameId();
    }
  }, [initialGameId, clearInitialGameId]);

  // Fetch suggestions while typing
  useEffect(() => {
    if (!searchVal.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const results = await getAutocomplete(searchVal, 8);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchVal]);

  const handleSelectGameById = async (id) => {
    setLoading(true);
    setError(null);
    setShowDropdown(false);
    setSearchVal("");
    try {
      const gameDetail = await getGame(id);
      setSelectedGame(gameDetail);
      const recs = await getRecommendations(id, 12);
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to select game and load recommendations:", err);
      setError("Failed to generate recommendations for this game.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchVal.trim()) return;

    setLoading(true);
    setError(null);
    setShowDropdown(false);
    try {
      const data = await recommendByName(searchVal, 12);
      if (data.selected_game) {
        setSelectedGame(data.selected_game);
        setRecommendations(data.recommendations);
        setSearchVal("");
      } else {
        setError(`No games matched the search term "${searchVal}".`);
      }
    } catch (err) {
      console.error("Recommendation by name search failed:", err);
      setError("Error trying to search for game by name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <section class="text-center max-w-3xl mx-auto space-y-4">
        <h1 class="text-3xl font-extrabold text-slate-100 font-display flex items-center justify-center">
          <Network class="h-8 w-8 text-steam-blue mr-3" />
          Find Similar Games
        </h1>
        <p class="text-slate-400 text-sm leading-relaxed">
          Search for a game and compare it with similar Steam releases using tags, descriptions, genres, developers, and publishers.
        </p>
      </section>

      {/* Autocomplete Search Bar */}
      <div class="max-w-xl mx-auto relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} class="relative flex items-center shadow-2xl rounded-lg">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search class="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Type a game name (e.g. Witcher, Portal, Half-Life)..."
            class="block w-full pl-10 pr-24 py-3.5 border border-steam-accent/40 rounded-lg bg-steam-cardBg/90 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-steam-blue focus:border-steam-blue transition-all"
          />
          <button
            type="submit"
            class="absolute right-2 bg-steam-blue text-steam-darkBg font-bold px-4 py-2 rounded text-xs hover:bg-sky-300 transition-colors cursor-pointer"
          >
            Find Similar
          </button>
        </form>

        {/* Suggestions absolute dropdown */}
        {showDropdown && (
          <div class="absolute z-50 left-0 right-0 mt-1 border border-steam-accent/30 rounded-lg bg-steam-cardBg shadow-2xl overflow-hidden divide-y divide-steam-accent/15 max-h-80 overflow-y-auto">
            {suggestions.map((sug) => (
              <div
                key={sug.game_id}
                onClick={() => handleSelectGameById(sug.game_id)}
                class="flex items-center space-x-3 p-3 hover:bg-steam-cardBgHover cursor-pointer transition-colors"
              >
                <img
                  src={sug.Thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100&auto=format&fit=crop"}
                  alt={sug.Name}
                  class="h-10 w-16 object-cover rounded border border-steam-accent/10"
                  onError={(e) => e.target.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=100&auto=format&fit=crop"}
                />
                <div class="flex-grow min-w-0">
                  <p class="text-sm font-semibold text-slate-100 truncate">{sug.Name}</p>
                  <p class="text-xs text-steam-blue font-bold">{sug.price_display}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Method note */}
      <section class="max-w-4xl mx-auto bg-steam-cardBg/30 border border-steam-accent/10 rounded-lg p-5 flex items-start space-x-4">
        <HelpCircle class="h-6 w-6 text-steam-blue shrink-0 mt-0.5" />
        <div class="space-y-1">
          <h3 class="text-xs font-bold tracking-wide uppercase text-slate-300">Recommendation Method</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            The backend builds TF-IDF text vectors from selected game fields, then ranks other games by cosine similarity and returns the closest matches.
          </p>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div class="max-w-2xl mx-auto p-4 rounded-lg bg-orange-400/5 border border-orange-400/20 text-orange-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Results Workspace Layout */}
      {loading ? (
        <div class="flex flex-col items-center justify-center py-20 space-y-3">
          <div class="h-8 w-8 border-3 border-steam-blue border-t-transparent rounded-full animate-spin" />
          <span class="text-sm text-slate-400 font-semibold">Computing similarity...</span>
        </div>
      ) : selectedGame ? (
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left panel: selected game details */}
          <div class="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
            <h2 class="font-display font-bold text-sm uppercase tracking-wider text-slate-400 block border-b border-steam-accent/15 pb-2">
              Selected Game
            </h2>
            <GameCard
              game={selectedGame}
              onViewDetail={(id) => onNavigate('detail', id)}
              onViewRecommendations={handleSelectGameById}
              onTagClick={(tag) => onNavigate('explore', { tag })}
            />
          </div>

          {/* Right panel: recommendations */}
          <div class="lg:col-span-3 space-y-6">
            <div class="flex items-center space-x-2 border-b border-steam-accent/15 pb-3">
              <Award class="h-5 w-5 text-steam-green" />
              <h2 class="font-display font-bold text-lg text-slate-100">
                Recommended Similar Releases ({recommendations.length})
              </h2>
            </div>
            
            <GameGrid
              games={recommendations}
              onViewDetail={(id) => onNavigate('detail', id)}
              onViewRecommendations={handleSelectGameById}
              onTagClick={(tag) => onNavigate('explore', { tag })}
            />
          </div>

        </div>
      ) : (
        /* Empty State */
        <div class="flex flex-col items-center justify-center py-20 text-center border border-dashed border-steam-accent/10 rounded-xl max-w-xl mx-auto bg-steam-cardBg/10">
          <Gamepad2 class="h-16 w-16 text-slate-600 mb-4" />
          <h3 class="text-lg font-semibold text-slate-300 mb-1">No game selected</h3>
          <p class="text-sm text-slate-500 max-w-sm px-4">
            Type the name of a Steam game in the search bar above to get recommendations instantly.
          </p>
        </div>
      )}

    </div>
  );
}
