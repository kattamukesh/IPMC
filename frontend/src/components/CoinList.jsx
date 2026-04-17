import React from 'react';

export default function CoinList({ coins, title = 'Possible Coins', highlight = false }) {
  if (!coins || coins.length === 0) return null;

  return (
    <div className={`card p-4 ${highlight ? 'border-gold-600/50 animate-glow-pulse' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold-500 text-xs">◈</span>
        <h3 className="font-display text-xs tracking-widest uppercase text-gold-400">{title}</h3>
        <span className="ml-auto font-mono text-xs text-imperial-muted bg-imperial-surface px-2 py-0.5 rounded">
          {coins.length}
        </span>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {coins.map((coin, i) => (
          <div
            key={coin.id || i}
            className="flex items-start gap-2.5 py-1.5 px-2.5 rounded bg-imperial-surface/50 border border-imperial-border/50 hover:border-gold-700/50 transition-colors"
          >
            <span className="text-gold-600 text-xs mt-0.5 shrink-0">✦</span>
            <div>
              <div className="font-display text-xs text-gold-200">{coin.name}</div>
              <div className="font-body text-xs text-imperial-muted italic">{coin.series}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
