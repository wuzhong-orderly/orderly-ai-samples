/**
 * Orderly Account Info Viewer
 * Displays user's assets and open positions using the Orderly REST API
 */

// API Endpoints
const ENDPOINTS = {
  testnet: 'https://testnet-api-evm.orderly.org',
  mainnet: 'https://api-evm.orderly.org'
};

/**
 * Convert Base58 string to Uint8Array
 */
function base58ToBytes(base58) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const ALPHABET_MAP = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET[i]] = i;
  }
  
  let bytes = [0];
  for (let i = 0; i < base58.length; i++) {
    const c = base58[i];
    if (!(c in ALPHABET_MAP)) {
      throw new Error(`Invalid Base58 character: ${c}`);
    }
    let carry = ALPHABET_MAP[c];
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  
  // Add leading zeros
  for (let i = 0; i < base58.length && base58[i] === '1'; i++) {
    bytes.push(0);
  }
  
  return new Uint8Array(bytes.reverse());
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
  hex = hex.replace(/^0x/, '');
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Parse secret key (supports Base58 or Hex format)
 */
function parseSecretKey(keyString) {
  keyString = keyString.trim();
  
  // Remove common prefixes
  if (keyString.startsWith('ed25519:')) {
    keyString = keyString.slice(8);
  }
  
  // Check if it's hex (starts with 0x or only hex characters)
  if (keyString.startsWith('0x') || /^[0-9a-fA-F]+$/.test(keyString)) {
    return hexToBytes(keyString);
  }
  
  // Otherwise, assume Base58
  return base58ToBytes(keyString);
}

/**
 * Convert Uint8Array to Base64URL
 */
function bytesToBase64Url(bytes) {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert Uint8Array to Base58 string
 */
function bytesToBase58(bytes) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  // Count leading zeros
  let zeros = 0;
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    zeros++;
  }
  
  // Convert to base58
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  
  // Build result string
  let result = '';
  for (let i = 0; i < zeros; i++) {
    result += ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += ALPHABET[digits[i]];
  }
  
  return result;
}

/**
 * Format number as USD currency
 */
function formatUSD(value, decimals = 2) {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format number with commas
 */
function formatNumber(value, decimals = 4) {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Load ed25519 library dynamically
let ed = null;

async function loadEd25519() {
  if (ed) return ed;
  ed = await import('https://esm.sh/@noble/ed25519@2.1.0');
  console.log('ed25519 library loaded:', ed);
  return ed;
}

/**
 * Get public key from secret key
 */
async function getPublicKeyFromSecret(secretKey) {
  const edLib = await loadEd25519();
  const publicKey = await edLib.getPublicKeyAsync(secretKey);
  return publicKey;
}

/**
 * Sign a request for Orderly API
 */
async function signRequest(secretKey, timestamp, method, path, body = null) {
  const edLib = await loadEd25519();
  const bodyString = body ? JSON.stringify(body) : '';
  const message = `${timestamp}${method.toUpperCase()}${path}${bodyString}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = await edLib.signAsync(messageBytes, secretKey);
  return bytesToBase64Url(signature);
}

/**
 * Make an authenticated request to Orderly API
 */
async function authenticatedRequest(baseUrl, path, accountId, secretKey, method = 'GET', body = null) {
  const timestamp = Date.now();
  const signature = await signRequest(secretKey, timestamp, method, path, body);
  const publicKey = await getPublicKeyFromSecret(secretKey);
  const orderlyKey = 'ed25519:' + bytesToBase58(publicKey);
  
  console.log('Derived public key:', orderlyKey);
  
  const headers = {
    'Content-Type': 'application/json',
    'orderly-account-id': accountId,
    'orderly-key': orderlyKey,
    'orderly-timestamp': timestamp.toString(),
    'orderly-signature': signature
  };
  
  const options = {
    method,
    headers
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  console.log(`Making request to ${baseUrl}${path}`);
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP ${response.status}: Request failed`);
  }
  
  return data.data;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // DOM Elements
  const accountIdInput = document.getElementById('accountId');
  const secretKeyInput = document.getElementById('secretKey');
  const networkSelect = document.getElementById('network');
  const fetchBtn = document.getElementById('fetchBtn');
  const statusBar = document.getElementById('statusBar');
  const statusDot = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const dataSection = document.getElementById('dataSection');
  const errorSection = document.getElementById('errorSection');
  const errorMessage = document.getElementById('errorMessage');
  const accountSummary = document.getElementById('accountSummary');
  const assetsTableBody = document.querySelector('#assetsTable tbody');
  const assetsLoader = document.getElementById('assetsLoader');
  const assetsEmpty = document.getElementById('assetsEmpty');
  const positionsTableBody = document.querySelector('#positionsTable tbody');
  const positionsLoader = document.getElementById('positionsLoader');
  const positionsEmpty = document.getElementById('positionsEmpty');

  console.log('Elements found:', { fetchBtn, accountIdInput, secretKeyInput });

  /**
   * Render account summary section
   */
  function renderAccountSummary(positionsData) {
    const items = [
      { 
        label: 'Total Collateral', 
        value: formatUSD(positionsData.total_collateral_value),
        class: ''
      },
      { 
        label: 'Free Collateral', 
        value: formatUSD(positionsData.free_collateral),
        class: ''
      },
      { 
        label: 'Margin Ratio', 
        value: positionsData.margin_ratio ? `${formatNumber(positionsData.margin_ratio, 2)}%` : '-',
        class: ''
      },
      { 
        label: 'Unrealized PnL', 
        value: formatUSD(positionsData.total_unreal_pnl),
        class: positionsData.total_unreal_pnl >= 0 ? 'positive' : 'negative'
      }
    ];
    
    accountSummary.innerHTML = items.map(item => `
      <div class="summary-item">
        <div class="label">${item.label}</div>
        <div class="value ${item.class}">${item.value}</div>
      </div>
    `).join('');
  }

  /**
   * Render assets table
   */
  function renderAssetsTable(holdings) {
    assetsLoader.classList.add('hidden');
    
    if (!holdings || holdings.length === 0) {
      assetsEmpty.classList.remove('hidden');
      assetsTableBody.innerHTML = '';
      return;
    }
    
    assetsEmpty.classList.add('hidden');
    
    // Sort by holding value (descending)
    holdings.sort((a, b) => b.holding - a.holding);
    
    assetsTableBody.innerHTML = holdings.map(asset => `
      <tr>
        <td><strong>${asset.token}</strong></td>
        <td class="text-right">${formatNumber(asset.holding, 6)}</td>
        <td class="text-right">${formatNumber(asset.frozen, 6)}</td>
        <td class="text-right">${formatNumber(asset.pending_short || 0, 6)}</td>
      </tr>
    `).join('');
  }

  /**
   * Render positions table
   */
  function renderPositionsTable(positions) {
    positionsLoader.classList.add('hidden');
    
    // Filter out zero positions
    const openPositions = positions.filter(p => p.position_qty !== 0);
    
    if (!openPositions || openPositions.length === 0) {
      positionsEmpty.classList.remove('hidden');
      positionsTableBody.innerHTML = '';
      return;
    }
    
    positionsEmpty.classList.add('hidden');
    
    positionsTableBody.innerHTML = openPositions.map(position => {
      const isLong = position.position_qty > 0;
      const positionClass = isLong ? 'position-long' : 'position-short';
      const pnlClass = position.unrealized_pnl >= 0 ? 'text-green' : 'text-red';
      const sizeDisplay = `${isLong ? '+' : ''}${formatNumber(position.position_qty, 4)}`;
      
      return `
        <tr>
          <td><strong>${position.symbol}</strong></td>
          <td class="text-right ${positionClass}">${sizeDisplay}</td>
          <td class="text-right">${formatUSD(position.average_open_price)}</td>
          <td class="text-right">${formatUSD(position.mark_price)}</td>
          <td class="text-right ${pnlClass}">${formatUSD(position.unrealized_pnl)}</td>
          <td class="text-right">${position.est_liq_price ? formatUSD(position.est_liq_price) : '-'}</td>
          <td class="text-right">${position.leverage || '-'}x</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Update status UI
   */
  function updateStatus(state, message) {
    statusBar.classList.remove('hidden');
    statusText.innerText = message;
    
    statusDot.classList.remove('active', 'error');
    if (state === 'success') {
      statusDot.classList.add('active');
    } else if (state === 'error') {
      statusDot.classList.add('error');
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    errorSection.classList.remove('hidden');
    errorMessage.innerText = message;
    dataSection.classList.add('hidden');
    updateStatus('error', 'Error');
  }

  /**
   * Hide error message
   */
  function hideError() {
    errorSection.classList.add('hidden');
  }

  /**
   * Fetch account data
   */
  async function fetchAccountData() {
    console.log('fetchAccountData called');
    
    const accountId = accountIdInput.value.trim();
    const secretKeyStr = secretKeyInput.value.trim();
    const network = networkSelect.value;
    
    console.log('Inputs:', { accountId, network, hasSecretKey: !!secretKeyStr });
    
    // Validation
    if (!accountId) {
      showError('Please enter your Account ID');
      return;
    }
    
    if (!secretKeyStr) {
      showError('Please enter your Secret Key');
      return;
    }
    
    // Parse secret key
    let secretKey;
    try {
      secretKey = parseSecretKey(secretKeyStr);
      // Ed25519 secret key should be 32 bytes (or 64 if it includes public key)
      if (secretKey.length === 64) {
        secretKey = secretKey.slice(0, 32);
      }
      if (secretKey.length !== 32) {
        throw new Error(`Invalid key length: ${secretKey.length} bytes (expected 32)`);
      }
      console.log('Secret key parsed successfully, length:', secretKey.length);
    } catch (err) {
      showError(`Invalid secret key format: ${err.message}`);
      return;
    }
    
    const baseUrl = ENDPOINTS[network];
    
    // Update UI
    hideError();
    fetchBtn.disabled = true;
    updateStatus('loading', 'Fetching account data...');
    dataSection.classList.add('hidden');
    assetsLoader.classList.remove('hidden');
    positionsLoader.classList.remove('hidden');
    assetsEmpty.classList.add('hidden');
    positionsEmpty.classList.add('hidden');
    
    try {
      // Preload ed25519 library
      await loadEd25519();
      
      // Fetch holdings and positions in parallel
      console.log('Fetching data from', baseUrl);
      const [holdingsData, positionsData] = await Promise.all([
        authenticatedRequest(baseUrl, '/v1/client/holding', accountId, secretKey),
        authenticatedRequest(baseUrl, '/v1/positions', accountId, secretKey)
      ]);
      
      console.log('Data received:', { holdingsData, positionsData });
      
      // Show data section
      dataSection.classList.remove('hidden');
      
      // Render account summary from positions data
      renderAccountSummary(positionsData);
      
      // Render holdings
      renderAssetsTable(holdingsData.holding || []);
      
      // Render positions
      renderPositionsTable(positionsData.rows || []);
      
      updateStatus('success', `Connected to ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`);
      
    } catch (err) {
      console.error('Fetch error:', err);
      showError(`Failed to fetch account data: ${err.message}`);
    } finally {
      fetchBtn.disabled = false;
    }
  }

  // Event Listeners
  console.log('Adding event listeners...');
  
  fetchBtn.addEventListener('click', (e) => {
    console.log('Button clicked!');
    e.preventDefault();
    fetchAccountData();
  });

  // Allow Enter key to submit
  accountIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchAccountData();
    }
  });
  
  secretKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchAccountData();
    }
  });

  console.log('App initialization complete');
});
