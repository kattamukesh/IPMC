import React, { useState, useEffect } from 'react';
import { api } from '../api';
import SymbolCard from '../components/SymbolCard';
import CategoryFilter from '../components/CategoryFilter';

const POSITION_NAMES = {
  1: 'Obverse',
  2: 'Portrait',
  3: 'Reverse',
  4: 'Legend',
  5: 'Edge',
};

export default function InitialSymbolScreen({ sessionId, possibleCoins, onNext, onBack }) {
  const [symbolsByPosition, setSymbolsByPosition] = useState({});
  const [selectedSymbolIds, setSelectedSymbolIds] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getInitialSymbols(),
      api.getCategories(),
    ]).then(([symbolsData, categoriesData]) => {
      setSymbolsByPosition(symbolsData.symbols || {});
      setCategories(categoriesData.categories || []);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSymbol = (symbolId) => {
    const newSelected = new Set(selectedSymbolIds);
    if (newSelected.has(symbolId)) {
      newSelected.delete(symbolId);
    } else {
      if (selectedSymbolIds.size >= 5) {
        setError('Maximum 5 symbols allowed');
        return;
      }
      newSelected.add(symbolId);
    }
    setSelectedSymbolIds(newSelected);
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedSymbolIds.size === 0) {
      setError('Select at least 1 symbol');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await api.selectInitialSymbols(sessionId, Array.from(selectedSymbolIds));
      onNext({
        possibleCoins: result.possibleCoins,
        status: result.status,
        remainingPositions: result.remainingPositions,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = selectedSymbolIds.size >= 1 && !submitting;

  // Filter symbols by selected categories
  const getFilteredSymbols = (position) => {
    const symbols = symbolsByPosition[position] || [];
    if (selectedCategories.length === 0) return symbols;
    return symbols.filter(sym => selectedCategories.includes(sym.category));
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full border border-gold-500/60 bg-gold-500/10 flex items-center justify-center">
            <span className="font-display text-sm text-gold-400">1</span>
          </div>
          <h2 className="font-display text-lg tracking-widest uppercase text-gold-200">
            Select Initial Symbols
          </h2>
        </div>
        <p className="font-body text-sm text-imperial-muted italic ml-11">
          Choose 1-5 symbols you can identify on your coin
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

      {/* Symbol selection counter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="font-display text-xs tracking-widest uppercase text-gold-500">
          Selected: {selectedSymbolIds.size} / 5
        </span>
        <div className="flex-1 h-1 bg-imperial-border rounded-full overflow-hidden max-w-xs">
          <div
            className="h-full bg-gold-500 transition-all duration-300"
            style={{ width: `${(selectedSymbolIds.size / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Symbol grid grouped by position */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
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
        ) : (
          [1, 2, 3, 4, 5].map(pos => {
            const posSymbols = getFilteredSymbols(pos);
            return (
              <div key={pos}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full border border-gold-600/40 bg-gold-500/10 flex items-center justify-center">
                    <span className="font-display text-xs text-gold-400">{pos}</span>
                  </div>
                  <h3 className="font-display text-sm tracking-widest uppercase text-gold-300">
                    Position {pos} · {POSITION_NAMES[pos]}
                  </h3>
                  <span className="ml-auto font-body text-xs text-imperial-muted">
                    {posSymbols.length} symbol{posSymbols.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {posSymbols.length === 0 ? (
                  <div className="text-center py-6 text-imperial-muted italic text-xs">
                    No symbols available for this position
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {posSymbols.map(sym => (
                      <SymbolCard
                        key={sym.id}
                        symbol={sym}
                        mode="multi"
                        selected={selectedSymbolIds.has(sym.id)}
                        onClick={() => handleToggleSymbol(sym.id)}
                        disabled={submitting}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-imperial-border mt-4">
        <button onClick={onBack} className="btn-ghost text-xs" disabled={loading || submitting}>
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {selectedSymbolIds.size > 0 && (
            <button
              onClick={() => {
                setSelectedSymbolIds(new Set());
                setError(null);
              }}
              className="font-display text-xs tracking-widest uppercase text-imperial-muted hover:text-gold-400 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Clear Selection
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20"/>
                </svg>
                Analyzing…
              </span>
            ) : (
              `Analyze Selection (${selectedSymbolIds.size}/5) →`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
