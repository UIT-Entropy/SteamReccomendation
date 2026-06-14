import React from 'react';

export default function TagBadge({ tag, onClick }) {
  const isClickable = !!onClick;
  
  return (
    <span
      onClick={(e) => {
        if (isClickable) {
          e.stopPropagation();
          onClick(tag);
        }
      }}
      class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-steam-lightBg/50 text-steam-blue border border-steam-badgeBorder/40 transition-all duration-150 ${
        isClickable 
          ? 'cursor-pointer hover:bg-steam-blue hover:text-steam-darkBg hover:scale-105' 
          : ''
      }`}
    >
      {tag}
    </span>
  );
}
