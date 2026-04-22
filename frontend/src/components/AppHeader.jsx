import React from 'react';

export default function AppHeader({ 
  onNavigateHome, 
  onNavigateCoinGallery, 
  onNavigateSymbolGallery,
  onStartIdentification,
  hideIdentifyButton = false 
}) {
  return (
    <header className="border-b border-imperial-border bg-imperial-darker/90 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateHome}
            className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg border border-gold-500/40 bg-gold-500/10 flex items-center justify-center">
              <span className="text-lg font-display text-gold-400">♛</span>
            </div>
            <span className="font-display text-xl tracking-widest text-gold-200 group-hover:text-gold-300 transition-colors">
              IPMC
            </span>
          </button>
        </div>

        {/* Center: Navigation Buttons */}
        <nav className="flex items-center gap-3">
          <button
            onClick={onNavigateCoinGallery}
            className="px-4 py-2 rounded text-sm font-display tracking-wide text-imperial-muted hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-200"
          >
            🪙 Coins
          </button>
          <button
            onClick={onNavigateSymbolGallery}
            className="px-4 py-2 rounded text-sm font-display tracking-wide text-imperial-muted hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-200"
          >
            ✦ Symbols
          </button>
        </nav>

        {/* Right: Identify Button */}
        {!hideIdentifyButton && (
          <button
            onClick={onStartIdentification}
            className="px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-imperial-dark font-display text-sm tracking-wide font-semibold shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span>▶</span>
            <span>Identify Your Coin</span>
          </button>
        )}
      </div>
    </header>
  );
}
