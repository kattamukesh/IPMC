import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import SymbolCard from '../components/SymbolCard';
import CoinList from '../components/CoinList';
import CategoryFilter from '../components/CategoryFilter';
import SelectedSymbolsDisplay from '../components/SelectedSymbolsDisplay';

export default function SymbolPickerScreen({
  sessionId,
  onIdentified,   // (possibleCoins) => void — called when exactly 1 coin remains
  onNoMatch,      // () => void — called when 0 coins remain
  onFinish,       // (possibleCoins) => void — called when user stops (1-5 picks, multi coins left)
  onBack,         // () => void — go back to input screen
}) {
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [selectedSymbols, setSelectedSymbols] = useState([]);   // [{id, label, …}] in pick order
  const [possibleCoins, setPossibleCoins] = useState([]);
  const [possibleCount, setPossibleCount] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  // ── Load initial available symbols on mount ────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getAvailableSymbols(sessionId),
      api.getCategories(),
    ]).then(([data, catData]) => {
      setAvailableSymbols(data.availableSymbols || []);
      setSelectedSymbols(data.selectedSymbols || []);
      setPossibleCoins(data.possibleCoins || []);
      setPossibleCount(data.possibleCount);
      setStep(data.step || 1);
      setCategories(catData.categories || []);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Pick a symbol ─────────────────────────────────────────
  const handlePickSymbol = useCallback(async (symbol) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.selectSymbolStep(sessionId, symbol.id);

      // Update state from response
      setSelectedSymbols(result.selectedSymbols || []);
      setPossibleCoins(result.possibleCoins || []);
      setPossibleCount(result.possibleCount);
      setStep(result.step + 1);

      if (result.status === 'no_match') {
        // No coins left — go to result screen immediately
        setTimeout(() => onNoMatch(), 400);
        return;
      }

      if (result.status === 'identified') {
        // Exactly one coin — jump to result
        setTimeout(() => onIdentified(result.possibleCoins), 400);
        return;
      }

      // Continue — update available symbols for next step
      setAvailableSymbols(result.availableSymbols || []);
      setSelectedCategories([]); // reset category filter each step
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, submitting, onNoMatch, onIdentified]);

  // ── Finish early — show results with current possible coins ─
  const handleFinish = useCallback(() => {
    onFinish(possibleCoins);
  }, [possibleCoins, onFinish]);

  // ── Category-filtered view of available symbols ────────────
  const filteredAvailable = selectedCategories.length === 0
    ? availableSymbols
    : availableSymbols.filter(s => selectedCategories.includes(s.category));

  const canFinish = selectedSymbols.length >= 1 && !submitting;
  const maxReached = selectedSymbols.length >= 5;

  return (
    <div className="flex-1 overflow-hidden flex gap-6 p-6 animate-fade-in">

      {/* ── Left: symbol selection ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full border border-gold-500/60 bg-gold-500/10 flex items-center justify-center">
              <span className="font-display text-sm text-gold-400">{step}</span>
            </div>
            <h2 className="font-display text-lg tracking-widest uppercase text-gold-200">
              {step === 1 ? 'Select First Symbol' : `Select Symbol ${step}`}
            </h2>
          </div>
          <p className="font-body text-sm text-imperial-muted italic ml-11">
            {possibleCount !== null
              ? `${possibleCount} coin${possibleCount !== 1 ? 's' : ''} match so far — pick another symbol to narrow down`
              : 'Choose a symbol you can identify on your coin'}
          </p>
        </div>

        {/* ── Selected symbols display ── */}
        <SelectedSymbolsDisplay selectedSymbols={selectedSymbols} maxSymbols={5} />

        {/* ── Category Filter ── */}
        {!loading && categories.length > 0 && !maxReached && (
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

        {/* ── Available symbols grid ── */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8 text-gold-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20"/>
                </svg>
                <span className="font-display text-xs tracking-widest uppercase text-imperial-muted">
                  Loading symbols…
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="border border-red-800/50 bg-red-900/10 rounded-lg p-4 flex gap-3">
              <span className="text-red-400">⚠</span>
              <p className="font-body text-sm text-red-300">{error}</p>
            </div>
          ) : maxReached ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
              <span className="text-4xl text-gold-500">✦</span>
              <p className="font-display text-sm tracking-widest uppercase text-gold-400">
                Maximum symbols reached
              </p>
              <p className="font-body text-xs text-imperial-muted italic">
                Click "Show Results" to see matching coins
              </p>
            </div>
          ) : filteredAvailable.length === 0 && availableSymbols.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <span className="text-3xl text-imperial-muted">◈</span>
              <p className="font-body text-sm text-imperial-muted italic">
                No symbols in selected categories — try clearing the filter
              </p>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <span className="text-3xl text-imperial-muted">◈</span>
              <p className="font-body text-sm text-imperial-muted italic">
                No more symbols available — click "Show Results" below
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-xs tracking-widest uppercase text-imperial-muted">
                  Available symbols — {filteredAvailable.length} shown
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4">
                {filteredAvailable.map(sym => (
                  <SymbolCard
                    key={sym.id}
                    symbol={sym}
                    mode="single"
                    selected={false}
                    onClick={() => handlePickSymbol(sym)}
                    disabled={submitting}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pt-4 border-t border-imperial-border mt-2">
          <button onClick={onBack} className="btn-ghost text-xs" disabled={submitting}>
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {canFinish && (
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="btn-primary"
              >
                Show Results ({possibleCount ?? '…'} coins) →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right sidebar: possible coins ── */}
      <div className="w-56 shrink-0 space-y-4 overflow-y-auto">
        <CoinList
          coins={possibleCoins}
          title="Possible Coins"
          highlight={possibleCoins.length === 1}
        />

        {/* Step summary */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gold-500 text-xs">◈</span>
            <h3 className="font-display text-xs tracking-widest uppercase text-gold-400">Progress</h3>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(n => {
              const isDone = n <= selectedSymbols.length;
              const isCurrent = n === step;
              const sym = selectedSymbols[n - 1];
              return (
                <div
                  key={n}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors
                    ${isCurrent ? 'bg-gold-500/10 border border-gold-600/40' : 'border border-transparent'}
                  `}
                >
                  <span className={`font-display w-3 ${isDone ? 'text-gold-400' : isCurrent ? 'text-gold-500' : 'text-imperial-muted'}`}>
                    {isDone ? '✓' : isCurrent ? '▶' : '○'}
                  </span>
                  <span className={`font-body truncate ${isDone ? 'text-gold-400' : isCurrent ? 'text-gold-300' : 'text-imperial-muted'}`}>
                    {isDone && sym ? sym.label : `Step ${n}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-lg border border-gold-800/30 bg-gold-900/10 p-3">
          <p className="font-body text-xs text-gold-600 italic leading-relaxed">
            ✦ Each symbol you pick narrows the list. Stop at any time to see all matching coins.
          </p>
        </div>
      </div>
    </div>
  );
}
