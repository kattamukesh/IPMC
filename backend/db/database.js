const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !process.env.RESOURCES_PATH;
const resourcesPath = process.env.RESOURCES_PATH || path.join(__dirname, '..', '..');

function getDbPath() {
  if (isDev) {
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    return path.join(dbDir, 'ipmc.db');
  }
  const dbDir = path.join(resourcesPath, 'db');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  return path.join(dbDir, 'ipmc.db');
}

let db;

function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    seedData(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      series TEXT NOT NULL,
      size_category TEXT NOT NULL CHECK(size_category IN ('small','medium','large'))
    );

    CREATE TABLE IF NOT EXISTS symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL UNIQUE,
      category TEXT,
      description TEXT,
      image_filename TEXT
    );

    CREATE TABLE IF NOT EXISTS coin_symbols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coin_label TEXT NOT NULL,
      symbol_label TEXT NOT NULL,
      position INTEGER NOT NULL CHECK(position BETWEEN 1 AND 5),

      FOREIGN KEY (coin_label) REFERENCES coins(label) ON DELETE CASCADE,
      FOREIGN KEY (symbol_label) REFERENCES symbols(label) ON DELETE CASCADE
    );
  `);
}

function seedData(db) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM coins').get();
  if (count.cnt > 0) return;

  console.log('[DB] Seeding Series 1 data...');

  // ---------------------------
  // SYMBOLS (numeric labels with categories)
  // ---------------------------
  const insertSymbol = db.prepare(
    'INSERT INTO symbols (label, category, description, image_filename) VALUES (?, ?, ?, ?)'
  );

  const symbolData = [
    ['36', 'Heraldic', `Symbol 36`, '36.png'],
    ['40', 'Heraldic', `Symbol 40`, '40.png'],
    ['59', 'Numismatic', `Symbol 59`, '59.png'],
    ['147', 'Portrait', `Symbol 147`, '147.png'],
    ['148', 'Portrait', `Symbol 148`, '148.png'],
    ['149', 'Portrait', `Symbol 149`, '149.png'],
    ['283', 'Heraldic', `Symbol 283`, '283.png'],
    ['377', 'Portrait', `Symbol 377`, '377.png'],
    ['468', 'Emblem', `Symbol 468`, '468.png'],
    ['484', 'Numismatic', `Symbol 484`, '484.png'],
    ['485', 'Numismatic', `Symbol 485`, '485.png'],
  ];

  const symbolIds = {};
  symbolData.forEach(([label, category, description, filename]) => {
    const res = insertSymbol.run(label, category, description, filename);
    symbolIds[label] = res.lastInsertRowid;
  });

  // ---------------------------
  // COINS (Series 1)
  // ---------------------------
  const insertCoin = db.prepare(`
    INSERT INTO coins (label, name, series, size_category)
    VALUES (?, ?, ?, ?)
  `);

  const coins = [
    'coin1','coin2','coin3','coin4','coin5','coin6','coin7','coin7a','coin7b','coin7c'
  ];

  const coinIds = {};
  coins.forEach(c => {
    const res = insertCoin.run(c, c, 'Series 1', 'large');
    coinIds[c] = res.lastInsertRowid;
  });

  // ---------------------------
  // COIN-SYMBOL MAPPING
  // ---------------------------
  const insertCoinSymbol = db.prepare(
    'INSERT INTO coin_symbols (coin_label, symbol_label, position) VALUES (?, ?, ?)'
  );

  const mappings = {
    coin1: ['468','377','36', null, null],
    coin2: [null,'377','36', null, null],
    coin3: ['468','377','36','283', null],
    coin4: ['468','377','36','283','59'],
    coin5: ['468','377','36','148', null],
    coin6: ['468','377','36','149', null],
    coin7: ['468','377','36','149','40'],
    coin7a:['468','377','36','149','484'],
    coin7b:['468','377','36','147', null],
    coin7c:['468','377','36','485', null],
  };

  Object.entries(mappings).forEach(([coin, symbols]) => {

    symbols.forEach((symLabel, index) => {
      if (!symLabel) return;
      insertCoinSymbol.run(coin, symLabel, index + 1);
    });
  });

  console.log('[DB] Series 1 seed complete.');
}
// function seedData(db) {
//   const count = db.prepare('SELECT COUNT(*) as cnt FROM coins').get();
//   if (count.cnt > 0) return; // Already seeded

//   console.log('[DB] Seeding initial data...');

//   // Insert symbols (motifs found on imperial coins)
//   const insertSymbol = db.prepare('INSERT INTO symbols (label, description, image_filename) VALUES (?, ?, ?)');
//   const symbolData = [
//     ['1', 'Sun', '1.png'],

//     ['Eagle', 'Imperial Eagle motif', 'eagle.png'],
//     ['Crown', 'Royal Crown symbol', 'crown.png'],
//     ['Shield', 'Heraldic Shield', 'shield.png'],
//     ['Cross', 'Cross motif', 'cross.png'],
//     ['Star', 'Star or Sun motif', 'star.png'],
//     ['Wreath', 'Laurel Wreath', 'wreath.png'],
//     ['Lion', 'Lion rampant', 'lion.png'],
//     ['Bust', 'Royal Bust/Portrait', 'bust.png'],
//     ['Anchor', 'Naval Anchor', 'anchor.png'],
//     ['Sword', 'Crossed Swords', 'sword.png'],
//     ['Fleur', 'Fleur-de-lis', 'fleur.png'],
//     ['Globe', 'Orb / Globe', 'globe.png'],
//   ];

//   const symbolIds = {};
//   symbolData.forEach(([label, description, image_filename]) => {
//     const result = insertSymbol.run(label, description, image_filename);
//     symbolIds[label] = result.lastInsertRowid;
//   });

//   // Insert imperial coins with weight data
//   const insertCoin = db.prepare(`
//     INSERT INTO coins (name, series, size_category, weight_min, weight_max, weight_nominal)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `);

//   const coins = [
//     // Small coins
//     { name: 'Half Farthing', series: 'British Imperial', size: 'small', w: 2.0, tol: 0.20 },
//     { name: 'Farthing', series: 'British Imperial', size: 'small', w: 2.83, tol: 0.20 },
//     { name: 'Halfpenny', series: 'British Imperial', size: 'small', w: 5.67, tol: 0.20 },
//     { name: 'Kreuzer', series: 'Austrian Imperial', size: 'small', w: 3.0, tol: 0.20 },
//     { name: 'Pfennig', series: 'German Imperial', size: 'small', w: 2.5, tol: 0.20 },
//     { name: 'Centime', series: 'French Imperial', size: 'small', w: 2.0, tol: 0.20 },
//     // Medium coins
//     { name: 'Penny', series: 'British Imperial', size: 'medium', w: 9.45, tol: 0.20 },
//     { name: 'Threepence', series: 'British Imperial', size: 'medium', w: 1.41, tol: 0.20 },
//     { name: 'Sixpence', series: 'British Imperial', size: 'medium', w: 3.01, tol: 0.20 },
//     { name: 'Shilling', series: 'British Imperial', size: 'medium', w: 5.66, tol: 0.20 },
//     { name: 'Florin', series: 'British Imperial', size: 'medium', w: 11.31, tol: 0.20 },
//     { name: 'Thaler', series: 'Austrian Imperial', size: 'medium', w: 14.0, tol: 0.20 },
//     { name: 'Mark', series: 'German Imperial', size: 'medium', w: 5.55, tol: 0.20 },
//     { name: 'Franc', series: 'French Imperial', size: 'medium', w: 5.0, tol: 0.20 },
//     // Large coins
//     { name: 'Crown', series: 'British Imperial', size: 'large', w: 28.27, tol: 0.20 },
//     { name: 'Half Crown', series: 'British Imperial', size: 'large', w: 14.13, tol: 0.20 },
//     { name: 'Double Florin', series: 'British Imperial', size: 'large', w: 22.62, tol: 0.20 },
//     { name: 'Maria Theresa Thaler', series: 'Austrian Imperial', size: 'large', w: 28.06, tol: 0.20 },
//     { name: 'Vereinsthaler', series: 'German Imperial', size: 'large', w: 18.52, tol: 0.20 },
//     { name: 'Ecu', series: 'French Imperial', size: 'large', w: 29.49, tol: 0.20 },
//   ];

//   const coinIds = {};
//   coins.forEach(({ name, series, size, w, tol }) => {
//     const result = insertCoin.run(name, series, size, w * (1 - tol), w * (1 + tol), w);
//     coinIds[name] = result.lastInsertRowid;
//   });

//   // Insert coin_symbols (position 1-5 symbol associations)
//   const insertCoinSymbol = db.prepare('INSERT INTO coin_symbols (coin_id, symbol_id, position) VALUES (?, ?, ?)');

//   const assignments = [
//     // British Imperial - Small
//     ['Half Farthing',      [['Crown',1],['Bust',2],['Shield',3],['Wreath',4],['Cross',5]]],
//     ['Farthing',           [['Crown',1],['Bust',2],['Wreath',3],['Shield',4],['Star',5]]],
//     ['Halfpenny',          [['Crown',1],['Bust',2],['Anchor',3],['Wreath',4],['Shield',5]]],
//     // British Imperial - Medium
//     ['Penny',              [['Crown',1],['Bust',2],['Wreath',3],['Anchor',4],['Shield',5]]],
//     ['Threepence',         [['Crown',1],['Bust',2],['Wreath',3],['Shield',4],['Cross',5]]],
//     ['Sixpence',           [['Crown',1],['Bust',2],['Shield',3],['Star',4],['Wreath',5]]],
//     ['Shilling',           [['Crown',1],['Bust',2],['Shield',3],['Lion',4],['Star',5]]],
//     ['Florin',             [['Crown',1],['Bust',2],['Shield',3],['Cross',4],['Wreath',5]]],
//     // British Imperial - Large
//     ['Crown',              [['Crown',1],['Eagle',2],['Shield',3],['Lion',4],['Globe',5]]],
//     ['Half Crown',         [['Crown',1],['Bust',2],['Shield',3],['Lion',4],['Wreath',5]]],
//     ['Double Florin',      [['Crown',1],['Bust',2],['Cross',3],['Shield',4],['Star',5]]],
//     // Austrian Imperial - Small
//     ['Kreuzer',            [['Eagle',1],['Crown',2],['Shield',3],['Cross',4],['Globe',5]]],
//     // Austrian Imperial - Medium
//     ['Thaler',             [['Eagle',1],['Bust',2],['Crown',3],['Shield',4],['Globe',5]]],
//     // Austrian Imperial - Large
//     ['Maria Theresa Thaler',[['Eagle',1],['Bust',2],['Crown',3],['Globe',4],['Shield',5]]],
//     // German Imperial - Small
//     ['Pfennig',            [['Eagle',1],['Crown',2],['Shield',3],['Sword',4],['Star',5]]],
//     // German Imperial - Medium
//     ['Mark',               [['Eagle',1],['Crown',2],['Shield',3],['Sword',4],['Wreath',5]]],
//     // German Imperial - Large
//     ['Vereinsthaler',      [['Eagle',1],['Crown',2],['Shield',3],['Sword',4],['Globe',5]]],
//     // French Imperial - Small
//     ['Centime',            [['Eagle',1],['Bust',2],['Wreath',3],['Star',4],['Fleur',5]]],
//     // French Imperial - Medium
//     ['Franc',              [['Eagle',1],['Bust',2],['Wreath',3],['Star',4],['Cross',5]]],
//     // French Imperial - Large
//     ['Ecu',                [['Eagle',1],['Bust',2],['Shield',3],['Fleur',4],['Globe',5]]],
//   ];

//   assignments.forEach(([coinName, symbols]) => {
//     const coinId = coinIds[coinName];
//     if (!coinId) return;
//     symbols.forEach(([symbolLabel, position]) => {
//       const symId = symbolIds[symbolLabel];
//       if (symId) insertCoinSymbol.run(coinId, symId, position);
//     });
//   });

//   console.log('[DB] Seed complete.');
// }

module.exports = { getDb };
