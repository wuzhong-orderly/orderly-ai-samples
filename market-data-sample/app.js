// Orderly Network EVM API Endpoint
const API_URL = 'https://api-evm.orderly.org/v1/public/futures';

// DOM Elements
const tableBody = document.querySelector('#marketTable tbody');
const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');
const statusDot = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const headers = document.querySelectorAll('th');

// State
let marketData = [];
let sortConfig = { key: 'volume', direction: 'desc' }; // default sort by volume desc

/**
 * Fetch market data from Orderly API
 */
async function fetchMarketData() {
  try {
    statusText.innerText = 'Fetching data...';
    
    // Using fetch
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const json = await response.json();
    
    // API Response structure: { success: true, data: { rows: [...] } }
    if (json.success && json.data && Array.isArray(json.data.rows)) {
      marketData = json.data.rows.map(processItem);
      renderTable();
      updateStatus(true);
    } else {
      throw new Error('Invalid data structure');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    updateStatus(false, err.message);
    loader.innerText = 'Failed to load data. Please try again.';
  }
}

/**
 * Process a single API item into our view model
 */
function processItem(item) {
  // Calculate 24h Change Percentage
  // Formula: ((Close - Open) / Open) * 100
  const open = item['24h_open'];
  const close = item['24h_close'];
  let changePercent = 0;
  
  if (open && open > 0) {
    changePercent = ((close - open) / open) * 100;
  }

  return {
    symbol: item.symbol,
    price: close,
    change: changePercent,
    // Use 24h_amount for quote volume (USDC volume), or 24h_volume for base volume
    volume: item['24h_amount']
  };
}

/**
 * Render the table based on current state (data, filter, sort)
 */
function renderTable() {
  // Filter
  const query = searchInput.value.toLowerCase();
  let filteredData = marketData.filter(item => 
    item.symbol.toLowerCase().includes(query)
  );

  // Sort
  filteredData.sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    
    // Handle string comparison for symbol
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Render HTML
  loader.classList.add('hidden');
  tableBody.innerHTML = filteredData.map(item => {
    const isPositive = item.change >= 0;
    const changeClass = isPositive ? 'text-green' : 'text-red';
    const sign = isPositive ? '+' : '';
    
    // Formatting
    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price);
    const volumeFormatted = formatCompactNumber(item.volume);
    const changeFormatted = `${sign}${item.change.toFixed(2)}%`;

    return `
      <tr>
        <td><b>${item.symbol}</b></td>
        <td class="text-right">${priceFormatted}</td>
        <td class="text-right ${changeClass}">${changeFormatted}</td>
        <td class="text-right">${volumeFormatted}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Helper to format large numbers (e.g. 1.5M, 200k)
 */
function formatCompactNumber(number) {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

/**
 * Update Status UI
 */
function updateStatus(isOnline, msg) {
  if (isOnline) {
    statusDot.classList.add('active');
    statusText.innerText = 'Live Data (EVM)';
  } else {
    statusDot.classList.remove('active');
    statusText.innerText = msg || 'Error connecting';
  }
}

/**
 * Handle Sorting
 */
function handleSort(e) {
  const column = e.target.closest('th');
  if (!column) return;
  
  const key = column.dataset.sort;
  if (sortConfig.key === key) {
    // Toggle direction
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.key = key;
    sortConfig.direction = 'desc'; // Default to desc for new columns
  }
  
  renderTable();
}

// Event Listeners
searchInput.addEventListener('input', renderTable);
headers.forEach(th => th.addEventListener('click', handleSort));

// Initial Load
fetchMarketData();

// Refresh every 5 seconds
setInterval(fetchMarketData, 5000);
