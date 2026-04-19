import React from 'react';

export default function LandingPage({ onStartIdentification, onViewGallery }) {
  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex flex-col">

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            {/* Imperial Crown */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-gold-400 bg-gold-500/10 flex items-center justify-center shadow-2xl shadow-gold-500/20 animate-glow-pulse">
                <span className="text-5xl text-gold-300">♛</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl md:text-5xl tracking-widest text-gold-200 uppercase">
                Imperial Coin
              </h1>
              <h2 className="font-display text-2xl md:text-3xl tracking-wide text-gold-400">
                Identification System
              </h2>
              <p className="font-body text-lg text-imperial-muted max-w-2xl mx-auto leading-relaxed">
                Discover the rich history of British imperial coins through advanced symbol recognition.
                Identify your coins by their distinctive symbols and markings from the colonial era.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/5 flex items-center justify-center mx-auto">
                  <span className="text-2xl text-gold-400">⚖</span>
                </div>
                <h3 className="font-display text-lg tracking-wide text-gold-300">Precise Measurement</h3>
                <p className="font-body text-sm text-imperial-muted">
                  Weight and size analysis for accurate coin classification
                </p>
              </div>

              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/5 flex items-center justify-center mx-auto">
                  <span className="text-2xl text-gold-400">✦</span>
                </div>
                <h3 className="font-display text-lg tracking-wide text-gold-300">Symbol Recognition</h3>
                <p className="font-body text-sm text-imperial-muted">
                  Advanced pattern matching for imperial coin symbols
                </p>
              </div>

              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/5 flex items-center justify-center mx-auto">
                  <span className="text-2xl text-gold-400">🗺</span>
                </div>
                <h3 className="font-display text-lg tracking-wide text-gold-300">Historical Context</h3>
                <p className="font-body text-sm text-imperial-muted">
                  Geographic distribution and historical significance
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="bg-imperial-darker/30 border-t border-imperial-border">
          <div className="max-w-6xl mx-auto p-8">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl tracking-wide text-gold-300 mb-2">
                Imperial Coin Distribution
              </h3>
              <p className="font-body text-sm text-imperial-muted">
                Explore where different coin series were prevalent across British India
              </p>
            </div>

            {/* Simple Map Placeholder - In a real app, this would be an interactive SVG map */}
            <div className="relative bg-imperial-surface rounded-lg border border-imperial-border p-8">
              <div className="aspect-[16/10] bg-imperial-dark rounded border-2 border-dashed border-imperial-muted/30 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <span className="text-6xl text-imperial-muted/50">🗺</span>
                  <div className="space-y-2">
                    <p className="font-display text-lg text-imperial-muted">Interactive Map</p>
                    <p className="font-body text-sm text-imperial-muted/70 max-w-md">
                      This map would show the geographic distribution of different imperial coin series
                      across British India, highlighting regional variations and historical circulation patterns.
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="mt-6 grid md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500/60"></div>
                  <span className="font-body text-xs text-imperial-muted">Victoria Series</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500/60"></div>
                  <span className="font-body text-xs text-imperial-muted">Edward Series</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500/60"></div>
                  <span className="font-body text-xs text-imperial-muted">George Series</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-500/60"></div>
                  <span className="font-body text-xs text-imperial-muted">Elizabeth Series</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Gallery Button */}
        <div className="bg-imperial-darker/50 border-t border-imperial-border">
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={onViewGallery}
                  className="btn-secondary inline-flex items-center gap-3"
                >
                  <span className="text-xl">🪙</span>
                  <span>View Coin Gallery</span>
                </button>
              </div>
              <p className="font-body text-sm text-imperial-muted">
                Explore our comprehensive collection of imperial coins with their symbol mappings
              </p>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={onStartIdentification}
            className="w-16 h-16 rounded-full bg-gold-500 hover:bg-gold-400 text-imperial-dark font-display text-lg shadow-2xl shadow-gold-500/30 transition-all duration-300 hover:scale-110 flex items-center justify-center"
            title="Start Coin Identification"
          >
            <span className="text-2xl">▶</span>
          </button>
        </div>

      </div>
    </div>
  );
}