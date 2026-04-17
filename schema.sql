-- ============================================================
-- IPMC – Imperial Coin Identifier Database Schema
-- SQLite · File: backend/db/ipmc.db
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ────────────────────────────────────────────────────────────
-- Table: coins
-- Represents individual imperial coin types
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  series         TEXT    NOT NULL,
  size_category  TEXT    NOT NULL CHECK(size_category IN ('small','medium','large')),
  weight_min     REAL,       -- grams (nominal × 0.80 i.e. -20%)
  weight_max     REAL,       -- grams (nominal × 1.20 i.e. +20%)
  weight_nominal REAL        -- grams, standard weight
);

-- ────────────────────────────────────────────────────────────
-- Table: symbols
-- Catalogue of symbols/motifs found on imperial coins
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS symbols (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  label           TEXT    NOT NULL,
  description     TEXT,
  image_filename  TEXT            -- file inside /assets/symbols/
);

-- ────────────────────────────────────────────────────────────
-- Table: coin_symbols
-- Many-to-many: which symbol appears at which position on a coin
-- position: 1 = Obverse, 2 = Portrait, 3 = Reverse, 4 = Legend, 5 = Edge
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_symbols (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id   INTEGER NOT NULL REFERENCES coins(id)   ON DELETE CASCADE,
  symbol_id INTEGER NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL CHECK(position BETWEEN 1 AND 5)
);

-- Indexes for fast filtering queries
CREATE INDEX IF NOT EXISTS idx_coin_symbols_position ON coin_symbols(position);
CREATE INDEX IF NOT EXISTS idx_coin_symbols_coin     ON coin_symbols(coin_id);
CREATE INDEX IF NOT EXISTS idx_coin_symbols_symbol   ON coin_symbols(symbol_id);

-- ────────────────────────────────────────────────────────────
-- Example data (inserted by application seed on first run)
-- ────────────────────────────────────────────────────────────

-- Sample symbols insert:
-- INSERT INTO symbols (label, description, image_filename)
--   VALUES ('Eagle', 'Imperial Eagle motif', 'eagle.png');

-- Sample coin insert:
-- INSERT INTO coins (name, series, size_category, weight_min, weight_max, weight_nominal)
--   VALUES ('Crown', 'British Imperial', 'large', 22.616, 33.924, 28.27);

-- Sample coin_symbols insert:
-- INSERT INTO coin_symbols (coin_id, symbol_id, position) VALUES (1, 1, 1);

-- ────────────────────────────────────────────────────────────
-- Useful queries
-- ────────────────────────────────────────────────────────────

-- Get all coins with their symbols:
-- SELECT c.name, c.series, c.size_category, s.label, cs.position
-- FROM coins c
-- JOIN coin_symbols cs ON cs.coin_id = c.id
-- JOIN symbols s ON s.id = cs.symbol_id
-- ORDER BY c.id, cs.position;

-- Filter coins by size and symbol at position 1:
-- SELECT DISTINCT c.id, c.name, c.series
-- FROM coins c
-- JOIN coin_symbols cs ON cs.coin_id = c.id
-- WHERE c.size_category = 'large'
--   AND cs.position = 1
--   AND cs.symbol_id = 1;
