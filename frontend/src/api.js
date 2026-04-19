// const BASE = 'http://localhost:3001';

// async function request(method, path, body) {
//   const opts = {
//     method,
//     headers: { 'Content-Type': 'application/json' },
//   };
//   if (body) opts.body = JSON.stringify(body);
//   const res = await fetch(`${BASE}${path}`, opts);
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({ error: res.statusText }));
//     throw new Error(err.error || `HTTP ${res.status}`);
//   }
//   return res.json();
// }

// export const api = {
//   createSession: () => request('POST', '/session'),

//   filterSize: (sessionId, weight, sizeCategory) =>
//     request('POST', '/filter/size', { sessionId, weight, sizeCategory }),

//   // NEW: Get all symbol categories
//   getCategories: () =>
//     fetch(`${BASE}/categories`).then(r => r.json()),

//   // NEW: Get all symbols grouped by position for initial selection
//   getInitialSymbols: () =>
//     fetch(`${BASE}/symbols/initial`).then(r => r.json()),

//   // NEW: Submit initial symbol selection (multi-select)
//   selectInitialSymbols: (sessionId, selectedSymbolIds) =>
//     request('POST', '/select-initial-symbols', { sessionId, selectedSymbolIds }),

//   // NEW: Get symbols for next refinement step
//   getNextStepSymbols: (sessionId, position) =>
//     fetch(`${BASE}/next-step-symbols?sessionId=${sessionId}&position=${position}`).then(r => r.json()),

//   // NEW: Submit symbol selection during refinement
//   selectStepSymbol: (sessionId, position, symbolId) =>
//     request('POST', '/select-step-symbol', { sessionId, position, symbolId }),

//   // Existing endpoints with enhanced category support
//   getSymbols: (position, sessionId, categories) => {
//     let url = `${BASE}/symbols/${position}?sessionId=${sessionId}`;
//     if (categories && categories.length > 0) {
//       url += `&categories=${categories.join(',')}`;
//     }
//     return fetch(url).then(r => r.json());
//   },

//   selectSymbol: (sessionId, position, symbolId) =>
//     request('POST', '/select-symbol', { sessionId, position, symbolId }),

//   getResult: (sessionId) =>
//     fetch(`${BASE}/result?sessionId=${sessionId}`).then(r => r.json()),

//   reset: (sessionId) =>
//     request('POST', '/reset', { sessionId }),

//   uploadImage: (sessionId, file) => {
//     const form = new FormData();
//     form.append('coinImage', file);
//     form.append('sessionId', sessionId);
//     return fetch(`${BASE}/upload-image`, { method: 'POST', body: form }).then(r => r.json());
//   },

//   symbolImageUrl: (filename) => `${BASE}/assets/symbols/${filename}`,
// };



//----------------Sreya-------------------
const BASE = 'http://localhost:3001';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  createSession: () => request('POST', '/session'),

  filterSize: (sessionId, weight, sizeCategory) =>
    request('POST', '/filter/size', { sessionId, weight, sizeCategory }),

  getCategories: () =>
    fetch(`${BASE}/categories`).then(r => r.json()),

  /**
   * Get available symbols for the current step.
   * Returns { availableSymbols, selectedSymbols, step, possibleCount, possibleCoins }
   */
  getAvailableSymbols: (sessionId) =>
    fetch(`${BASE}/symbols/available?sessionId=${sessionId}`).then(r => r.json()),

  /**
   * Select one symbol. Backend filters coins and returns new state.
   * Returns { status, step, possibleCount, possibleCoins, availableSymbols, selectedSymbols }
   */
  selectSymbolStep: (sessionId, symbolId) =>
    request('POST', '/select-symbol-step', { sessionId, symbolId }),

  getResult: (sessionId) =>
    fetch(`${BASE}/result?sessionId=${sessionId}`).then(r => r.json()),

  reset: (sessionId) =>
    request('POST', '/reset', { sessionId }),

  uploadImage: (sessionId, file) => {
    const form = new FormData();
    form.append('coinImage', file);
    form.append('sessionId', sessionId);
    return fetch(`${BASE}/upload-image`, { method: 'POST', body: form }).then(r => r.json());
  },

  symbolImageUrl: (filename) => `${BASE}/assets/symbols/${filename}`,

  /**
   * Get all coins with their symbols for gallery display
   */
  getCoinsGallery: () =>
    fetch(`${BASE}/coins/gallery`).then(r => r.json()),
};