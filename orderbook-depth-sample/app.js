// =============================================================
//  Orderly Order Book Depth – Live Dashboard
//  Uses the public REST API to load symbols and
//  the public WebSocket stream for real-time orderbook data.
//
//  REST  : https://api-evm.orderly.org/v1/public/futures
//  WS    : wss://ws-evm.orderly.org/ws/stream/{account_id}
//  Topic : {symbol}@orderbook  (depth 100, push every 1 s)
//  Data  : asks/bids are arrays of [price, quantity]
// =============================================================

const API_URL = 'https://api-evm.orderly.org/v1/public/futures';
const WS_BASE = 'wss://ws-evm.orderly.org/ws/stream';

// DOM refs
const accountIdInput = document.getElementById('accountIdInput');
const connectBtn = document.getElementById('connectBtn');
const symbolSelect = document.getElementById('symbolSelect');
const levelSelect = document.getElementById('levelSelect');
const statusDot = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const spreadLabel = document.getElementById('spreadLabel');
const midPriceEl = document.getElementById('midPrice');
const lastUpdateEl = document.getElementById('lastUpdate');
const asksBody = document.getElementById('asksBody');
const bidsBody = document.getElementById('bidsBody');
const depthCanvas = document.getElementById('depthCanvas');

// State
let ws = null;
let accountId = '';
let currentSymbol = 'PERP_BTC_USDC';
let previousSymbol = null;
let orderbook = { asks: [], bids: [] };
let prevPrices = {};          // track price→qty for flash detection
let reconnectTimer = null;
let pingTimer = null;

const DEFAULT_ACCOUNT_ID = '0x4f0199c5cdfaebd3762228367f67eef1add27ad8d7dade4c794047ad5bbcfbbd';

// ---- Bootstrap ----
(async function init() {
  await loadSymbols();

  // Restore account ID from localStorage, or use default
  const saved = localStorage.getItem('orderly_account_id');
  accountIdInput.value = saved || DEFAULT_ACCOUNT_ID;

  connectBtn.addEventListener('click', onConnect);
  accountIdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onConnect();
  });

  symbolSelect.addEventListener('change', () => {
    previousSymbol = currentSymbol;
    currentSymbol = symbolSelect.value;
    orderbook = { asks: [], bids: [] };
    prevPrices = {};
    resubscribe();
  });

  levelSelect.addEventListener('change', renderBook);

  // Auto-connect on load
  onConnect();
})();

function onConnect() {
  const id = accountIdInput.value.trim();
  if (!id) {
    accountIdInput.focus();
    return;
  }
  accountId = id;
  localStorage.setItem('orderly_account_id', id);
  connectWebSocket();
}

// ---- Load symbol list (public, no auth) ----
async function loadSymbols() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    if (!json.success) throw new Error('Bad response');

    const symbols = json.data.rows
      .map(r => r.symbol)
      .filter(s => s.startsWith('PERP_'))
      .sort();

    symbolSelect.innerHTML = symbols
      .map(s => {
        const label = s.replace('PERP_', '').replace('_USDC', '/USDC');
        const selected = s === currentSymbol ? ' selected' : '';
        return `<option value="${s}"${selected}>${label}</option>`;
      })
      .join('');

    if (!symbols.includes(currentSymbol) && symbols.length) {
      currentSymbol = symbols[0];
      symbolSelect.value = currentSymbol;
    }
  } catch (err) {
    console.error('Failed to load symbols:', err);
    symbolSelect.innerHTML = '<option value="PERP_BTC_USDC">BTC/USDC</option>';
  }
}

// ---- WebSocket ----
function connectWebSocket() {
  if (!accountId) {
    setStatus('idle');
    return;
  }

  if (ws) {
    ws.onclose = null;
    ws.close();
  }

  const wsUrl = `${WS_BASE}/${accountId}`;
  setStatus('connecting');
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    setStatus('connected');
    subscribe(currentSymbol);
    startPing();
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);

      // Pong response
      if (msg.event === 'pong') return;

      // Subscription ack
      if (msg.event === 'subscribe') return;

      // Orderbook push
      if (msg.topic && msg.topic.endsWith('@orderbook') && msg.data) {
        handleOrderbookData(msg.data);
      }
    } catch (e) {
      // ignore non-JSON frames
    }
  };

  ws.onerror = () => setStatus('error');
  ws.onclose = () => {
    setStatus('disconnected');
    stopPing();
    scheduleReconnect();
  };
}

function subscribe(symbol) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({
    id: 'ob-sub',
    event: 'subscribe',
    topic: `${symbol}@orderbook`,
  }));
}

function unsubscribe(symbol) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({
    id: 'ob-unsub',
    event: 'unsubscribe',
    topic: `${symbol}@orderbook`,
  }));
}

function resubscribe() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (previousSymbol) {
      unsubscribe(previousSymbol);
    }
    subscribe(currentSymbol);
  }
  renderBook();
}

function startPing() {
  stopPing();
  pingTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'ping' }));
    }
  }, 15000);
}

function stopPing() {
  if (pingTimer) clearInterval(pingTimer);
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectWebSocket, 3000);
}

// ---- Data handling ----
function handleOrderbookData(data) {
  // WS pushes asks/bids as arrays of [price, quantity]
  const newAsks = (data.asks || []).map(a => ({ price: a[0], qty: a[1] }));
  const newBids = (data.bids || []).map(b => ({ price: b[0], qty: b[1] }));

  // Build prev map for flash
  const prev = {};
  orderbook.asks.forEach(a => prev[a.price] = a.qty);
  orderbook.bids.forEach(b => prev[b.price] = b.qty);
  prevPrices = prev;

  orderbook.asks = newAsks;
  orderbook.bids = newBids;

  renderBook();
  drawDepthChart();
}

// ---- Render order book ----
function renderBook() {
  const levels = parseInt(levelSelect.value, 10);

  // Asks: lowest price first (best ask at bottom) → we show sorted ascending then reverse for display
  const asks = orderbook.asks
    .slice()
    .sort((a, b) => a.price - b.price)
    .slice(0, levels);

  // Bids: highest price first (best bid at top)
  const bids = orderbook.bids
    .slice()
    .sort((a, b) => b.price - a.price)
    .slice(0, levels);

  // Cumulative quantities
  let askCum = 0;
  const askRows = asks.map(a => { askCum += a.qty; return { ...a, total: askCum }; });
  let bidCum = 0;
  const bidRows = bids.map(b => { bidCum += b.qty; return { ...b, total: bidCum }; });

  const maxAskTotal = askCum || 1;
  const maxBidTotal = bidCum || 1;

  // Render asks (reversed so best ask is at bottom, closest to spread)
  const askDisplay = askRows.slice().reverse();
  asksBody.innerHTML = askDisplay.length
    ? askDisplay.map(r => {
        const pct = (r.total / maxAskTotal * 100).toFixed(1);
        const flash = getFlashClass(r.price, r.qty);
        return `<div class="book-row ask-row ${flash}">
          <span class="depth-bar" style="width:${pct}%"></span>
          <span class="price">${formatPrice(r.price)}</span>
          <span>${formatQty(r.qty)}</span>
          <span>${formatQty(r.total)}</span>
        </div>`;
      }).join('')
    : '<div class="loader">No asks</div>';

  bidsBody.innerHTML = bidRows.length
    ? bidRows.map(r => {
        const pct = (r.total / maxBidTotal * 100).toFixed(1);
        const flash = getFlashClass(r.price, r.qty);
        return `<div class="book-row bid-row ${flash}">
          <span class="depth-bar" style="width:${pct}%"></span>
          <span class="price">${formatPrice(r.price)}</span>
          <span>${formatQty(r.qty)}</span>
          <span>${formatQty(r.total)}</span>
        </div>`;
      }).join('')
    : '<div class="loader">No bids</div>';

  // Spread
  const bestAsk = asks.length ? asks[0].price : null;
  const bestBid = bids.length ? bids[0].price : null;

  if (bestAsk !== null && bestBid !== null) {
    const spread = bestAsk - bestBid;
    const spreadPct = ((spread / bestAsk) * 100).toFixed(3);
    spreadLabel.textContent = `Spread: ${formatPrice(spread)} (${spreadPct}%)`;
    midPriceEl.textContent = `Mid: ${formatPrice((bestAsk + bestBid) / 2)}`;
  } else {
    spreadLabel.textContent = 'Spread: —';
    midPriceEl.textContent = 'Mid: —';
  }

  lastUpdateEl.textContent = new Date().toLocaleTimeString();
}

function getFlashClass(price, qty) {
  if (prevPrices[price] === undefined) return '';
  if (qty > prevPrices[price]) return 'flash-green';
  if (qty < prevPrices[price]) return 'flash-red';
  return '';
}

// ---- Depth chart (canvas) ----
function drawDepthChart() {
  const ctx = depthCanvas.getContext('2d');
  const W = depthCanvas.width;
  const H = depthCanvas.height;
  const pad = { top: 10, bottom: 30, left: 60, right: 60 };

  ctx.clearRect(0, 0, W, H);

  const asks = orderbook.asks.slice().sort((a, b) => a.price - b.price);
  const bids = orderbook.bids.slice().sort((a, b) => a.price - b.price);

  if (!asks.length || !bids.length) return;

  // Cumulative
  let cum = 0;
  const bidCum = bids.slice().sort((a, b) => b.price - a.price).map(b => { cum += b.qty; return { price: b.price, total: cum }; });
  cum = 0;
  const askCum = asks.map(a => { cum += a.qty; return { price: a.price, total: cum }; });

  // Ranges
  const minPrice = bidCum[bidCum.length - 1].price;
  const maxPrice = askCum[askCum.length - 1].price;
  const maxTotal = Math.max(
    bidCum[bidCum.length - 1].total,
    askCum[askCum.length - 1].total,
  );

  const xScale = (p) => pad.left + ((p - minPrice) / (maxPrice - minPrice)) * (W - pad.left - pad.right);
  const yScale = (t) => pad.top + (1 - t / maxTotal) * (H - pad.top - pad.bottom);

  // Grid lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * (H - pad.top - pad.bottom);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
  }

  // Y-axis labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = maxTotal * (1 - i / 4);
    const y = pad.top + (i / 4) * (H - pad.top - pad.bottom);
    ctx.fillText(formatQty(val), pad.left - 6, y + 3);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  const priceStep = (maxPrice - minPrice) / 6;
  for (let i = 0; i <= 6; i++) {
    const p = minPrice + priceStep * i;
    const x = xScale(p);
    ctx.fillText(formatPrice(p), x, H - pad.bottom + 15);
  }

  // Mid-price line
  const bestBid = bidCum[0].price;
  const bestAsk = askCum[0].price;
  const mid = (bestBid + bestAsk) / 2;
  const midX = xScale(mid);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(midX, pad.top);
  ctx.lineTo(midX, H - pad.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw bids (green, right to left)
  ctx.beginPath();
  const bidReversed = bidCum.slice().reverse(); // low price → high price
  ctx.moveTo(xScale(bidReversed[0].price), yScale(bidReversed[0].total));
  for (let i = 1; i < bidReversed.length; i++) {
    // step-style
    ctx.lineTo(xScale(bidReversed[i].price), yScale(bidReversed[i - 1].total));
    ctx.lineTo(xScale(bidReversed[i].price), yScale(bidReversed[i].total));
  }
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill bids
  ctx.lineTo(xScale(bidReversed[bidReversed.length - 1].price), yScale(0));
  ctx.lineTo(xScale(bidReversed[0].price), yScale(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(74, 222, 128, 0.12)';
  ctx.fill();

  // Draw asks (red, left to right)
  ctx.beginPath();
  ctx.moveTo(xScale(askCum[0].price), yScale(askCum[0].total));
  for (let i = 1; i < askCum.length; i++) {
    ctx.lineTo(xScale(askCum[i].price), yScale(askCum[i - 1].total));
    ctx.lineTo(xScale(askCum[i].price), yScale(askCum[i].total));
  }
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill asks
  ctx.lineTo(xScale(askCum[askCum.length - 1].price), yScale(0));
  ctx.lineTo(xScale(askCum[0].price), yScale(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(248, 113, 113, 0.12)';
  ctx.fill();
}

// ---- Helpers ----
function formatPrice(n) {
  if (n == null) return '—';
  if (n >= 1000) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toPrecision(4);
}

function formatQty(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  if (n >= 1) return n.toFixed(3);
  return n.toPrecision(4);
}

function setStatus(state) {
  statusDot.className = 'status-dot';
  switch (state) {
    case 'connected':
      statusDot.classList.add('active');
      statusText.textContent = 'Live';
      break;
    case 'connecting':
      statusText.textContent = 'Connecting...';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected – reconnecting...';
      break;
    case 'error':
      statusDot.classList.add('error');
      statusText.textContent = 'Connection error';
      break;
    case 'idle':
      statusText.textContent = 'Enter account ID to connect';
      break;
  }
}
