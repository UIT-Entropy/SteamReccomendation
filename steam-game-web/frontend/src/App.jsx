import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import GameDetail from './pages/GameDetail';
import Recommendation from './pages/Recommendation';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Page state
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [exploreParams, setExploreParams] = useState(null);
  const [recommendGameId, setRecommendGameId] = useState(null);

  // Local router for the demo app
  const handleNavigate = (page, params = null) => {
    setCurrentPage(page);
    
    if (page === 'detail') {
      setSelectedGameId(params);
    } else if (page === 'explore') {
      if (params) {
        setExploreParams(params);
      }
    } else if (page === 'recommend') {
      if (params) {
        setRecommendGameId(params);
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearExploreParams = () => setExploreParams(null);
  const clearRecommendGameId = () => setRecommendGameId(null);

  // Render active page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'explore':
        return (
          <Explore
            initialParams={exploreParams}
            onNavigate={handleNavigate}
            clearInitialParams={clearExploreParams}
          />
        );
      case 'detail':
        return (
          <GameDetail
            gameId={selectedGameId}
            onNavigate={handleNavigate}
          />
        );
      case 'recommend':
        return (
          <Recommendation
            initialGameId={recommendGameId}
            onNavigate={handleNavigate}
            clearInitialGameId={clearRecommendGameId}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div class="min-h-screen bg-steam-darkBg flex flex-col justify-between">
      <div class="flex flex-col">
        {/* Navigation */}
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
        
        {/* Active page */}
        <main class="flex-grow pb-16">
          {renderPage()}
        </main>
      </div>

      {/* Footer */}
      <footer class="bg-steam-darkBlue border-t border-steam-accent/20 py-8 text-xs text-slate-500 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center space-x-2">
            <div class="bg-slate-800 p-1.5 rounded text-slate-400">
              <Gamepad2 class="h-4 w-4" />
            </div>
            <div>
              <p class="font-semibold text-slate-400">Steam Game Explorer</p>
              <p>2026 Presentation Demo. Cleaned dataset platform.</p>
            </div>
          </div>
          <div class="flex space-x-6 text-slate-400">
            <button onClick={() => handleNavigate('home')} class="hover:text-steam-blue transition-colors cursor-pointer">Dashboard</button>
            <button onClick={() => handleNavigate('explore')} class="hover:text-steam-blue transition-colors cursor-pointer">Explorer</button>
            <button onClick={() => handleNavigate('recommend')} class="hover:text-steam-blue transition-colors cursor-pointer">Similar Games</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
