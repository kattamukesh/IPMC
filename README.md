# IPMC – Imperial Coin Identifier

A fully offline desktop application for identifying imperial coins through weight, size, and symbol-based filtering.

**Tech Stack:** Electron · React · Tailwind CSS · Node.js/Express · SQLite (better-sqlite3)

---

## Folder Structure

```
ipmc/
├── electron/
│   ├── main.js                  # Electron entry point (BrowserWindow + backend spawn)
│   ├── preload.js               # Context bridge for window controls
│   └── windowHandlers.js        # ipcMain window handlers
│
├── backend/
│   ├── server.js                # Express API server (port 3001)
│   └── db/
│       └── database.js          # SQLite init, schema, seed data
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              # Root app, step orchestration
│   │   ├── index.js             # React entry
│   │   ├── index.css            # Tailwind + global styles
│   │   ├── api.js               # API utility (fetch wrappers)
│   │   ├── components/
│   │   │   ├── TitleBar.jsx     # Frameless window titlebar
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── CoinList.jsx     # Sidebar coin candidates
│   │   │   └── SymbolCard.jsx   # Clickable symbol tile
│   │   └── pages/
│   │       ├── InputScreen.jsx  # Step 0: weight/size/image
│   │       ├── SymbolScreen.jsx # Steps 1-5: symbol selection
│   │       └── ResultScreen.jsx # Final identification output
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── scripts/
│   ├── import-csv.js            # CSV → coin_symbols importer
│   ├── generate-placeholder-symbols.js  # Create SVG symbol assets
│   └── sample_coin_symbols.csv  # Example CSV format
│
├── assets/
│   └── symbols/                 # Symbol images (SVG/PNG)
│       ├── eagle.png
│       ├── crown.png
│       └── ... (12 total)
│
├── schema.sql                   # SQL schema reference
├── package.json                 # Root Electron package
└── README.md
```

---

## API Reference

| Method | Endpoint           | Description                              |
|--------|--------------------|------------------------------------------|
| POST   | `/session`         | Create new identification session        |
| POST   | `/filter/size`     | Apply weight + size filter               |
| GET    | `/symbols/:pos`    | Get available symbols for position 1–5   |
| POST   | `/select-symbol`   | Select a symbol; filter possible coins   |
| GET    | `/result`          | Get final identification result          |
| POST   | `/reset`           | Reset/end session                        |
| POST   | `/upload-image`    | Upload coin reference image              |

### POST `/filter/size`
```json
{ "sessionId": "abc123", "weight": 28.27, "sizeCategory": "large" }
```

### GET `/symbols/1?sessionId=abc123`
Returns symbols valid at position 1 given remaining possible coins.

### POST `/select-symbol`
```json
{ "sessionId": "abc123", "position": 1, "symbolId": 3 }
```

### GET `/result?sessionId=abc123`
```json
{
  "status": "identified",
  "coins": [{ "id": 15, "name": "Crown", "series": "British Imperial", "weight": 28.27 }],
  "weightValid": true,
  "stepsCompleted": 3
}
```

---

## Database Schema

```sql
-- Coins table
CREATE TABLE coins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  series         TEXT NOT NULL,
  size_category  TEXT NOT NULL CHECK(size_category IN ('small','medium','large')),
  weight_min     REAL,   -- nominal × 0.80
  weight_max     REAL,   -- nominal × 1.20
  weight_nominal REAL
);

-- Symbols (motifs) table
CREATE TABLE symbols (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  label          TEXT NOT NULL,
  description    TEXT,
  image_filename TEXT
);

-- Coin ↔ Symbol mapping
CREATE TABLE coin_symbols (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  coin_id   INTEGER NOT NULL REFERENCES coins(id) ON DELETE CASCADE,
  symbol_id INTEGER NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL CHECK(position BETWEEN 1 AND 5)
);
```

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Install dependencies

```bash
# Root (Electron + backend)
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 2. Generate symbol placeholders (first time only)

```bash
node scripts/generate-placeholder-symbols.js
```

### 3. Run in development

```bash
npm start
```

This runs:
- Backend Express on `http://localhost:3001`
- Frontend React on `http://localhost:3000`
- Electron window (loads after 2s)

---

## CSV Import

To populate coin-symbol data from a CSV file:

```bash
node scripts/import-csv.js --file scripts/sample_coin_symbols.csv
```

### CSV Format A – one row per mapping:
```csv
symbol_id,coin_id,position
1,15,1
2,16,1
```

### CSV Format B – multiple coins per symbol:
```csv
symbol_id,coin_ids,position
1,"15,16,17",1
```

Use `--clear` to wipe existing data before import:
```bash
node scripts/import-csv.js --file data/coins.csv --clear
```

---

## Adding Custom Symbols

1. Place your image in `assets/symbols/yourname.png`
2. Insert into DB:
   ```sql
   INSERT INTO symbols (label, description, image_filename)
   VALUES ('Your Symbol', 'Description', 'yourname.png');
   ```
3. Link to coins via `coin_symbols` table or CSV import

---

## Adding Custom Coins

Insert into the database (run the app once to initialize it first):

```sql
INSERT INTO coins (name, series, size_category, weight_min, weight_max, weight_nominal)
VALUES ('My Coin', 'My Series', 'medium', 4.5, 6.7, 5.6);

INSERT INTO coin_symbols (coin_id, symbol_id, position)
VALUES (last_insert_rowid(), 1, 1);
```

Or edit `backend/db/database.js` → `seedData()` function.

---

## Build for Windows (.exe)

### Prerequisites
- Windows machine or Wine on Linux/Mac
- Node.js 18+

### Steps

```bash
# 1. Install all deps
npm install
cd frontend && npm install && cd ..

# 2. Build React frontend
cd frontend && npm run build && cd ..

# 3. Build Electron executable
npm run build
```

Output: `dist/IPMC - Imperial Coin Identifier Setup 1.0.0.exe`

### For cross-platform build from Linux/Mac:

```bash
# Install wine
sudo apt install wine  # Ubuntu/Debian

# Build
npm run build -- --win
```

---

## Production Path Resolution

The app uses `process.resourcesPath` in production to locate:

| Asset          | Dev Path                    | Production Path                        |
|----------------|-----------------------------|-----------------------------------------|
| SQLite DB      | `backend/db/ipmc.db`        | `{resources}/db/ipmc.db`               |
| Symbol images  | `assets/symbols/*.png`      | `{resources}/assets/symbols/*.png`     |
| Uploads        | `assets/uploads/`           | `{resources}/assets/uploads/`          |

This is handled automatically in `backend/db/database.js` and `backend/server.js` via `process.env.RESOURCES_PATH`.

---

## Symbol Position Guide

| Position | Location     | Examples                          |
|----------|-------------|-----------------------------------|
| 1        | Obverse     | Main emblem (Eagle, Crown, etc.)  |
| 2        | Portrait    | Ruler bust or facing portrait     |
| 3        | Reverse     | Coat of arms, reverse motif       |
| 4        | Legend      | Text border symbol or decoration  |
| 5        | Edge        | Edge lettering or milling pattern |

---

## Weight Tolerance Logic

- Input weight is compared against each coin's `weight_min` and `weight_max`
- These are pre-calculated as `nominal × 0.80` and `nominal × 1.20` (±20%)
- If the entered weight does not fall within any matching coin's range, a **warning** is displayed in results
- The coin is **not excluded** based on weight alone — it remains a candidate but the warning is flagged

---

## License

IPMC – Imperial Coin Identifier  
Internal / proprietary use. All rights reserved.
