import React, { useState, useEffect } from 'react';
import { api } from '../api';

function CoinResultCard({ coin, isOnly }) {
  return (
    <div className={`
      card p-6 flex gap-5 items-start transition-all duration-300
      ${isOnly ? 'border-gold-500/60 shadow-xl shadow-gold-500/10 animate-glow-pulse' : 'border-imperial-border/60'}
    `}>
      {/* Coin graphic */}
      <div className={`
        w-16 h-16 shrink-0 rounded-full flex items-center justify-center
        border-2 ${isOnly ? 'border-gold-400 bg-gold-500/10' : 'border-imperial-muted/40 bg-imperial-surface'}
      `}>
        <span className={`text-2xl ${isOnly ? 'text-gold-300' : 'text-imperial-muted'}`}>♛</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-display text-lg tracking-wide ${isOnly ? 'shimmer-text' : 'text-gold-200'}`}>
              {coin.name}
            </h3>
            <p className="font-body text-sm text-imperial-muted italic mt-0.5">{coin.series}</p>
          </div>
          {isOnly && (
            <div className="shrink-0 px-2.5 py-1 rounded border border-gold-500/40 bg-gold-500/10">
              <span className="font-display text-xs tracking-widest uppercase text-gold-400">Identified</span>
            </div>
          )}
        </div>
        {coin.weight && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-gold-600 text-xs">⚖</span>
            <span className="font-mono text-xs text-imperial-muted">
              Nominal weight: {coin.weight.toFixed(2)}g
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultScreen({ sessionId, imagePreview, onReset }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getResult(sessionId)
      .then(setResult)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-gold-500/30 animate-spin flex items-center justify-center">
          <span className="text-2xl text-gold-500">♛</span>
        </div>
        <span className="font-display text-xs tracking-widest uppercase text-imperial-muted animate-pulse">
          Compiling results…
        </span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="card p-6 max-w-md text-center space-y-4">
        <span className="text-4xl text-red-400">⚠</span>
        <p className="font-body text-red-300">{error}</p>
        <button onClick={onReset} className="btn-primary">Start Over</button>
      </div>
    </div>
  );

  const { coins = [], relaxedMatches = [], status, weightValid, weightNote, stepsCompleted } = result || {};
  const isIdentified = status === 'identified' && coins.length === 1;
  const isNarrowed = status === 'narrowed';
  const noMatch = status === 'no_match' || (coins.length === 0 && relaxedMatches.length === 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Result Header */}
        <div className="text-center space-y-2 py-4">
          <div className="flex justify-center mb-3">
            {isIdentified ? (
              <div className="w-20 h-20 rounded-full border-2 border-gold-400 bg-gold-500/10 flex items-center justify-center shadow-2xl shadow-gold-500/20 animate-glow-pulse">
                <span className="text-4xl">♛</span>
              </div>
            ) : noMatch ? (
              <div className="w-20 h-20 rounded-full border-2 border-red-700/40 bg-red-900/10 flex items-center justify-center">
                <span className="text-4xl text-red-400">◈</span>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-gold-700/40 bg-gold-900/10 flex items-center justify-center">
                <span className="text-4xl text-gold-500">◉</span>
              </div>
            )}
          </div>

          {isIdentified && (
            <>
              <h2 className="font-display text-2xl tracking-widest uppercase shimmer-text">Coin Identified</h2>
              <p className="font-body text-sm text-imperial-muted italic">
                Imperial coin successfully matched after {stepsCompleted} symbol step{stepsCompleted !== 1 ? 's' : ''}
              </p>
            </>
          )}
          {isNarrowed && (
            <>
              <h2 className="font-display text-xl tracking-widest uppercase text-gold-300">Possible Candidates</h2>
              <p className="font-body text-sm text-imperial-muted italic">
                {coins.length} coins match your selections — provide more symbols to narrow further
              </p>
            </>
          )}
          {noMatch && (
            <>
              <h2 className="font-display text-xl tracking-widest uppercase text-red-400">No Match Found</h2>
              <p className="font-body text-sm text-imperial-muted italic">
                No imperial coins matched your symbol selections
              </p>
            </>
          )}
        </div>

        {/* Weight Warning */}
        {!weightValid && weightNote && (
          <div className="border border-amber-700/50 bg-amber-900/10 rounded-lg p-4 flex gap-3">
            <span className="text-amber-400 shrink-0 text-lg">⚠</span>
            <div>
              <div className="font-display text-xs tracking-widest uppercase text-amber-400 mb-1">Weight Warning</div>
              <p className="font-body text-sm text-amber-300/80">{weightNote}</p>
            </div>
          </div>
        )}

        {/* Coin Results */}
        {coins.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="gold-divider flex-1 my-0" />
              <span className="font-display text-xs tracking-widest uppercase text-gold-500 px-3">
                {isIdentified ? 'Identification' : 'Candidates'}
              </span>
              <div className="gold-divider flex-1 my-0" />
            </div>
            {coins.map((coin, i) => (
              <CoinResultCard key={coin.id || i} coin={coin} isOnly={isIdentified} />
            ))}
          </div>
        )}

        {/* Relaxed Matches */}
        {noMatch && relaxedMatches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="gold-divider flex-1 my-0" />
              <span className="font-display text-xs tracking-widest uppercase text-gold-500 px-3">
                Relaxed Matches
              </span>
              <div className="gold-divider flex-1 my-0" />
            </div>
            <p className="font-body text-xs text-imperial-muted italic">
              No exact match found. These coins match {`${relaxedMatches[0]?.matchPercentage || 0}%`} or more of your selected symbols:
            </p>
            <div className="space-y-2">
              {relaxedMatches.slice(0, 5).map((coin, i) => (
                <div key={i} className="card p-4 flex gap-4 items-start">
                  <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center border border-gold-600/30 bg-gold-500/5">
                    <span className="text-xl text-gold-400">♛</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base tracking-wide text-gold-200">{coin.name}</h3>
                        <p className="font-body text-xs text-imperial-muted italic mt-0.5">{coin.series}</p>
                      </div>
                      <div className="shrink-0 px-2.5 py-1 rounded border border-gold-600/40 bg-gold-500/10">
                        <span className="font-display text-xs tracking-widest text-gold-400">{coin.matchPercentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-imperial-muted">
                      Matches {coin.matchedCount} symbol{coin.matchedCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image preview if uploaded */}
        {imagePreview && (
          <div className="card p-4 flex gap-4 items-center">
            <img
              src={imagePreview}
              alt="Uploaded coin"
              className="w-20 h-20 rounded-lg object-contain border border-imperial-border bg-imperial-surface"
            />
            <div>
              <div className="font-display text-xs tracking-widest uppercase text-gold-400 mb-1">Uploaded Image</div>
              <p className="font-body text-xs text-imperial-muted italic">Reference image stored for this session</p>
            </div>
          </div>
        )}

        {/* Session Summary */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gold-500 text-xs">◈</span>
            <h3 className="font-display text-xs tracking-widest uppercase text-gold-400">Session Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-imperial-surface rounded p-3">
              <div className="font-display text-lg text-gold-300">{stepsCompleted || 0}</div>
              <div className="font-body text-xs text-imperial-muted">Symbols Used</div>
            </div>
            <div className="bg-imperial-surface rounded p-3">
              <div className="font-display text-lg text-gold-300">{coins.length}</div>
              <div className="font-body text-xs text-imperial-muted">
                {isIdentified ? 'Match' : 'Candidates'}
              </div>
            </div>
            <div className="bg-imperial-surface rounded p-3">
              <div className={`font-display text-lg ${weightValid ? 'text-green-400' : 'text-amber-400'}`}>
                {weightValid ? '✓' : '⚠'}
              </div>
              <div className="font-body text-xs text-imperial-muted">Weight Check</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pb-4">
          <button
            onClick={onReset}
            className="btn-primary"
          >
            ↺ Identify Another Coin
          </button>

          <button
            onClick={() => window.print()}
            className="btn-ghost text-xs"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}
