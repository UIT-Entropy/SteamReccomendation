import React, { useState, useEffect } from 'react';
import TagBadge from './TagBadge';
import { Layers, ThumbsUp, Calendar, Tag } from 'lucide-react';

const getReviewStatus = (score, ratio) => {
  const percent = Math.round(ratio * 100);
  if (score >= 9) return { text: "Overwhelmingly Positive", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 8) return { text: "Very Positive", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 7) return { text: "Positive", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 6) return { text: "Mostly Positive", color: "text-teal-400", bg: "bg-teal-500/10" };
  if (score >= 5) return { text: "Mixed", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (score >= 4) return { text: "Mostly Negative", color: "text-orange-400", bg: "bg-orange-500/10" };
  return { text: "Negative", color: "text-red-500", bg: "bg-red-500/10" };
};

export default function GameCard({ game, onViewDetail, onViewRecommendations, onTagClick, similarityScore, sharedTags, explanation }) {
  const {
    game_id,
    Name,
    price_display,
    price,
    release_year,
    tag_list,
    Developers,
    ReviewScore,
    ReviewRatio,
    TotalReviews,
    Thumbnail
  } = game;

  const [imgSrc, setImgSrc] = useState(Thumbnail);

  useEffect(() => {
    setImgSrc(Thumbnail);
  }, [Thumbnail]);

  const handleImageError = () => {
    // Premium unsplash gaming placeholder image as fallback
    setImgSrc("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop");
  };

  const reviewInfo = getReviewStatus(ReviewScore, ReviewRatio);
  const displayTags = tag_list ? tag_list.slice(0, 3) : [];
  const isFree = price === 0;

  return (
    <div class="bg-steam-cardBg border border-steam-accent/20 rounded-lg overflow-hidden flex flex-col h-full hover:-translate-y-1.5 transition-transform duration-300 shadow-lg hover:shadow-steam-glow group">
      
      {/* Thumbnail */}
      <div 
        class="relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
        onClick={() => onViewDetail(game_id)}
      >
        <img
          src={imgSrc}
          alt={Name}
          onError={handleImageError}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Similarity Score Badge (if present on recommendation view) */}
        {similarityScore !== undefined && (
          <div class="absolute top-2 right-2 bg-steam-darkBg/90 border border-steam-blue/60 text-steam-blue text-xs font-bold px-2 py-1 rounded shadow-md flex items-center space-x-1 backdrop-blur-sm">
            <span>Match:</span>
            <span class="text-white">{(similarityScore * 100).toFixed(0)}%</span>
          </div>
        )}
        
        {/* Price Badge over Image */}
        <div class={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded text-xs font-bold shadow-md ${
          isFree ? 'bg-steam-priceGreen text-steam-green' : 'bg-steam-darkBg/95 text-steam-blue border border-steam-blue/20'
        }`}>
          {price_display}
        </div>
      </div>

      {/* Card Content */}
      <div class="p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 
          onClick={() => onViewDetail(game_id)}
          class="font-display font-bold text-base text-slate-100 hover:text-steam-blue transition-colors line-clamp-1 cursor-pointer mb-1"
          title={Name}
        >
          {Name}
        </h3>

        {/* Developer & Release Year */}
        <div class="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span class="truncate pr-2 max-w-[65%]" title={Developers}>{Developers}</span>
          <span class="flex items-center shrink-0">
            <Calendar class="h-3 w-3 mr-1" />
            {release_year > 0 ? release_year : 'N/A'}
          </span>
        </div>

        {/* Tags */}
        <div class="flex flex-wrap gap-1 mb-3 mt-auto">
          {displayTags.length > 0 ? (
            displayTags.map((tag, idx) => (
              <TagBadge key={idx} tag={tag} onClick={onTagClick} />
            ))
          ) : (
            <span class="text-xs text-slate-500 italic flex items-center">
              <Tag class="h-3 w-3 mr-1" /> No Tags
            </span>
          )}
        </div>

        {/* Review rating summary */}
        <div class={`flex items-center space-x-2 text-xs px-2 py-1.5 rounded ${reviewInfo.bg} mb-4`}>
          <ThumbsUp class={`h-3.5 w-3.5 ${reviewInfo.color}`} />
          <span class={`${reviewInfo.color} font-medium truncate`}>
            {reviewInfo.text}
          </span>
          <span class="text-slate-400">
            ({Math.round(ReviewRatio * 100)}%)
          </span>
        </div>

        {/* Recommendation explanation (if present) */}
        {explanation && (
          <div class="text-xs border-t border-steam-accent/15 pt-2.5 mb-4 text-steam-blue/80 italic line-clamp-2">
            {explanation}
          </div>
        )}

        {/* Shared tags badge list (if present) */}
        {sharedTags && sharedTags.length > 0 && (
          <div class="text-xs mb-4">
            <span class="text-slate-400 font-semibold block mb-1">Shared tags:</span>
            <div class="flex flex-wrap gap-1">
              {sharedTags.slice(0, 4).map((tag, idx) => (
                <span key={idx} class="bg-steam-blue/10 border border-steam-blue/20 text-steam-blue text-[10px] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Button Grid */}
        <div class="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => onViewDetail(game_id)}
            class="bg-steam-lightBg/40 border border-steam-accent/30 hover:bg-steam-lightBg/75 text-slate-100 py-1.5 px-2 rounded text-xs font-semibold transition-colors duration-200"
          >
            Details
          </button>
          <button
            onClick={() => onViewRecommendations(game_id)}
            class="bg-steam-blue text-steam-darkBg hover:bg-sky-300 font-bold py-1.5 px-2 rounded text-xs transition-colors duration-200 shadow-md shadow-steam-blue/10"
          >
            Similar Games
          </button>
        </div>
      </div>
    </div>
  );
}
