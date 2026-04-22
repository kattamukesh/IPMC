import React, { useState, useEffect } from 'react';
import { api } from '../api';

function SymbolGalleryCard({ symbol }) {
  return (
    <div className="card p-6 space-y-4">
      {/* Symbol Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg border border-gold-500/40 bg-gold-500/5 flex items-center justify-center shrink-0">
          <img
            src={`http://localhost:3001${symbol.imageUrl}`}
            alt={symbol.label}
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg tracking-wide text-gold-200">
                Symbol {symbol.label}
              </h3>
              {symbol.category && (
                <p className="font-body text-xs text-gold-500 uppercase tracking-widest mt-0.5">
                  {symbol.category}
                </p>
              )}
            </div>
            <div className="bg-gold-500/10 border border-gold-500/30 rounded px-2.5 py-1 shrink-0">
              <span className="font-display text-xs text-gold-400 font-semibold">
                {symbol.coinCount || 0}
              </span>
            </div>
          </div>
          {symbol.description && (
            <p className="font-body text-sm text-imperial-muted mt-2">
              {symbol.description}
            </p>
          )}
        </div>
      </div>

      {/* Associated Coins */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gold-500 text-xs">♛</span>
          <span className="font-display text-xs tracking-widest uppercase text-gold-500">
            Associated Coins ({symbol.coins.length})
          </span>
        </div>

        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {symbol.coins.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center gap-3 p-3 rounded border border-imperial-border/30 bg-imperial-surface/50"
            >
              <div className="w-8 h-8 rounded-full border border-gold-600/30 bg-gold-500/5 flex items-center justify-center shrink-0">
                <span className="text-sm text-gold-400">♛</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm tracking-wide text-gold-200 truncate">
                  {coin.name}
                </h4>
                <p className="font-body text-xs text-imperial-muted">{coin.series}</p>
              </div>
              <div className="text-xs text-imperial-muted font-mono">
                Pos {coin.position}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SymbolGallery({ onBack }) {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, or specific category
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSymbolsGallery()
      .then(data => {
        setSymbols(data.symbols || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter by category first
  let filteredSymbols = filter === 'all'
    ? symbols
    : symbols.filter(symbol => symbol.category === filter);

  // Then filter by search query (label or description)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredSymbols = filteredSymbols.filter(symbol =>
      symbol.label.toLowerCase().includes(query) ||
      (symbol.description && symbol.description.toLowerCase().includes(query))
    );
  }

  // Get unique categories for filter buttons
  const availableCategories = [...new Set(symbols.map(s => s.category).filter(Boolean))].sort();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-gold-500/30 animate-spin flex items-center justify-center">
          <span className="text-2xl text-gold-500">✦</span>
        </div>
        <span className="font-display text-xs tracking-widest uppercase text-imperial-muted animate-pulse">
          Loading symbol gallery…
        </span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="card p-6 max-w-md text-center space-y-4">
        <span className="text-4xl text-red-400">⚠</span>
        <p className="font-body text-red-300">{error}</p>
        <button onClick={onBack} className="btn-primary">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-gold-500/40 bg-gold-500/5 flex items-center justify-center">
              <span className="text-3xl text-gold-400">✦</span>
            </div>
          </div>
          <h1 className="font-display text-3xl tracking-widest uppercase text-gold-200">
            Imperial Symbol Gallery
          </h1>
          <p className="font-body text-base text-imperial-muted max-w-2xl mx-auto">
            Explore the complete collection of symbols used in British imperial coins,
            with their associated coins and historical significance.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Search symbols by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded border border-imperial-border bg-imperial-surface text-imperial-text placeholder-imperial-muted/60 font-body text-sm focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center">
            <div className="flex gap-2 p-1 bg-imperial-darker/50 rounded-lg border border-imperial-border flex-wrap justify-center">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gold-500 text-imperial-dark shadow-lg'
                    : 'text-imperial-muted hover:text-gold-400'
                }`}
              >
                All Symbols
              </button>
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 ${
                    filter === category
                      ? 'bg-gold-500 text-imperial-dark shadow-lg'
                      : 'text-imperial-muted hover:text-gold-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Symbols Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSymbols.map(symbol => (
            <SymbolGalleryCard key={symbol.id} symbol={symbol} />
          ))}
        </div>

        {filteredSymbols.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl text-imperial-muted/50 mb-4 block">✦</span>
            <p className="font-body text-imperial-muted">No symbols found for the selected filter.</p>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center pt-6">
          <button onClick={onBack} className="btn-secondary">
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}