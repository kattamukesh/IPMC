import React from 'react';

export default function TitleBar() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  return (
    <div className="drag-region flex items-center justify-between h-10 px-4 bg-imperial-darker border-b border-imperial-border select-none shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Coin icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#d4952a" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="7" stroke="#d4952a" strokeWidth="0.75" strokeDasharray="2 1"/>
          <text x="12" y="16" textAnchor="middle" fill="#d4952a" fontSize="8" fontFamily="Cinzel">✦</text>
        </svg>
        <span className="font-display text-xs tracking-[0.25em] text-gold-400 uppercase">
          IPMC – Imperial Coin Identifier
        </span>
      </div>

      {isElectron && (
        <div className="no-drag flex items-center gap-1">
          <button
            onClick={() => window.electronAPI.minimize()}
            className="w-7 h-7 rounded flex items-center justify-center text-imperial-muted hover:text-gold-300 hover:bg-imperial-card transition-colors"
          >
            <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
              <rect width="10" height="2" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI.maximize()}
            className="w-7 h-7 rounded flex items-center justify-center text-imperial-muted hover:text-gold-300 hover:bg-imperial-card transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="8" height="8" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI.close()}
            className="w-7 h-7 rounded flex items-center justify-center text-imperial-muted hover:text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
