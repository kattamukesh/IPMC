import React, { useState, useEffect } from 'react';
import { api } from '../api';
import SymbolCard from '../components/SymbolCard';
import CoinList from '../components/CoinList';
import CategoryFilter from '../components/CategoryFilter';

export default function SymbolScreen({ sessionId, position, possibleCoins, onNext, onBack, onSkip }) {
  const [symbols, setSymbols] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentCoins, setCurrentCoins] = useState(possibleCoins || []);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    setError(null);

    Promise.all([
      api.getSymbols(position, sessionId),
      api.getCategories(),
    ]).then(([symbolsData, categoriesData]) => {
      setSymbols(symbolsData.symbols || []);
      setCategories(categoriesData.categories || []);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [position, sessionId]);

  const handleSelect = async (symbol) => {
    if (submitting) return;
    setSelected(symbol.id);
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.selectSymbol(sessionId, position, symbol.id);
      setCurrentCoins(result.possibleCoins || []);

      // Auto-advance
      if (result.identified) {
        setTimeout(() => onNext({ possibleCoins: result.possibleCoins, identified: true }), 600);
      } else {
        setTimeout(() => onNext({ possibleCoins: result.possibleCoins, identified: false }), 600);
      }
    } catch (err) {
      setError(err.message);
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip && onSkip();
  };

  // Filter symbols by selected categories
  const filteredSymbols = selectedCategories.length === 0
    ? symbols
    : symbols.filter(sym => selectedCategories.includes(sym.category));

  return (
    <div className="flex-1 overflow-hidden flex gap-6 p-6 animate-fade-in">
      {/* Main symbol selection area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full border border-gold-500/60 bg-gold-500/10 flex items-center justify-center">
              <span className="font-display text-sm text-gold-400">{position}</span>
            </div>
            <h2 className="font-display text-lg tracking-widest uppercase text-gold-200">
              Symbol Position {position}
            </h2>
          </div>
          <p className="font-body text-sm text-imperial-muted italic ml-11">
            Select the symbol found at position {position} on your coin
          </p>
        </div>

        {/* Category Filter */}
        {!loading && categories.length > 0 && (
          <div className="mb-4 max-w-xs">
            <label className="block text-xs font-display tracking-widest uppercase text-gold-400 mb-2">
              Filter by Category
            </label>
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
              disabled={submitting}
            />
          </div>
        )}

        {/* Symbol Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8 text-gold-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20"/>
                </svg>
                <span className="font-display text-xs tracking-widest uppercase text-imperial-muted">Loading symbols…</span>
              </div>
            </div>
          ) : error ? (
            <div className="border border-red-800/50 bg-red-900/10 rounded-lg p-4 flex gap-3">
              <span className="text-red-400">⚠</span>
              <p className="font-body text-sm text-red-300">{error}</p>
            </div>
          ) : filteredSymbols.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="text-4xl text-imperial-muted">◈</span>
              <p className="font-body text-sm text-imperial-muted italic">
                No symbols available {selectedCategories.length > 0 ? 'in selected categories' : 'for this position'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4">
              {filteredSymbols.map(sym => (
                <SymbolCard
                  key={sym.id}
                  symbol={sym}
                  selected={selected === sym.id}
                  onClick={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-imperial-border mt-2">
          <button onClick={onBack} className="btn-ghost text-xs">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="font-display text-xs tracking-widest uppercase text-imperial-muted hover:text-gold-400 transition-colors"
            >
              Skip to Results →
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: possible coins */}
      <div className="w-56 shrink-0 space-y-4 overflow-y-auto">
        <CoinList
          coins={currentCoins}
          title={`Possible Coins`}
          highlight={currentCoins.length === 1}
        />

        {/* Position guide */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gold-500 text-xs">◉</span>
            <h3 className="font-display text-xs tracking-widest uppercase text-gold-400">Symbol Positions</h3>
          </div>
          <div className="space-y-1.5">
            {[1,2,3,4,5].map(p => (
              <div
                key={p}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors
                  ${p === position ? 'bg-gold-500/10 border border-gold-600/40' : 'border border-transparent'}
                `}
              >
                <span className={`font-display ${p === position ? 'text-gold-300' : p < position ? 'text-gold-600' : 'text-imperial-muted'}`}>
                  {p < position ? '✓' : p === position ? '▶' : '○'}
                </span>
                <span className={`font-body ${p === position ? 'text-gold-300' : p < position ? 'text-gold-500' : 'text-imperial-muted'}`}>
                  Position {p}
                  {p === 1 && ' · Obverse'}
                  {p === 2 && ' · Portrait'}
                  {p === 3 && ' · Reverse'}
                  {p === 4 && ' · Legend'}
                  {p === 5 && ' · Edge'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-lg border border-gold-800/30 bg-gold-900/10 p-3">
          <p className="font-body text-xs text-gold-600 italic leading-relaxed">
            ✦ Select the primary symbol found at this position. If uncertain, use "Skip to Results" to see your matches.
          </p>
        </div>
      </div>
    </div>
  );
}
