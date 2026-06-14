import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = "text-steam-blue" }) {
  return (
    <div class="bg-steam-cardBg border border-steam-accent/20 rounded-lg p-5 shadow-lg flex items-center space-x-4 hover:border-steam-blue/40 transition-glow">
      <div class={`p-3 rounded-lg bg-steam-darkBg flex items-center justify-center shrink-0`}>
        <Icon class={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p class="text-2xl font-bold font-display text-white">
          {value !== undefined && value !== null ? value.toLocaleString() : '...'}
        </p>
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}
