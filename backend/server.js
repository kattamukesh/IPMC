// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');
// const { v4: uuidv4 } = (() => {
//   try { return require('uuid'); } catch { return { v4: () => Math.random().toString(36).slice(2) }; }
// })();

// const { getDb } = require('./db/database');

// const app = express();
// const PORT = process.env.PORT || 3001;

// const isDev = process.env.NODE_ENV === 'development' || !process.env.RESOURCES_PATH;
// const resourcesPath = process.env.RESOURCES_PATH || path.join(__dirname, '..');

// function getAssetsPath() {
//   return isDev
//     ? path.join(__dirname, '..', 'assets')
//     : path.join(resourcesPath, 'assets');
// }

// // In-memory session store
// const sessions = new Map();

// function createSession() {
//   const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
//   const session = {
//     id,
//     weight: null,
//     weightValid: true,
//     sizeCategory: null,
//     selectedSymbols: [],        // [{position, symbolId}] for guided steps OR [symbolId, ...] for initial selection
//     selectedSymbolIds: [],      // NEW: [id, id, ...] for initial multi-select
//     possibleCoinIds: null,      // null = all coins, otherwise [coinLabel, ...]
//     refinementPositions: [],    // NEW: remaining positions for refinement
//     stage: 'input',             // NEW: 'input' | 'initial_selection' | 'refinement' | 'result'
//     createdAt: Date.now(),
//   };
//   sessions.set(id, session);
//   return session;
// }

// function getSession(id) {
//   return sessions.get(id) || null;
// }

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve symbol images
// app.use('/assets/symbols', (req, res, next) => {
//   const symbolsDir = path.join(getAssetsPath(), 'symbols');
//   express.static(symbolsDir)(req, res, next);
// });

// // Upload dir for coin images
// const uploadDir = path.join(getAssetsPath(), 'uploads');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // ─── Helper Functions ─────────────────────────────────

// // Get coins containing ALL selected symbols
// function getCoinsWithAllSymbols(db, selectedSymbolLabels) {
//   if (!selectedSymbolLabels || selectedSymbolLabels.length === 0) {
//     return [];
//   }
//   const placeholders = selectedSymbolLabels.map(() => '?').join(',');
//   const result = db.prepare(`
//     SELECT coin_label, COUNT(*) as cnt
//     FROM coin_symbols
//     WHERE symbol_label IN (${placeholders})
//     GROUP BY coin_label
//     HAVING cnt = ?
//   `).all(...selectedSymbolLabels, selectedSymbolLabels.length);

//   return result.map(r => r.coin_label);
// }

// // Get remaining positions for a set of coins
// function getRemainingPositions(db, coinLabels) {
//   if (!coinLabels || coinLabels.length === 0) return [];
//   const placeholders = coinLabels.map(() => '?').join(',');
//   const result = db.prepare(`
//     SELECT DISTINCT position FROM coin_symbols
//     WHERE coin_label IN (${placeholders})
//     ORDER BY position ASC
//   `).all(...coinLabels);

//   return result.map(r => r.position);
// }

// // Get symbols at a position for given coins
// function getSymbolsForPosition(db, coinLabels, position) {
//   if (!coinLabels || coinLabels.length === 0) return [];
//   const placeholders = coinLabels.map(() => '?').join(',');
//   const result = db.prepare(`
//     SELECT DISTINCT s.id, s.label, s.description, s.image_filename
//     FROM symbols s
//     INNER JOIN coin_symbols cs ON cs.symbol_label = s.label
//     WHERE cs.coin_label IN (${placeholders}) AND cs.position = ?
//     ORDER BY s.label
//   `).all(...coinLabels, position);

//   return result.map(s => ({
//     id: s.id,
//     label: s.label,
//     description: s.description,
//     imageUrl: `/assets/symbols/${s.image_filename}`,
//   }));
// }

// // ─── Routes ───────────────────────────────────────────────

// // POST /session - create a new identification session
// app.post('/session', (req, res) => {
//   const session = createSession();
//   res.json({ sessionId: session.id });
// });

// // GET /symbols/initial - Get all symbols grouped by position for initial selection
// app.get('/symbols/initial', (req, res) => {
//   const db = getDb();

//   const symbols = db.prepare(`
//     SELECT DISTINCT s.id, s.label, s.description, s.image_filename, cs.position
//     FROM symbols s
//     INNER JOIN coin_symbols cs ON cs.symbol_label = s.label
//     ORDER BY cs.position ASC, s.label ASC
//   `).all();

//   // Group by position
//   const grouped = {};
//   [1, 2, 3, 4, 5].forEach(pos => { grouped[pos] = []; });

//   symbols.forEach(s => {
//     if (!grouped[s.position]) grouped[s.position] = [];
//     grouped[s.position].push({
//       id: s.id,
//       label: s.label,
//       description: s.description,
//       imageUrl: `/assets/symbols/${s.image_filename}`,
//     });
//   });

//   res.json({ symbols: grouped });
// });

// // POST /select-initial-symbols - Perform initial filtering by multi-select symbols
// app.post('/select-initial-symbols', (req, res) => {
//   const { sessionId, selectedSymbolIds } = req.body;

//   if (!sessionId || !selectedSymbolIds || selectedSymbolIds.length === 0) {
//     return res.status(400).json({ error: 'sessionId and selectedSymbolIds required' });
//   }

//   if (selectedSymbolIds.length > 5) {
//     return res.status(400).json({ error: 'Maximum 5 symbols allowed' });
//   }

//   let session = getSession(sessionId);
//   if (!session) {
//     session = createSession();
//     sessions.set(sessionId, session);
//   }

//   const db = getDb();

//   // Get symbol labels from IDs
//   const placeholders = selectedSymbolIds.map(() => '?').join(',');
//   const symbolRecords = db.prepare(`
//     SELECT label FROM symbols WHERE id IN (${placeholders})
//   `).all(...selectedSymbolIds);

//   const symbolLabels = symbolRecords.map(r => r.label);

//   // Get coins containing ALL selected symbols (set intersection)
//   const possibleCoinLabels = getCoinsWithAllSymbols(db, symbolLabels);

//   // Get remaining positions from these coins
//   const remainingPositions = getRemainingPositions(db, possibleCoinLabels);

//   // Get the actual coin details
//   const coinDetails = possibleCoinLabels.length > 0
//     ? db.prepare(`
//         SELECT label, name, series FROM coins
//         WHERE label IN (${possibleCoinLabels.map(() => '?').join(',')})
//       `).all(...possibleCoinLabels)
//     : [];

//   // Update session
//   session.selectedSymbolIds = selectedSymbolIds;
//   session.possibleCoinIds = possibleCoinLabels;
//   session.refinementPositions = remainingPositions;
//   session.stage = possibleCoinLabels.length === 1 ? 'result' : 'refinement';

//   // Determine status
//   let status = 'narrowed';
//   if (possibleCoinLabels.length === 0) {
//     status = 'no_match';
//   } else if (possibleCoinLabels.length === 1) {
//     status = 'identified';
//   }

//   res.json({
//     sessionId: session.id,
//     possibleCount: possibleCoinLabels.length,
//     possibleCoins: coinDetails.map(c => ({ id: c.label, name: c.name, series: c.series })),
//     selectedSymbolIds,
//     remainingPositions,
//     status,
//   });
// });

// // GET /next-step-symbols - Get symbols for next refinement step
// app.get('/next-step-symbols', (req, res) => {
//   const { sessionId, position } = req.query;

//   if (!sessionId || !position) {
//     return res.status(400).json({ error: 'sessionId and position required' });
//   }

//   const session = getSession(sessionId);
//   if (!session || !session.possibleCoinIds || session.possibleCoinIds.length === 0) {
//     return res.status(404).json({ error: 'Session not found or no possible coins' });
//   }

//   const pos = parseInt(position);
//   const db = getDb();

//   // Get symbols at this position from possible coins
//   const symbols = getSymbolsForPosition(db, session.possibleCoinIds, pos);

//   res.json({
//     position: pos,
//     symbols,
//     remainingPositions: session.refinementPositions,
//   });
// });

// // POST /select-step-symbol - Select symbol during refinement, filter coins
// app.post('/select-step-symbol', (req, res) => {
//   const { sessionId, position, symbolId } = req.body;

//   if (!sessionId || !position || !symbolId) {
//     return res.status(400).json({ error: 'sessionId, position, symbolId required' });
//   }

//   const session = getSession(sessionId);
//   if (!session || !session.possibleCoinIds || session.possibleCoinIds.length === 0) {
//     return res.status(404).json({ error: 'Session not found or no possible coins' });
//   }

//   const db = getDb();
//   const pos = parseInt(position);
//   const symId = parseInt(symbolId);

//   // Get symbol label
//   const symbolRecord = db.prepare(`SELECT label FROM symbols WHERE id = ?`).get(symId);
//   if (!symbolRecord) {
//     return res.status(400).json({ error: 'Symbol not found' });
//   }

//   // Filter to coins that have this symbol at this position
//   const placeholders = session.possibleCoinIds.map(() => '?').join(',');
//   const filtered = db.prepare(`
//     SELECT DISTINCT coin_label FROM coin_symbols
//     WHERE position = ? AND symbol_label = ? AND coin_label IN (${placeholders})
//   `).all(pos, symbolRecord.label, ...session.possibleCoinIds);

//   const filteredCoinLabels = filtered.map(r => r.coin_label);

//   // Update session
//   session.possibleCoinIds = filteredCoinLabels;

//   // Get remaining positions from filtered coins
//   const remainingPositions = getRemainingPositions(db, filteredCoinLabels);
//   session.refinementPositions = remainingPositions;

//   // Get coin details
//   const coinDetails = filteredCoinLabels.length > 0
//     ? db.prepare(`
//         SELECT label, name, series FROM coins
//         WHERE label IN (${filteredCoinLabels.map(() => '?').join(',')})
//       `).all(...filteredCoinLabels)
//     : [];

//   // Determine status
//   let status = 'continue';
//   if (filteredCoinLabels.length === 1) {
//     status = 'identified';
//     session.stage = 'result';
//   } else if (filteredCoinLabels.length === 0) {
//     status = 'no_match';
//     session.stage = 'result';
//   }

//   res.json({
//     position: pos,
//     symbolId: symId,
//     possibleCount: filteredCoinLabels.length,
//     possibleCoins: coinDetails.map(c => ({ id: c.label, name: c.name, series: c.series })),
//     remainingPositions,
//     status,
//   });
// });


// // POST /filter/size
// app.post('/filter/size', (req, res) => {
//   const { sessionId, weight, sizeCategory } = req.body;

//   if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

//   let session = getSession(sessionId);
//   if (!session) {
//     session = createSession();
//     sessions.set(sessionId, session);
//   }

//   const db = getDb();

//   // // Weight validation
//   // let weightValid = true;
//   // let weightNote = null;

//   // if (weight != null && !isNaN(weight) && weight > 0) {
//   //   session.weight = parseFloat(weight);
//   //   // Check if weight falls in range for any coin (±20% tolerance already baked into DB)
//   //   const anyMatch = db.prepare(`
//   //     SELECT COUNT(*) as cnt FROM coins
//   //     WHERE weight_min IS NOT NULL
//   //       AND ? BETWEEN weight_min AND weight_max
//   //       AND size_category = ?
//   //   `).get(session.weight, sizeCategory);

//   //   weightValid = anyMatch.cnt > 0;
//   //   session.weightValid = weightValid;
//   //   if (!weightValid) {
//   //     weightNote = 'Weight does not match standard imperial coin weights (±20% tolerance). This coin may not be an imperial coin.';
//   //   }
//   // }
//   session.sizeCategory = sizeCategory;
//   session.weightValid = true;

//   // Filter coins by size
//   const coins = db.prepare(`
//     SELECT label FROM coins WHERE size_category = ?
//   `).all(sizeCategory);

//   session.possibleCoinIds = coins.map(c => c.label);
//   // const coins = db.prepare(`
//   //   SELECT id FROM coins WHERE size_category = ?
//   // `).all(sizeCategory);

//   // session.possibleCoinIds = coins.map(c => c.id);
//   session.selectedSymbols = [];

//   res.json({
//     sessionId: session.id,
//     possibleCount: session.possibleCoinIds.length,
//     sizeCategory,
//   });
// });

// // GET /categories - Get all unique symbol categories
// app.get('/categories', (req, res) => {
//   const db = getDb();
//   const categories = db.prepare(`
//     SELECT DISTINCT category FROM symbols
//     WHERE category IS NOT NULL
//     ORDER BY category ASC
//   `).all();

//   res.json({
//     categories: categories.map(c => c.category),
//   });
// });

// // GET /symbols/:position - Get symbols at position (with optional category filter)
// app.get('/symbols/:position', (req, res) => {
//   const { position } = req.params;
//   const { sessionId, categories } = req.query;

//   const pos = parseInt(position);
//   if (isNaN(pos) || pos < 1 || pos > 5) {
//     return res.status(400).json({ error: 'position must be 1-5' });
//   }

//   const db = getDb();
//   let coinFilter = '';
//   let categoryFilter = '';
//   let params = [pos];

//   // Filter by session's possible coins
//   if (sessionId) {
//     const session = getSession(sessionId);
//     if (session && session.possibleCoinIds && session.possibleCoinIds.length > 0) {
//       coinFilter = `AND cs.coin_label IN (${session.possibleCoinIds.map(() => '?').join(',')})`;
//       params = [pos, ...session.possibleCoinIds];
//     }
//   }

//   // Parse category filter (comma-separated or array)
//   if (categories) {
//     const catArray = typeof categories === 'string' ? categories.split(',').filter(c => c) : categories;
//     if (catArray.length > 0) {
//       const catPlaceholders = catArray.map(() => '?').join(',');
//       categoryFilter = `AND s.category IN (${catPlaceholders})`;
//       params.push(...catArray);
//     }
//   }

//   const symbols = db.prepare(`
//     SELECT DISTINCT s.id, s.label, s.description, s.image_filename, s.category
//     FROM symbols s
//     INNER JOIN coin_symbols cs ON cs.symbol_label = s.label
//     WHERE cs.position = ? ${coinFilter} ${categoryFilter}
//     ORDER BY s.label
//   `).all(...params);

//   res.json({
//     position: pos,
//     symbols: symbols.map(s => ({
//       id: s.id,
//       label: s.label,
//       description: s.description,
//       category: s.category,
//       imageUrl: `/assets/symbols/${s.image_filename}`,
//     })),
//   });
// });

// // POST /select-symbol
// app.post('/select-symbol', (req, res) => {
//   const { sessionId, position, symbolId } = req.body;

//   if (!sessionId || !position || !symbolId) {
//     return res.status(400).json({ error: 'sessionId, position, symbolId required' });
//   }

//   const session = getSession(sessionId);
//   if (!session) return res.status(404).json({ error: 'Session not found' });

//   const db = getDb();
//   const pos = parseInt(position);
//   const symId = parseInt(symbolId);

//   // Remove any previous selection at this position
//   session.selectedSymbols = session.selectedSymbols.filter(s => s.position !== pos);
//   session.selectedSymbols.push({ position: pos, symbolId: symId });

//   // Build filter: coins must have ALL selected symbols (set intersection)
//   const selectedSymbolLabels = session.selectedSymbols.map(s => {
//     const sym = db.prepare(`SELECT label FROM symbols WHERE id = ?`).get(s.symbolId);
//     return sym ? sym.label : null;
//   }).filter(Boolean);

//   // Get coins that contain ALL selected symbols
//   let possibleCoinLabels = [];
//   if (selectedSymbolLabels.length > 0) {
//     const placeholders = selectedSymbolLabels.map(() => '?').join(',');
//     const result = db.prepare(`
//       SELECT coin_label, COUNT(*) as cnt
//       FROM coin_symbols
//       WHERE symbol_label IN (${placeholders})
//       GROUP BY coin_label
//       HAVING cnt = ?
//     `).all(...selectedSymbolLabels, selectedSymbolLabels.length);

//     possibleCoinLabels = result.map(r => r.coin_label);
//   }

//   session.possibleCoinIds = possibleCoinLabels;

//   const possibleCoins = possibleCoinLabels.length > 0 ? db.prepare(`
//     SELECT label, name, series FROM coins
//     WHERE label IN (${possibleCoinLabels.map(() => '?').join(',')})
//   `).all(...possibleCoinLabels) : [];

//   res.json({
//     position: pos,
//     symbolId: symId,
//     remainingCount: possibleCoinLabels.length,
//     possibleCoins: possibleCoins.map(c => ({ id: c.label, name: c.name, series: c.series })),
//     identified: possibleCoinLabels.length === 1,
//   });
// });

// // GET /result
// app.get('/result', (req, res) => {
//   const { sessionId } = req.query;
//   if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

//   const session = getSession(sessionId);
//   if (!session) return res.status(404).json({ error: 'Session not found' });

//   const db = getDb();

//   // Case 1: Exact match(es)
//   if (session.possibleCoinIds && session.possibleCoinIds.length > 0) {
//     const placeholders = session.possibleCoinIds.map(() => '?').join(',');
//     const coins = db.prepare(`
//       SELECT label, name, series, size_category FROM coins
//       WHERE label IN (${placeholders})
//     `).all(...session.possibleCoinIds);

//     return res.json({
//       status: session.possibleCoinIds.length === 1 ? 'identified' : 'narrowed',
//       coins: coins.map(c => ({ id: c.label, name: c.name, series: c.series })),
//       selectedSymbols: session.selectedSymbols,
//       stepsCompleted: session.selectedSymbols.length,
//       weightValid: session.weightValid,
//       weightNote: session.weightValid ? null : 'Weight does not match standard imperial coin weights (±20% tolerance).',
//     });
//   }

//   // Case 2: No match - compute relaxed matching
//   if (!session.selectedSymbolIds || session.selectedSymbolIds.length === 0) {
//     return res.json({
//       status: 'no_match',
//       coins: [],
//       relaxedMatches: [],
//       selectedSymbols: session.selectedSymbols,
//       stepsCompleted: session.selectedSymbols.length,
//       weightValid: session.weightValid,
//       weightNote: session.weightValid ? null : 'Weight does not match standard imperial coin weights (±20% tolerance).',
//     });
//   }

//   // Get all coins and their match scores
//   const allCoins = db.prepare(`
//     SELECT DISTINCT c.label, c.name, c.series
//     FROM coins c
//   `).all();

//   // Compute match percentages
//   const placeholders = session.selectedSymbolIds.map(() => '?').join(',');
//   const matchCounts = db.prepare(`
//     SELECT c.label, COUNT(DISTINCT s.id) as matched_count
//     FROM coins c
//     LEFT JOIN coin_symbols cs ON cs.coin_label = c.label
//     LEFT JOIN symbols s ON s.label = cs.symbol_label AND s.id IN (${placeholders})
//     GROUP BY c.label
//   `).all(...session.selectedSymbolIds);

//   const matchMap = {};
//   matchCounts.forEach(m => {
//     matchMap[m.label] = m.matched_count;
//   });

//   const relaxedMatches = allCoins
//     .map(c => ({
//       id: c.label,
//       name: c.name,
//       series: c.series,
//       matchedCount: matchMap[c.label] || 0,
//       matchPercentage: Math.round((matchMap[c.label] || 0) / session.selectedSymbolIds.length * 100),
//     }))
//     .filter(c => c.matchedCount > 0)
//     .sort((a, b) => b.matchPercentage - a.matchPercentage);

//   res.json({
//     status: 'no_match',
//     coins: [],
//     relaxedMatches,
//     selectedSymbols: session.selectedSymbols,
//     stepsCompleted: session.selectedSymbols.length,
//     weightValid: session.weightValid,
//     weightNote: session.weightValid ? null : 'Weight does not match standard imperial coin weights (±20% tolerance).',
//   });
// });

// // POST /upload-image
// app.post('/upload-image', upload.single('coinImage'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   res.json({ filename: req.file.filename, url: `/assets/uploads/${req.file.filename}` });
// });

// // POST /reset
// app.post('/reset', (req, res) => {
//   const { sessionId } = req.body;
//   if (sessionId) sessions.delete(sessionId);
//   const session = createSession();
//   res.json({ sessionId: session.id });
// });

// // Health check
// app.get('/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// // Start
// app.listen(PORT, '127.0.0.1', () => {
//   console.log(`[IPMC Backend] Running on http://127.0.0.1:${PORT}`);
// });

// module.exports = app;


















//------sreya------

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

const isDev = process.env.NODE_ENV === 'development' || !process.env.RESOURCES_PATH;
const resourcesPath = process.env.RESOURCES_PATH || path.join(__dirname, '..');

function getAssetsPath() {
  return isDev
    ? path.join(__dirname, '..', 'assets')
    : path.join(resourcesPath, 'assets');
}

// ─── In-memory session store ──────────────────────────────
const sessions = new Map();

function createSession() {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const session = {
    id,
    sizeCategory: null,
    weightValid: true,
    possibleCoinLabels: null,   // null = all coins; array after first filter
    selectedSymbolLabels: [],   // ordered list of symbol labels picked so far
    stage: 'input',             // 'input' | 'symbol_picking' | 'result'
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve symbol images
app.use('/assets/symbols', (req, res, next) => {
  const symbolsDir = path.join(getAssetsPath(), 'symbols');
  express.static(symbolsDir)(req, res, next);
});

// Upload dir for coin images
const uploadDir = path.join(getAssetsPath(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ─── Helper Functions ─────────────────────────────────────

/**
 * Given a set of possible coin labels, return all distinct symbols
 * that appear on at least one of those coins.
 */
function getAvailableSymbols(db, possibleCoinLabels) {
  if (!possibleCoinLabels || possibleCoinLabels.length === 0) return [];
  const placeholders = possibleCoinLabels.map(() => '?').join(',');
  return db.prepare(`
    SELECT DISTINCT s.id, s.label, s.description, s.image_filename, s.category
    FROM symbols s
    INNER JOIN coin_symbols cs ON cs.symbol_label = s.label
    WHERE cs.coin_label IN (${placeholders})
    ORDER BY s.label ASC
  `).all(...possibleCoinLabels);
}

/**
 * Filter possible coins to only those that have ALL selected symbols.
 */
function filterCoinsBySymbols(db, symbolLabels) {
  if (!symbolLabels || symbolLabels.length === 0) return null; // null = all coins
  const placeholders = symbolLabels.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT coin_label, COUNT(DISTINCT symbol_label) as cnt
    FROM coin_symbols
    WHERE symbol_label IN (${placeholders})
    GROUP BY coin_label
    HAVING cnt = ?
  `).all(...symbolLabels, symbolLabels.length);
  return rows.map(r => r.coin_label);
}

/**
 * Get full coin details for a list of coin labels.
 */
function getCoinDetails(db, coinLabels) {
  if (!coinLabels || coinLabels.length === 0) return [];
  const placeholders = coinLabels.map(() => '?').join(',');
  return db.prepare(`
    SELECT label, name, series, size_category FROM coins
    WHERE label IN (${placeholders})
    ORDER BY name ASC
  `).all(...coinLabels);
}

// ─── Routes ───────────────────────────────────────────────

// POST /session — create a new identification session
app.post('/session', (req, res) => {
  const session = createSession();
  res.json({ sessionId: session.id });
});

// POST /filter/size — filter coins by size, begin symbol picking
app.post('/filter/size', (req, res) => {
  const { sessionId, weight, sizeCategory } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  let session = getSession(sessionId);
  if (!session) {
    session = createSession();
    sessions.set(sessionId, session);
  }

  const db = getDb();
  session.sizeCategory = sizeCategory;
  session.weightValid = true;
  session.selectedSymbolLabels = [];
  session.stage = 'symbol_picking';

  // Filter coins by size
  const coins = db.prepare(`SELECT label FROM coins WHERE size_category = ?`).all(sizeCategory);
  session.possibleCoinLabels = coins.map(c => c.label);

  res.json({
    sessionId: session.id,
    possibleCount: session.possibleCoinLabels.length,
    sizeCategory,
  });
});

// GET /symbols/available — get all symbols on the current possible coins,
// plus the already-selected symbols (always included so UI can show them).
app.get('/symbols/available', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const db = getDb();

  // Symbols available from possible coins (for next selection)
  const availableRaw = getAvailableSymbols(db, session.possibleCoinLabels);

  // Symbols already selected (to always show them in UI)
  let selectedSymbols = [];
  if (session.selectedSymbolLabels.length > 0) {
    const placeholders = session.selectedSymbolLabels.map(() => '?').join(',');
    selectedSymbols = db.prepare(`
      SELECT id, label, description, image_filename, category
      FROM symbols WHERE label IN (${placeholders})
    `).all(...session.selectedSymbolLabels);
  }

  const selectedLabelSet = new Set(session.selectedSymbolLabels);

  // Format helper
  const fmt = (s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    category: s.category,
    imageUrl: `/assets/symbols/${s.image_filename}`,
  });

  res.json({
    // Symbols still available to pick (exclude already-selected ones)
    availableSymbols: availableRaw
      .filter(s => !selectedLabelSet.has(s.label))
      .map(fmt),
    // Already-selected symbols (in order picked)
    selectedSymbols: session.selectedSymbolLabels
      .map(lbl => selectedSymbols.find(s => s.label === lbl))
      .filter(Boolean)
      .map(fmt),
    step: session.selectedSymbolLabels.length + 1,
    possibleCount: session.possibleCoinLabels ? session.possibleCoinLabels.length : 0,
    possibleCoins: getCoinDetails(db, session.possibleCoinLabels).map(c => ({
      id: c.label, name: c.name, series: c.series,
    })),
  });
});

// POST /select-symbol-step — user picks one symbol; filter coins and return new state
app.post('/select-symbol-step', (req, res) => {
  const { sessionId, symbolId } = req.body;
  if (!sessionId || !symbolId) {
    return res.status(400).json({ error: 'sessionId and symbolId required' });
  }

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const db = getDb();

  // Look up symbol label
  const symbolRecord = db.prepare(`SELECT label FROM symbols WHERE id = ?`).get(parseInt(symbolId));
  if (!symbolRecord) return res.status(400).json({ error: 'Symbol not found' });

  // Prevent duplicate selection
  if (session.selectedSymbolLabels.includes(symbolRecord.label)) {
    return res.status(400).json({ error: 'Symbol already selected' });
  }

  // Add to selected list
  session.selectedSymbolLabels.push(symbolRecord.label);

  // Filter possible coins: must have ALL selected symbols
  const filtered = filterCoinsBySymbols(db, session.selectedSymbolLabels);
  session.possibleCoinLabels = filtered;

  const coinDetails = getCoinDetails(db, filtered);

  // Determine status
  let status = 'continue';
  if (!filtered || filtered.length === 0) {
    status = 'no_match';
    session.stage = 'result';
  } else if (filtered.length === 1) {
    status = 'identified';
    session.stage = 'result';
  }

  // Get next available symbols (for next step) — exclude already-selected
  const selectedLabelSet = new Set(session.selectedSymbolLabels);
  const nextAvailable = status === 'continue'
    ? getAvailableSymbols(db, filtered)
        .filter(s => !selectedLabelSet.has(s.label))
        .map(s => ({
          id: s.id, label: s.label, description: s.description,
          category: s.category, imageUrl: `/assets/symbols/${s.image_filename}`,
        }))
    : [];

  // Get selected symbols details in order
  let selectedSymbolDetails = [];
  if (session.selectedSymbolLabels.length > 0) {
    const placeholders = session.selectedSymbolLabels.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT id, label, description, image_filename, category
      FROM symbols WHERE label IN (${placeholders})
    `).all(...session.selectedSymbolLabels);
    selectedSymbolDetails = session.selectedSymbolLabels
      .map(lbl => rows.find(r => r.label === lbl))
      .filter(Boolean)
      .map(s => ({
        id: s.id, label: s.label, description: s.description,
        category: s.category, imageUrl: `/assets/symbols/${s.image_filename}`,
      }));
  }

  res.json({
    status,                        // 'continue' | 'identified' | 'no_match'
    step: session.selectedSymbolLabels.length,
    symbolLabel: symbolRecord.label,
    possibleCount: filtered ? filtered.length : 0,
    possibleCoins: coinDetails.map(c => ({ id: c.label, name: c.name, series: c.series })),
    availableSymbols: nextAvailable,
    selectedSymbols: selectedSymbolDetails,
  });
});

// GET /result — return final result from session state
app.get('/result', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const db = getDb();
  const coinLabels = session.possibleCoinLabels;

  // Has matches
  if (coinLabels && coinLabels.length > 0) {
    const coins = getCoinDetails(db, coinLabels);
    return res.json({
      status: coinLabels.length === 1 ? 'identified' : 'narrowed',
      coins: coins.map(c => ({ id: c.label, name: c.name, series: c.series })),
      stepsCompleted: session.selectedSymbolLabels.length,
      weightValid: session.weightValid,
    });
  }

  // No match — compute partial/relaxed matches ranked by how many selected symbols they have
  if (session.selectedSymbolLabels.length === 0) {
    return res.json({
      status: 'no_match',
      coins: [],
      relaxedMatches: [],
      stepsCompleted: 0,
      weightValid: session.weightValid,
    });
  }

  const placeholders = session.selectedSymbolLabels.map(() => '?').join(',');
  const matchCounts = db.prepare(`
    SELECT coin_label, COUNT(DISTINCT symbol_label) as cnt
    FROM coin_symbols
    WHERE symbol_label IN (${placeholders})
    GROUP BY coin_label
  `).all(...session.selectedSymbolLabels);

  const allCoins = db.prepare(`SELECT label, name, series FROM coins`).all();
  const matchMap = {};
  matchCounts.forEach(m => { matchMap[m.coin_label] = m.cnt; });

  const relaxedMatches = allCoins
    .map(c => ({
      id: c.label,
      name: c.name,
      series: c.series,
      matchedCount: matchMap[c.label] || 0,
      matchPercentage: Math.round(
        ((matchMap[c.label] || 0) / session.selectedSymbolLabels.length) * 100
      ),
    }))
    .filter(c => c.matchedCount > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 10);

  res.json({
    status: 'no_match',
    coins: [],
    relaxedMatches,
    stepsCompleted: session.selectedSymbolLabels.length,
    weightValid: session.weightValid,
  });
});

// GET /categories — all unique symbol categories
app.get('/categories', (req, res) => {
  const db = getDb();
  const categories = db.prepare(`
    SELECT DISTINCT category FROM symbols
    WHERE category IS NOT NULL ORDER BY category ASC
  `).all();
  res.json({ categories: categories.map(c => c.category) });
});

// POST /upload-image
app.post('/upload-image', upload.single('coinImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, url: `/assets/uploads/${req.file.filename}` });
});

// POST /reset
app.post('/reset', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) sessions.delete(sessionId);
  const session = createSession();
  res.json({ sessionId: session.id });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Start
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[IPMC Backend] Running on http://127.0.0.1:${PORT}`);
});

module.exports = app;