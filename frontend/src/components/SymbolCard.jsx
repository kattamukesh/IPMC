import React, { useState } from 'react';

const FALLBACK_SYMBOLS = {
  'eagle.png': '🦅',
  'crown.png': '♛',
  'shield.png': '🛡',
  'cross.png': '✝',
  'star.png': '★',
  'wreath.png': '🌿',
  'lion.png': '🦁',
  'bust.png': '👤',
  'anchor.png': '⚓',
  'sword.png': '⚔',
  'fleur.png': '⚜',
  'globe.png': '🌐',
};

export default function SymbolCard({ symbol, selected, onClick, mode = 'single', disabled = false }) {
  const [imgError, setImgError] = useState(false);
  const filename = symbol.imageUrl?.split('/').pop() || '';
  const fallback = FALLBACK_SYMBOLS[filename] || '◈';

  return (
    <button
      onClick={() => !disabled && onClick(symbol)}
      disabled={disabled}
      className={`
        relative group flex flex-col items-center gap-2 p-4 rounded-lg
        border transition-all duration-200 cursor-pointer text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${selected
          ? 'border-gold-400 bg-gold-500/10 shadow-lg shadow-gold-500/20'
          : 'border-imperial-border bg-imperial-card hover:border-gold-600/60 hover:bg-imperial-card/80'
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${
          mode === 'multi' ? 'bg-gold-500' : 'bg-gold-500'
        }`}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="#0a0a0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Symbol image or fallback */}
      <div className={`
        w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden
        border ${selected ? 'border-gold-500/40' : 'border-imperial-border/40'}
        bg-imperial-darker
      `}>
        {!imgError ? (
          <img
            src={`http://localhost:3001${symbol.imageUrl}`}
            alt={symbol.label}
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl select-none">{fallback}</span>
        )}
      </div>

      <div className="text-center">
        <div className={`font-display text-xs tracking-wider uppercase ${selected ? 'text-gold-300' : 'text-gold-400'}`}>
          {symbol.label}
        </div>
        {symbol.description && (
          <div className="font-body text-xs text-imperial-muted italic mt-0.5 leading-tight">
            {symbol.description}
          </div>
        )}
      </div>
    </button>
  );
}
