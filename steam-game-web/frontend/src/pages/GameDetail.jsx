import React, { useState, useEffect } from 'react';
import { getGame } from '../api';
import TagBadge from '../components/TagBadge';
import RecommendationPanel from '../components/RecommendationPanel';
import { ChevronLeft, Calendar, User, ShoppingBag, ThumbsUp, ThumbsDown, Monitor, HardDrive, Cpu, ExternalLink, Info } from 'lucide-react';

const formatMemory = (mb) => {
  if (!mb || mb === 0) return "No Requirement";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1).replace('.0', '')} GB RAM`;
  return `${mb} MB RAM`;
};

const getReviewScoreDetails = (score, ratio) => {
  const percent = Math.round(ratio * 100);
  if (score >= 9) return { text: "Overwhelmingly Positive", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 8) return { text: "Very Positive", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 7) return { text: "Positive", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 6) return { text: "Mostly Positive", color: "text-teal-400", bg: "bg-teal-500/10" };
  if (score >= 5) return { text: "Mixed", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (score >= 4) return { text: "Mostly Negative", color: "text-orange-400", bg: "bg-orange-500/10" };
  return { text: "Negative", color: "text-red-500", bg: "bg-red-500/10" };
};

export default function GameDetail({ gameId, onNavigate }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (gameId === undefined || gameId === null) return;
    
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGame(gameId);
        if (isMounted) {
          setGame(data);
          setImgSrc(data.Thumbnail);
        }
      } catch (err) {
        console.error("Failed to load game detail:", err);
        if (isMounted) {
          setError("Failed to fetch game details. It might have been deleted or the API is offline.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    
    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const handleImageError = () => {
    setImgSrc("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop");
  };

  if (loading) {
    return (
      <div class="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div class="h-10 w-10 border-4 border-steam-blue border-t-transparent rounded-full animate-spin" />
        <span class="text-sm text-slate-400 font-semibold">Loading game details...</span>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="bg-red-500/5 border border-red-500/25 p-5 rounded-lg text-center max-w-lg mx-auto">
          <Info class="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 class="text-lg font-bold text-white mb-1">Could not find game</h3>
          <p class="text-sm text-slate-400 mb-4">{error || "Game not found."}</p>
          <button
            onClick={() => onNavigate('explore')}
            class="bg-steam-blue text-steam-darkBg font-bold py-2 px-4 rounded text-sm hover:bg-sky-300"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const {
    Appid,
    Name,
    Type,
    ReleaseDate,
    release_year,
    Developers,
    Publishers,
    Description,
    price,
    price_display,
    tag_list,
    ReviewScore,
    PositiveReview,
    NegativeReview,
    TotalReviews,
    ReviewRatio,
    OsRequirement,
    MemoryRequirement,
    CpuRequirement,
    Rank
  } = game;

  const reviewInfo = getReviewScoreDetails(ReviewScore, ReviewRatio);
  const positivePercentage = TotalReviews > 0 ? Math.round((PositiveReview / TotalReviews) * 100) : 0;
  const negativePercentage = 100 - positivePercentage;

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* Back navigation */}
      <div>
        <button
          onClick={() => onNavigate('explore')}
          class="flex items-center space-x-1 text-slate-400 hover:text-steam-blue transition-colors text-sm font-semibold cursor-pointer"
        >
          <ChevronLeft class="h-4 w-4" />
          <span>Back to Explore</span>
        </button>
      </div>

      {/* Main Info Hero card */}
      <section class="grid grid-cols-1 md:grid-cols-3 gap-8 bg-steam-cardBg border border-steam-accent/25 rounded-xl overflow-hidden shadow-2xl p-6 md:p-8">
        
        {/* Left: Thumbnail Column */}
        <div class="md:col-span-1 space-y-4">
          <div class="aspect-[16/9] w-full rounded-lg overflow-hidden border border-steam-accent/20 shadow-md">
            <img
              src={imgSrc}
              alt={Name}
              onError={handleImageError}
              class="w-full h-full object-cover"
            />
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between border-b border-steam-accent/10 py-1.5">
              <span class="text-slate-400">App ID:</span>
              <span class="font-mono text-slate-200">{Appid}</span>
            </div>
            <div class="flex justify-between border-b border-steam-accent/10 py-1.5">
              <span class="text-slate-400">Type:</span>
              <span class="text-slate-200 capitalize">{Type}</span>
            </div>
            <div class="flex justify-between border-b border-steam-accent/10 py-1.5">
              <span class="text-slate-400">Steam Rank:</span>
              <span class="text-steam-blue font-bold">#{Rank}</span>
            </div>
          </div>
        </div>

        {/* Right / Middle: Details Column */}
        <div class="md:col-span-2 flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <h1 class="font-display font-extrabold text-2xl md:text-3xl lg:text-4xl text-slate-100 leading-tight">
                {Name}
              </h1>
              <div class={`text-xl font-bold px-4 py-1.5 rounded-lg shadow ${
                price === 0 ? 'bg-steam-priceGreen text-steam-green' : 'bg-steam-darkBg text-steam-blue border border-steam-blue/20'
              }`}>
                {price_display}
              </div>
            </div>

            {/* Developers, Publishers & Release */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-steam-darkBg/60 p-4 rounded-lg border border-steam-accent/10">
              <div class="space-y-2">
                <div class="flex items-center text-slate-400 space-x-2">
                  <User class="h-4 w-4 text-steam-blue shrink-0" />
                  <span class="font-semibold text-slate-300">Developer:</span>
                </div>
                <p class="text-slate-200 pl-6">{Developers}</p>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center text-slate-400 space-x-2">
                  <ShoppingBag class="h-4 w-4 text-steam-blue shrink-0" />
                  <span class="font-semibold text-slate-300">Publisher:</span>
                </div>
                <p class="text-slate-200 pl-6">{Publishers}</p>
              </div>

              <div class="space-y-2 sm:col-span-2 border-t border-steam-accent/10 pt-2 flex items-center justify-between text-xs">
                <div class="flex items-center text-slate-400 space-x-2">
                  <Calendar class="h-4 w-4 text-steam-blue" />
                  <span class="font-semibold">Release Date:</span>
                  <span class="text-slate-200">{ReleaseDate || 'N/A'}</span>
                </div>
                <a
                  href={`https://store.steampowered.com/app/${Appid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-steam-blue hover:text-sky-300 hover:underline flex items-center font-bold"
                >
                  View on Steam
                  <ExternalLink class="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </div>

            {/* Tags Badges */}
            <div class="space-y-2">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Popular User Tags</span>
              <div class="flex flex-wrap gap-1.5">
                {tag_list && tag_list.map((tag, idx) => (
                  <TagBadge key={idx} tag={tag} onClick={(t) => onNavigate('explore', { tag: t })} />
                ))}
              </div>
            </div>
          </div>

          {/* Steam Review Rating Distribution Block */}
          <div class="space-y-2.5 border-t border-steam-accent/20 pt-4 mt-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
              <div class="flex items-center space-x-2">
                <ThumbsUp class={`h-4.5 w-4.5 ${reviewInfo.color}`} />
                <span class="text-slate-300">Customer Reviews:</span>
                <span class={`${reviewInfo.color} font-bold`}>{reviewInfo.text}</span>
                <span class="text-slate-400 font-medium">({positivePercentage}%)</span>
              </div>
              <span class="text-xs text-slate-400 font-semibold">
                {TotalReviews.toLocaleString()} Total Reviews
              </span>
            </div>

            {/* Visual breakdown bar */}
            {TotalReviews > 0 ? (
              <div class="space-y-1">
                <div class="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${positivePercentage}%` }}
                    class="bg-emerald-500 h-full"
                    title={`Positive: ${PositiveReview.toLocaleString()} (${positivePercentage}%)`}
                  />
                  <div
                    style={{ width: `${negativePercentage}%` }}
                    class="bg-rose-500 h-full"
                    title={`Negative: ${NegativeReview.toLocaleString()} (${negativePercentage}%)`}
                  />
                </div>
                <div class="flex justify-between text-[10px] font-bold tracking-wide uppercase">
                  <span class="text-emerald-400 flex items-center">
                    <ThumbsUp class="h-3 w-3 mr-0.5" />
                    {PositiveReview.toLocaleString()} Positive
                  </span>
                  <span class="text-rose-400 flex items-center">
                    {NegativeReview.toLocaleString()} Negative
                    <ThumbsDown class="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ) : (
              <div class="w-full bg-slate-800 py-2 text-center text-xs text-slate-500 italic rounded">
                No reviews available for this game.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Description & System requirements */}
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Description (2/3 cols) */}
        <div class="lg:col-span-2 bg-steam-cardBg border border-steam-accent/20 rounded-xl p-6 md:p-8 space-y-4 shadow-lg">
          <h2 class="font-display font-bold text-xl text-slate-100 border-b border-steam-accent/15 pb-2">
            About the Game
          </h2>
          <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {Description || "No description provided."}
          </p>
        </div>

        {/* System Requirements (1/3 cols) */}
        <div class="lg:col-span-1 bg-steam-cardBg border border-steam-accent/20 rounded-xl p-6 space-y-6 shadow-lg">
          <h2 class="font-display font-bold text-lg text-slate-100 border-b border-steam-accent/15 pb-2 flex items-center">
            <Monitor class="h-4.5 w-4.5 text-steam-blue mr-2" />
            System Requirements
          </h2>
          
          <div class="space-y-4 text-sm">
            {/* OS Requirement */}
            <div class="space-y-1">
              <div class="flex items-center text-slate-400 space-x-1.5 text-xs uppercase tracking-wider font-semibold">
                <Monitor class="h-3.5 w-3.5" />
                <span>Operating System</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-1">
                {Array.isArray(OsRequirement) ? (
                  OsRequirement.map((os, idx) => (
                    <span key={idx} class="bg-steam-darkBg px-2 py-0.5 border border-steam-accent/30 rounded text-slate-200 capitalize text-xs font-medium">
                      {os}
                    </span>
                  ))
                ) : (
                  <span class="bg-steam-darkBg px-2 py-0.5 border border-steam-accent/30 rounded text-slate-200 text-xs">
                    {OsRequirement}
                  </span>
                )}
              </div>
            </div>

            {/* Memory Requirement */}
            <div class="space-y-1">
              <div class="flex items-center text-slate-400 space-x-1.5 text-xs uppercase tracking-wider font-semibold">
                <HardDrive class="h-3.5 w-3.5" />
                <span>Memory</span>
              </div>
              <p class="text-slate-200 font-medium pl-5">
                {formatMemory(MemoryRequirement)}
              </p>
            </div>

            {/* CPU Requirement */}
            <div class="space-y-1">
              <div class="flex items-center text-slate-400 space-x-1.5 text-xs uppercase tracking-wider font-semibold">
                <Cpu class="h-3.5 w-3.5" />
                <span>CPU Requirement</span>
              </div>
              <p class="text-slate-200 font-medium pl-5">
                {CpuRequirement !== "0.0" && CpuRequirement !== "0" && CpuRequirement !== "N/A"
                  ? `${CpuRequirement} GHz Equivalent`
                  : "No Requirement Specified"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Panel */}
      <section class="bg-steam-darkBg p-2">
        <RecommendationPanel
          gameId={gameId}
          topN={12}
          onViewDetail={(id) => onNavigate('detail', id)}
          onViewRecommendations={(id) => onNavigate('recommend', id)}
          onTagClick={(tag) => onNavigate('explore', { tag })}
        />
      </section>
      
    </div>
  );
}
