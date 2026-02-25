# Orderly DEX SDK - Development Guide

This document provides detailed technical information for developers working with or extending the Orderly DEX SDK implementation.

## Development Setup

### Prerequisites
- Node.js 16+ or browser with ES6+ support
- npm or yarn package manager
- MetaMask or other Web3 wallet (for testing)

### Installation for Development

```bash
# Clone and navigate to project
git clone <repo-url>
cd orderly-ai-samples/orderly-dex-sdk

# Install dependencies
npm install

# For development with watch mode
npm run dev

# For production build
npm run build
```

## Project Structure Deep Dive

### index.html
The main entry point that defines:
- **Header**: Wallet connection, network/chain selection
- **Left Panel**: Market data, symbol search, chart area
- **Center Panel**: Order book and recent trades (tabbed interface)
- **Right Panel**: Trading form and account info

### app.js - Core Logic

#### Configuration Section
```javascript
CONFIG = {
  networks: {
    evm: { mainnet: '...', testnet: '...' },
    solana: { mainnet: '...', testnet: '...' }
  },
  defaultSymbols: ['BTC_USDC', 'ETH_USDC', 'SOL_USDC']
}
```

#### State Management
```javascript
state = {
  network: 'testnet',
  chain: 'evm',
  connected: false,
  wallet: null,
  selectedSymbol: 'BTC_USDC',
  currentSide: 'buy',
  orderType: 'limit',
  // ...
}
```

#### Key Functions

1. **`init()`** - Application initialization
   - Sets up event listeners
   - Loads initial market data
   - Loads available symbols

2. **`connectWallet()`** - Wallet connection logic
   - EVM: Uses ethers.js with MetaMask
   - Solana: Placeholder for wallet adapter

3. **`loadMarketData()`** - Fetches and updates market prices
   - API: `GET /v1/public/futures`
   - Updates UI with price, change, high, low

4. **`loadOrderBook()`** - Fetches and renders order book
   - API: `GET /v1/public/orderbook?symbol={symbol}`
   - Calculates and displays bid-ask spread

5. **`placeOrder()`** - Executes order placement
   - Validates order parameters
   - Currently shows success message
   - Ready for API integration

### styles.css - Theming

#### Color Variables
- **Primary**: `#6366f1` (Indigo) - Main accent
- **Secondary**: `#8b5cf6` (Purple) - Gradients
- **Success**: `#10b981` (Green) - Buy orders/gains
- **Danger**: `#ef4444` (Red) - Sell orders/losses
- **Backgrounds**: Slate palette (dark theme)

#### Layout System
- CSS Grid for main layout (300px | 1fr | 350px)
- Flexbox for component layouts
- Responsive design with media queries

## API Integration Guide

### Public Endpoints (No Auth Required)

#### Get Market Futures Data
```javascript
GET /v1/public/futures

Response:
{
  "success": true,
  "data": {
    "rows": [
      {
        "symbol": "BTC_USDC",
        "24h_open": 42000,
        "24h_close": 43000,
        "24h_high": 43500,
        "24h_low": 41500,
        "24h_amount": 1000000,
        "24h_volume": 25
      }
    ]
  }
}
```

#### Get Order Book
```javascript
GET /v1/public/orderbook?symbol=BTC_USDC

Response:
{
  "success": true,
  "data": {
    "bids": [[42900, 0.5], [42850, 1.0], ...],
    "asks": [[42950, 0.5], [43000, 1.0], ...]
  }
}
```

#### Get Recent Trades
```javascript
GET /v1/public/trades?symbol=BTC_USDC&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "price": 42950,
      "size": 0.5,
      "side": "BUY",
      "timestamp": "2024-02-20T10:30:00Z"
    }
  ]
}
```

### Authenticated Endpoints (Requires Signature)

#### Get Account Info
```javascript
GET /v1/account
Headers: {
  "Authorization": "Bearer <ed25519_signature>"
}

Response:
{
  "account_id": "0x...",
  "account_name": "Main",
  "balance": 10000,
  "margin_ratio": 0.5,
  "free_margin": 5000,
  "unrealized_pnl": 250
}
```

#### Place Order
```javascript
POST /v1/order
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer <ed25519_signature>"
}
Body:
{
  "symbol": "BTC_USDC",
  "side": "BUY",
  "orderType": "LIMIT",
  "quantity": 0.5,
  "price": 42900
}

Response:
{
  "success": true,
  "orderId": "12345",
  "timestamp": "2024-02-20T10:30:00Z"
}
```

## Wallet Integration Details

### EVM (MetaMask)

#### Connection Flow
```javascript
// 1. Request accounts
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// 2. Create provider
const provider = new ethers.BrowserProvider(window.ethereum);

// 3. Get signer for transactions
const signer = await provider.getSigner();

// 4. Sign messages for authentication
const message = "Sign to authenticate";
const signature = await signer.signMessage(message);
```

#### Network Switching
```javascript
// Switch to testnet
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x5' }] // Goerli testnet
});
```

### Solana Integration (Ready to Implement)

```javascript
// Use Solana Wallet Adapter
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallet = new PhantomWalletAdapter();
await wallet.connect();
```

## Advanced Features Implementation

### Real-Time WebSocket Updates

Replace polling with WebSocket for live updates:

```javascript
const ws = new WebSocket('wss://stream-evm.orderly.org');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'orderbook') {
    updateOrderBook(data);
  } else if (data.type === 'trade') {
    updateTrades(data);
  } else if (data.type === 'price') {
    updatePrice(data);
  }
};
```

### Order Management

Extend order placement with order updates and cancellation:

```javascript
async function cancelOrder(orderId) {
  const response = await fetch(`/v1/order/${orderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await response.json();
}

async function updateOrder(orderId, newPrice, newSize) {
  const response = await fetch(`/v1/order/${orderId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ price: newPrice, quantity: newSize })
  });
  return await response.json();
}
```

### Advanced Charting

Integrate TradingView Lightweight Charts:

```javascript
import { createChart } from 'lightweight-charts';

const chart = createChart(document.getElementById('chart'), {
  width: 800,
  height: 400,
  timeScale: { timeVisible: true, secondsVisible: false }
});

const candleSeries = chart.addCandlestickSeries();
candleSeries.setData(candleData);

chart.timeScale().fitContent();
```

### Local Storage for Preferences

```javascript
// Save user settings
function savePreferences() {
  localStorage.setItem('orderly-dex-prefs', JSON.stringify({
    theme: 'dark',
    network: state.network,
    chain: state.chain,
    watchlist: state.watchlist
  }));
}

// Load on startup
function loadPreferences() {
  const saved = localStorage.getItem('orderly-dex-prefs');
  if (saved) {
    Object.assign(state, JSON.parse(saved));
  }
}
```

## Performance Optimization

### Reduce API Calls
```javascript
// Cache market data
const marketCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

async function getMarketData(symbol) {
  const cached = marketCache.get(symbol);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchMarketData(symbol);
  marketCache.set(symbol, { data, time: Date.now() });
  return data;
}
```

### Lazy Loading
```javascript
// Load chart only when needed
let chartLoaded = false;

function switchTab(tabName) {
  if (tabName === 'chart' && !chartLoaded) {
    initChart();
    chartLoaded = true;
  }
}
```

### Debounce Search
```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce(filterSymbols, 300);
elements.symbolSearch.addEventListener('input', debouncedSearch);
```

## Testing Strategy

### Unit Tests (Example with Jest)

```javascript
// app.test.js
describe('Order Calculation', () => {
  test('calculates total correctly', () => {
    const price = 42900;
    const size = 0.5;
    const total = price * size;
    expect(total).toBe(21450);
  });

  test('validates order parameters', () => {
    expect(validateOrder({ side: 'BUY', quantity: 0 })).toBe(false);
    expect(validateOrder({ side: 'BUY', quantity: 1 })).toBe(true);
  });
});
```

### Integration Tests

```javascript
// Load real market data
describe('API Integration', () => {
  test('fetches market data successfully', async () => {
    const data = await loadMarketData();
    expect(data).toBeDefined();
    expect(data.symbol).toBe('BTC_USDC');
  });
});
```

## Debugging Tips

### Console Logging
```javascript
// Add debug logs to track state changes
function setState(newState) {
  console.log('State Update:', state, '->', newState);
  state = { ...state, ...newState };
}
```

### Browser DevTools
- Open Chrome DevTools: F12
- Network tab: Monitor API calls
- Console: Check for errors and logs
- Application tab: View localStorage

### Error Tracking
```javascript
window.addEventListener('error', (event) => {
  console.error('Uncaught Error:', event.error);
  showNotification(event.error.message, 'error');
});
```

## Building for Different Environments

### Environment Variables
```bash
# .env.example
VITE_API_URL_EVM_MAINNET=https://api-evm.orderly.org
VITE_API_URL_EVM_TESTNET=https://testnet-api-evm.orderly.org
```

### Build Variants
```bash
# Development build with source maps
npm run build -- --sourcemap

# Production build with minification
npm run build

# Preview production build locally
npm run preview
```

## Security Best Practices

1. **Never store private keys**
   - Always use wallet extensions
   - Never accept user input for private keys

2. **Validate inputs**
   - Check order parameters
   - Validate addresses
   - Sanitize user input

3. **Use HTTPS**
   - All production deployments
   - Secure WebSocket (WSS)

4. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' 'unsafe-inline'">
   ```

## Troubleshooting Common Issues

### CORS Errors
- Orderly API should have CORS enabled
- Use a proxy for development if needed
- Check network tab for actual error

### WebSocket Connection Fails
- Ensure WSS protocol is used
- Check firewall/proxy settings
- Verify endpoint is correct

### Wallet Connection Issues
- Check browser console for specific error
- Ensure wallet extension is installed
- Try disconnecting and reconnecting

## Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Resources

- [Orderly Network Docs](https://orderly.network)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Solana Web3.js Docs](https://docs.solana.com)
- [Vite Documentation](https://vitejs.dev)
- [MDN Web Docs](https://developer.mozilla.org)

---

Happy coding! 🚀
