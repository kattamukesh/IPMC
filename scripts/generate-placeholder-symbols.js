#!/usr/bin/env node
/**
 * generate-placeholder-symbols.js
 * Creates SVG placeholder images for each symbol in /assets/symbols/
 * Run once: node scripts/generate-placeholder-symbols.js
 */

const fs = require('fs');
const path = require('path');

const symbolsDir = path.join(__dirname, '..', 'assets', 'symbols');
if (!fs.existsSync(symbolsDir)) fs.mkdirSync(symbolsDir, { recursive: true });

const symbols = [
  { file: 'eagle.png',  label: 'Eagle',  path: 'M12 3 L9 9 L3 9 L8 13 L6 20 L12 16 L18 20 L16 13 L21 9 L15 9 Z', color: '#d4952a' },
  { file: 'crown.png',  label: 'Crown',  path: 'M4 18 L4 12 L7 15 L12 8 L17 15 L20 12 L20 18 Z', color: '#e8b84e' },
  { file: 'shield.png', label: 'Shield', path: 'M12 3 L21 7 L21 14 C21 18.5 17 21.5 12 22 C7 21.5 3 18.5 3 14 L3 7 Z', color: '#b8750f' },
  { file: 'cross.png',  label: 'Cross',  path: 'M11 3 L13 3 L13 11 L21 11 L21 13 L13 13 L13 21 L11 21 L11 13 L3 13 L3 11 L11 11 Z', color: '#d4952a' },
  { file: 'star.png',   label: 'Star',   path: 'M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z', color: '#f5d96d' },
  { file: 'wreath.png', label: 'Wreath', path: 'M12 4 C8 4 5 7 5 11 C5 14 7 16.5 10 17.5 L10 20 L14 20 L14 17.5 C17 16.5 19 14 19 11 C19 7 16 4 12 4 Z M9 11 C9 9.3 10.3 8 12 8 C13.7 8 15 9.3 15 11 C15 12.7 13.7 14 12 14 C10.3 14 9 12.7 9 11 Z', color: '#7a9a3a' },
  { file: 'lion.png',   label: 'Lion',   path: 'M8 4 C6 4 4 5.5 4 8 C4 10 5.5 11.5 7 12 L5 20 L8 20 L9.5 15 L12 16 L14.5 15 L16 20 L19 20 L17 12 C18.5 11.5 20 10 20 8 C20 5.5 18 4 16 4 C14 4 13 5 12 5 C11 5 10 4 8 4 Z', color: '#d4952a' },
  { file: 'bust.png',   label: 'Bust',   path: 'M12 3 C9.2 3 7 5.2 7 8 C7 10.3 8.5 12.3 10.5 13.1 L9 21 L15 21 L13.5 13.1 C15.5 12.3 17 10.3 17 8 C17 5.2 14.8 3 12 3 Z', color: '#c8a56e' },
  { file: 'anchor.png', label: 'Anchor', path: 'M12 3 C10.3 3 9 4.3 9 6 C9 7.4 9.9 8.6 11 9.2 L11 14 L7 14 L7 16 L11 16 L11 19.5 C9.2 19.2 7.9 18 7 16.5 L5 17.5 C6.3 20 9 22 12 22 C15 22 17.7 20 19 17.5 L17 16.5 C16.1 18 14.8 19.2 13 19.5 L13 16 L17 16 L17 14 L13 14 L13 9.2 C14.1 8.6 15 7.4 15 6 C15 4.3 13.7 3 12 3 Z', color: '#4a7ab5' },
  { file: 'sword.png',  label: 'Sword',  path: 'M11 3 L13 3 L13 16 L15 18 L13 18 L12 20 L11 18 L9 18 L11 16 Z M9 10 L15 10', color: '#8a8a9a' },
  { file: 'fleur.png',  label: 'Fleur',  path: 'M12 20 L12 12 M12 12 C12 8 8 5 8 5 C8 5 8 9 12 12 M12 12 C12 8 16 5 16 5 C16 5 16 9 12 12 M12 12 L12 4 M10 7 L14 7', color: '#e8b84e' },
  { file: 'globe.png',  label: 'Globe',  path: 'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 Z M2 12 L22 12 M12 2 C12 2 8 7 8 12 C8 17 12 22 12 22 M12 2 C12 2 16 7 16 12 C16 17 12 22 12 22', color: '#4a8ab5' },
];

function makeSVG(symbol) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128">
  <rect width="24" height="24" rx="4" fill="#1a1a28"/>
  <path d="${symbol.path}" fill="${symbol.color}" stroke="${symbol.color}" stroke-width="0.3" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>
  <text x="12" y="23.5" text-anchor="middle" font-family="serif" font-size="2.2" fill="${symbol.color}" opacity="0.7">${symbol.label}</text>
</svg>`;
}

let created = 0;
symbols.forEach(sym => {
  // We save as .png filename but it's actually an SVG — the browser handles both
  // For proper PNG, use a canvas library. This creates SVG files named .png
  // which modern browsers and Electron will display correctly.
  const filePath = path.join(symbolsDir, sym.file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, makeSVG(sym), 'utf8');
    console.log(`[Symbols] Created: ${sym.file}`);
    created++;
  } else {
    console.log(`[Symbols] Exists (skipped): ${sym.file}`);
  }
});

console.log(`[Symbols] Done. ${created} new files created in ${symbolsDir}`);
