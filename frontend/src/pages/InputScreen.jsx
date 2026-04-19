import React, { useState, useRef } from 'react';
import { api } from '../api';

const SIZE_OPTIONS = [
  {
    value: 'small',
    label: 'Small',
    desc: 'Diameter < 20mm',
    icon: '●',
    examples: 'Farthing, Halfpenny, Pfennig',
  },
  {
    value: 'medium',
    label: 'Medium',
    desc: 'Diameter 20–30mm',
    icon: '◉',
    examples: 'Penny, Shilling, Franc',
  },
  {
    value: 'large',
    label: 'Large',
    desc: 'Diameter > 30mm',
    icon: '◎',
    examples: 'Crown, Thaler, Écu',
  },
];

export default function InputScreen({ onNext, sessionId, setSessionId, onBack }) {
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weightWarning, setWeightWarning] = useState(null);
  const fileInputRef = useRef();

  // Weight validation: check if weight is within ±20% of 3.4g
  const validateWeight = (weightValue) => {
    if (!weightValue) return null;

    const weightNum = parseFloat(weightValue);
    const idealWeight = 3.4;
    const tolerance = 0.2; // 20%
    const minWeight = idealWeight * (1 - tolerance);
    const maxWeight = idealWeight * (1 + tolerance);

    if (weightNum < minWeight || weightNum > maxWeight) {
      return 'The weight of the input coin does not fall in the ideal range of an imperial coin, so please verify its authenticity.';
    }
    return null;
  };

  // Update weight warning when weight changes
  const handleWeightChange = (value) => {
    setWeight(value);
    const warning = validateWeight(value);
    setWeightWarning(warning);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!size) { setError('Please select a coin size.'); return; }
    setError(null);
    setLoading(true);
    try {
      // Create or reuse session
      let sid = sessionId;
      if (!sid) {
        const s = await api.createSession();
        sid = s.sessionId;
        setSessionId(sid);
      }

      const result = await api.filterSize(sid, weight ? parseFloat(weight) : null, size);

      // Upload image if provided
      if (imageFile) {
        try { await api.uploadImage(sid, imageFile); } catch (_) {}
      }

      onNext({
        ...result,
        imagePreview,
        weightWarning: weight ? validateWeight(weight) : null,
        weight: weight ? parseFloat(weight) : null
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-gold-500/40 bg-gold-500/5 flex items-center justify-center animate-glow-pulse">
              <span className="text-3xl text-gold-400">♛</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="btn-secondary text-sm"
            >
              ← Back to Home
            </button>
            <div className="flex-1"></div>
          </div>
          <h2 className="font-display text-2xl tracking-widest text-gold-200 uppercase">Coin Analysis</h2>
          <p className="font-body text-base text-imperial-muted italic">
            Provide measurements to begin imperial coin identification
          </p>
        </div>

        <div className="gold-divider" />

        {/* Weight Input */}
        <div className="card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gold-500">⚖</span>
            <label className="font-display text-xs tracking-widest uppercase text-gold-400">
              Coin Weight
            </label>
            <span className="ml-auto font-body text-xs text-imperial-muted italic">Optional · ±20% tolerance</span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter weight in grams…"
              value={weight}
              onChange={e => handleWeightChange(e.target.value)}
              className="input-field"
            />
            <span className="font-display text-xs text-gold-500 tracking-wider whitespace-nowrap">grams</span>
          </div>

          {/* Weight Warning */}
          {weightWarning && (
            <div className="border border-amber-700/50 bg-amber-900/10 rounded-lg p-3 flex gap-3">
              <span className="text-amber-400 shrink-0">⚠</span>
              <p className="font-body text-sm text-amber-300/80">{weightWarning}</p>
            </div>
          )}

          <p className="font-body text-xs text-imperial-muted">
            Ideal range: 2.72g - 4.08g (±20% of 3.4g standard)
          </p>
        </div>

        {/* Size Selection */}
        <div className="card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gold-500">◎</span>
            <label className="font-display text-xs tracking-widest uppercase text-gold-400">
              Coin Size
            </label>
            <span className="text-red-400 text-xs ml-1">*required</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SIZE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSize(opt.value)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border text-center
                  transition-all duration-200
                  ${size === opt.value
                    ? 'border-gold-400 bg-gold-500/10 shadow-lg shadow-gold-500/20'
                    : 'border-imperial-border bg-imperial-surface hover:border-gold-700/60'
                  }
                `}
              >
                <span className={`text-2xl ${size === opt.value ? 'text-gold-300' : 'text-imperial-muted'}`}>
                  {opt.icon}
                </span>
                <div>
                  <div className={`font-display text-sm tracking-wider uppercase ${size === opt.value ? 'text-gold-200' : 'text-gold-400'}`}>
                    {opt.label}
                  </div>
                  <div className="font-body text-xs text-imperial-muted">{opt.desc}</div>
                  <div className="font-body text-xs text-imperial-muted italic mt-1 leading-tight">{opt.examples}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gold-500">📷</span>
            <label className="font-display text-xs tracking-widest uppercase text-gold-400">Coin Image</label>
            <span className="ml-auto font-body text-xs text-imperial-muted italic">Optional · Reference only</span>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer
              transition-all duration-200
              ${imagePreview
                ? 'border-gold-600/60 bg-gold-500/5'
                : 'border-imperial-muted/40 bg-imperial-surface/30 hover:border-gold-700/50'
              }
            `}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Coin preview" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <>
                <span className="text-4xl text-imperial-muted">⬆</span>
                <div className="text-center">
                  <div className="font-display text-xs tracking-wider uppercase text-gold-500">Click to upload</div>
                  <div className="font-body text-xs text-imperial-muted">PNG, JPG, WEBP up to 10MB</div>
                </div>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          {imagePreview && (
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="font-display text-xs tracking-wider text-red-400 hover:text-red-300 uppercase"
            >
              Remove Image
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-800/50 bg-red-900/10 rounded-lg p-4 flex gap-3">
            <span className="text-red-400 shrink-0">⚠</span>
            <p className="font-body text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pb-4 animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <button
            onClick={handleSubmit}
            disabled={!size || loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/>
                </svg>
                Processing…
              </span>
            ) : (
              'Begin Identification →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
