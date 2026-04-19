import React from 'react';

export default function SelectedSymbolsDisplay({ selectedSymbols, maxSymbols = 5 }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold-500 text-xs">✓</span>
        <span className="font-display text-xs tracking-widest uppercase text-gold-500">
          Selected Symbols ({selectedSymbols.length}/{maxSymbols})
        </span>
      </div>

      {/* Rectangle with slots */}
      <div className="flex items-center justify-center">
        <div className="flex gap-2 p-4 bg-imperial-darker/50 border border-imperial-border rounded-lg">
          {Array.from({ length: maxSymbols }, (_, index) => {
            const symbol = selectedSymbols[index];
            const isFilled = !!symbol;

            return (
              <div
                key={index}
                className={`
                  w-12 h-12 rounded border-2 flex items-center justify-center transition-all duration-300
                  ${isFilled
                    ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/20'
                    : 'border-imperial-muted/50 bg-imperial-surface/30'
                  }
                `}
              >
                {isFilled ? (
                  <img
                    src={`http://localhost:3001${symbol.imageUrl}`}
                    alt={symbol.label}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-imperial-muted text-xs font-display">
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}