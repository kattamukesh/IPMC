import React, { useState } from 'react';

export default function CategoryFilter({ categories, selectedCategories, onChange, disabled = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleCategory = (category) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    onChange(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      onChange([]);
    } else {
      onChange([...categories]);
    }
  };

  const isAllSelected = selectedCategories.length === categories.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm font-body text-left
          transition-all duration-200
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'border-imperial-border bg-imperial-card hover:border-gold-600/60'
          }
          ${isOpen ? 'border-gold-500/60 bg-gold-500/5' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedCategories.length === 0 ? 'text-imperial-muted' : 'text-imperial-text'}>
            {selectedCategories.length === 0
              ? 'All Categories'
              : selectedCategories.length === categories.length
              ? 'All Categories'
              : `${selectedCategories.length} selected`}
          </span>
          <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-imperial-darker border border-imperial-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Search input */}
          <div className="sticky top-0 bg-imperial-darker border-b border-imperial-border p-2">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 bg-imperial-surface border border-imperial-border rounded text-xs font-body text-imperial-text placeholder-imperial-muted focus:outline-none focus:border-gold-500/60"
            />
          </div>

          {/* Select all option */}
          <button
            onClick={handleSelectAll}
            className="w-full px-3 py-2 text-left text-xs hover:bg-imperial-surface transition-colors flex items-center gap-2"
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              readOnly
              className="w-4 h-4 cursor-pointer"
            />
            <span className="font-display uppercase tracking-wider text-gold-400">All</span>
          </button>

          {/* Category options */}
          {filteredCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleToggleCategory(cat)}
              className="w-full px-3 py-2 text-left text-xs hover:bg-imperial-surface transition-colors flex items-center gap-2 border-b border-imperial-border/30 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                readOnly
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-body text-imperial-text">{cat}</span>
            </button>
          ))}

          {filteredCategories.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-imperial-muted italic">
              No categories match your search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
