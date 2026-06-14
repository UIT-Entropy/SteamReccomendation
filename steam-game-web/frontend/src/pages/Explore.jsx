import React, { useState, useEffect } from 'react';
import { getGames, getTags, getDevelopers, getPublishers } from '../api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import GameGrid from '../components/GameGrid';
import Pagination from '../components/Pagination';
import LoadingState from '../components/LoadingState';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';

export default function Explore({ initialParams, onNavigate, clearInitialParams }) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(initialParams?.tag || "");
  const [selectedDev, setSelectedDev] = useState("");
  const [selectedPub, setSelectedPub] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Pagination & items
  const [page, setPage] = useState(1);
  const [gamesData, setGamesData] = useState({ items: [], total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Metadata dropdowns
  const [tagsList, setTagsList] = useState([]);
  const [devsList, setDevsList] = useState([]);
  const [pubsList, setPubsList] = useState([]);

  // Fetch dropdown metadata once at mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [tags, devs, pubs] = await Promise.all([
          getTags(),
          getDevelopers(),
          getPublishers()
        ]);
        setTagsList(tags);
        setDevsList(devs);
        setPubsList(pubs);
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Handle incoming initial parameter changes (e.g. tag clicks from home/details)
  useEffect(() => {
    if (initialParams) {
      if (initialParams.tag) {
        setSelectedTag(initialParams.tag);
        setPage(1);
      }
      clearInitialParams(); // Reset the trigger
    }
  }, [initialParams, clearInitialParams]);

  // Main games data query fetch
  useEffect(() => {
    let isMounted = true;
    const fetchGameItems = async () => {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page,
        limit: 24,
        q: searchQuery,
        tag: selectedTag,
        developer: selectedDev,
        publisher: selectedPub,
        free_only: freeOnly,
        sort_by: sortBy,
        order: sortOrder
      };

      if (minPrice !== "" && !freeOnly) queryParams.min_price = parseFloat(minPrice);
      if (maxPrice !== "" && !freeOnly) queryParams.max_price = parseFloat(maxPrice);

      try {
        const data = await getGames(queryParams);
        if (isMounted) {
          setGamesData(data);
        }
      } catch (err) {
        console.error("Failed to load games list:", err);
        if (isMounted) {
          setError("Failed to load games. Please check if the backend server is running.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchGameItems();
    }, 300); // 300ms debounce for typed inputs

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [page, searchQuery, selectedTag, selectedDev, selectedPub, minPrice, maxPrice, freeOnly, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
    setSelectedDev("");
    setSelectedPub("");
    setMinPrice("");
    setMaxPrice("");
    setFreeOnly(false);
    setSortBy("rank");
    setSortOrder("asc");
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Search and Title Section */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-100 font-display">
            Explore Steam Games
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            Showing {gamesData.total.toLocaleString()} games available in database
          </p>
        </div>
        <div class="flex-grow max-w-xl md:ml-4">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            placeholder="Search game title, developer, tag, description..."
          />
        </div>
      </div>

      {/* Main Grid & Filter Panel Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters */}
        <div class="lg:col-span-1 sticky top-20">
          <FilterPanel
            tags={tagsList}
            developers={devsList}
            publishers={pubsList}
            selectedTag={selectedTag}
            setSelectedTag={(t) => { setSelectedTag(t); setPage(1); }}
            selectedDev={selectedDev}
            setSelectedDev={(d) => { setSelectedDev(d); setPage(1); }}
            selectedPub={selectedPub}
            setSelectedPub={(p) => { setSelectedPub(p); setPage(1); }}
            minPrice={minPrice}
            setMinPrice={(p) => { setMinPrice(p); setPage(1); }}
            maxPrice={maxPrice}
            setMaxPrice={(p) => { setMaxPrice(p); setPage(1); }}
            freeOnly={freeOnly}
            setFreeOnly={(f) => { setFreeOnly(f); setPage(1); }}
            sortBy={sortBy}
            setSortBy={(s) => { setSortBy(s); setPage(1); }}
            sortOrder={sortOrder}
            setSortOrder={(o) => { setSortOrder(o); setPage(1); }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Game Grid and Pagination */}
        <div class="lg:col-span-3 space-y-6">
          {error ? (
            <div class="flex items-center space-x-2 text-red-400 bg-red-500/5 border border-red-500/25 p-5 rounded-lg">
              <AlertCircle class="h-6 w-6 shrink-0 animate-bounce" />
              <div>
                <p class="font-bold">Error loading dataset</p>
                <p class="text-sm text-slate-400">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <LoadingState message="Scanning Steam index files..." cardsCount={8} />
          ) : (
            <>
              <GameGrid
                games={gamesData.items}
                onViewDetail={(id) => onNavigate('detail', id)}
                onViewRecommendations={(id) => onNavigate('recommend', id)}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
              
              <Pagination
                currentPage={page}
                totalPages={gamesData.total_pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
