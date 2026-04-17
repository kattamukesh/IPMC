#!/usr/bin/env node
/**
 * IPMC CSV Import Script
 * 
 * CSV format expected (coin_symbols.csv):
 *   symbol_id,coin_ids,position
 *   1,"1,2,3",1
 *   2,"4,5",2
 * 
 * Or symbol_coins.csv mapping:
 *   symbol_id,coin_id,position
 *   1,1,1
 *   1,2,1
 * 
 * Usage:
 *   node scripts/import-csv.js --file path/to/file.csv [--clear]
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const args = process.argv.slice(2);
const fileArg = args.indexOf('--file');
const clearArg = args.includes('--clear');
const helpArg = args.includes('--help') || args.includes('-h');

if (helpArg) {
  console.log(`
IPMC CSV Import Script
======================
Usage: node scripts/import-csv.js --file <path> [--clear]

CSV Formats supported:

Format A (multi-coin per row):
  symbol_id,coin_ids,position
  1,"1,2,3",1

Format B (one row per coin-symbol pair):
  symbol_id,coin_id,position
  1,1,1
  1,2,1

Options:
  --file <path>   Path to CSV file (required)
  --clear         Clear existing coin_symbols before import
  --help          Show this help

Examples:
  node scripts/import-csv.js --file data/symbols.csv
  node scripts/import-csv.js --file data/symbols.csv --clear
  `);
  process.exit(0);
}

if (fileArg === -1 || !args[fileArg + 1]) {
  console.error('Error: --file <path> is required. Run with --help for usage.');
  process.exit(1);
}

const csvPath = path.resolve(args[fileArg + 1]);
if (!fs.existsSync(csvPath)) {
  console.error(`Error: File not found: ${csvPath}`);
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'backend', 'db', 'ipmc.db');
if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database not found at ${dbPath}. Run the app first to initialize the database.`);
  process.exit(1);
}

const db = new Database(dbPath);

function parseCSV(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted fields
    const fields = [];
    let inQuote = false;
    let current = '';
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { fields.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    fields.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
    rows.push(row);
  }
  return { headers, rows };
}

function importData(rows, headers) {
  if (clearArg) {
    db.prepare('DELETE FROM coin_symbols').run();
    console.log('[Import] Cleared existing coin_symbols');
  }

  const insertStmt = db.prepare(
    'INSERT OR IGNORE INTO coin_symbols (coin_id, symbol_id, position) VALUES (?, ?, ?)'
  );

  // Detect format
  const hasMultiCoin = headers.includes('coin_ids');
  const hasSingleCoin = headers.includes('coin_id');

  if (!hasMultiCoin && !hasSingleCoin) {
    throw new Error('CSV must have either "coin_id" or "coin_ids" column');
  }
  if (!headers.includes('symbol_id')) throw new Error('CSV must have "symbol_id" column');
  if (!headers.includes('position')) throw new Error('CSV must have "position" column');

  let inserted = 0;
  let errors = 0;

  const importMany = db.transaction((rows) => {
    for (const row of rows) {
      try {
        const symbolId = parseInt(row.symbol_id);
        const position = parseInt(row.position);

        if (isNaN(symbolId) || isNaN(position) || position < 1 || position > 5) {
          console.warn(`[Import] Skipping invalid row:`, row);
          errors++;
          continue;
        }

        // Validate symbol exists
        const sym = db.prepare('SELECT id FROM symbols WHERE id = ?').get(symbolId);
        if (!sym) {
          console.warn(`[Import] Symbol ${symbolId} not found, skipping`);
          errors++;
          continue;
        }

        if (hasMultiCoin) {
          const coinIds = row.coin_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          for (const coinId of coinIds) {
            const coin = db.prepare('SELECT id FROM coins WHERE id = ?').get(coinId);
            if (!coin) { console.warn(`[Import] Coin ${coinId} not found`); errors++; continue; }
            insertStmt.run(coinId, symbolId, position);
            inserted++;
          }
        } else {
          const coinId = parseInt(row.coin_id);
          if (isNaN(coinId)) { errors++; continue; }
          const coin = db.prepare('SELECT id FROM coins WHERE id = ?').get(coinId);
          if (!coin) { console.warn(`[Import] Coin ${coinId} not found`); errors++; continue; }
          insertStmt.run(coinId, symbolId, position);
          inserted++;
        }
      } catch (err) {
        console.error(`[Import] Error on row:`, row, err.message);
        errors++;
      }
    }
  });

  importMany(rows);

  return { inserted, errors };
}

try {
  const content = fs.readFileSync(csvPath, 'utf8');
  const { headers, rows } = parseCSV(content);
  console.log(`[Import] Parsed ${rows.length} rows from ${csvPath}`);
  
  const { inserted, errors } = importData(rows, headers);
  
  console.log(`[Import] Complete: ${inserted} records inserted, ${errors} errors`);

  // Summary
  const total = db.prepare('SELECT COUNT(*) as cnt FROM coin_symbols').get();
  console.log(`[Import] Total coin_symbols in DB: ${total.cnt}`);
} catch (err) {
  console.error('[Import] Fatal error:', err.message);
  process.exit(1);
}
