import React, { useState, useEffect } from 'react';
import { api } from '../api';

function CoinGalleryCard({ coin }) {
  // Sort symbols by position
  const sortedSymbols = [...(coin.symbols || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="card p-6 space-y-4">
      {/* Coin Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/5 flex items-center justify-center shrink-0">
          <span className="text-xl text-gold-400">♛</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg tracking-wide text-gold-200 truncate">
            {coin.name}
          </h3>
          <p className="font-body text-sm text-imperial-muted">{coin.series}</p>
          {coin.weight && (
            <p className="font-mono text-xs text-imperial-muted mt-1">
              Weight: {coin.weight.toFixed(2)}g
            </p>
          )}
          <p className="font-body text-xs text-imperial-muted mt-1 capitalize">
            Size: {coin.sizeCategory}
          </p>
        </div>
      </div>

      {/* Symbols Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gold-500 text-xs">✦</span>
          <span className="font-display text-xs tracking-widest uppercase text-gold-500">
            Symbol Positions ({sortedSymbols.length}/5)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {sortedSymbols.map((symbol) => (
            <div
              key={symbol.id}
              className="aspect-square border border-imperial-border rounded flex items-center justify-center p-1 bg-imperial-surface/50"
              title={`${symbol.label} (Position ${symbol.position})`}
            >
              <img
                src={`http://localhost:3001${symbol.imageUrl}`}
                alt={symbol.label}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: 5 - sortedSymbols.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square border border-dashed border-imperial-muted/30 rounded flex items-center justify-center bg-imperial-surface/20"
            >
              <span className="text-xs text-imperial-muted/50">-</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoinsGallery({ onBack }) {
  const [coins, setCoins] = useState([]);
  const [coinsBySeries, setCoinsBySeries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, or specific series name

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getCoinsGallery()
      .then(data => {
        setCoins(data.coins || []);
        setCoinsBySeries(data.coinsBySeries || {});
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCoins = filter === 'all'
    ? coins
    : coins.filter(coin => coin.series === filter);

  // Get unique series for filter buttons
  const availableSeries = Object.keys(coinsBySeries).sort();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-gold-500/30 animate-spin flex items-center justify-center">
          <span className="text-2xl text-gold-500">🪙</span>
        </div>
        <span className="font-display text-xs tracking-widest uppercase text-imperial-muted animate-pulse">
          Loading coin gallery…
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
              <span className="text-3xl text-gold-400">🪙</span>
            </div>
          </div>
          <h1 className="font-display text-3xl tracking-widest uppercase text-gold-200">
            Imperial Coin Gallery
          </h1>
          <p className="font-body text-base text-imperial-muted max-w-2xl mx-auto">
            Explore our comprehensive collection of British imperial coins from India,
            featuring their distinctive symbols and historical significance.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-imperial-darker/50 rounded-lg border border-imperial-border">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gold-500 text-imperial-dark shadow-lg'
                  : 'text-imperial-muted hover:text-gold-400'
              }`}
            >
              All Coins
            </button>
            {availableSeries.map(series => (
              <button
                key={series}
                onClick={() => setFilter(series)}
                className={`px-4 py-2 rounded text-sm font-display tracking-wide transition-all duration-200 ${
                  filter === series
                    ? 'bg-gold-500 text-imperial-dark shadow-lg'
                    : 'text-imperial-muted hover:text-gold-400'
                }`}
              >
                {series.replace(' Series', '').replace(/ \(.*\)/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Coins Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoins.map(coin => (
            <CoinGalleryCard key={coin.id} coin={coin} />
          ))}
        </div>

        {filteredCoins.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl text-imperial-muted/50 mb-4 block">🪙</span>
            <p className="font-body text-imperial-muted">No coins found for the selected filter.</p>
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