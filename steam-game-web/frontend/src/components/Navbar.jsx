import React from 'react';
import { Gamepad2, Compass, Network, BookOpen } from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'explore', label: 'Explore Games', icon: Compass },
    { id: 'recommend', label: 'Similar Games', icon: Network }
  ];

  return (
    <header class="bg-steam-darkBlue border-b border-black/40 sticky top-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          {/* Logo */}
          <div 
            class="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div class="bg-steam-cardBg border border-steam-accent/40 text-steam-blue p-1.5 rounded group-hover:border-steam-blue/60 transition-colors duration-200">
              <Gamepad2 class="h-5 w-5 font-bold" />
            </div>
            <div>
              <span class="text-base font-bold tracking-wider font-display text-slate-100">
                STEAM GAMES
              </span>
              <span class="text-[10px] block text-steam-accent font-semibold tracking-widest uppercase -mt-1">
                Catalog Explorer
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav class="flex space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'explore' && currentPage === 'detail');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  class={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-steam-lightBg text-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-steam-cardBgHover/50'
                  }`}
                >
                  <Icon class="h-4 w-4" />
                  <span class="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
