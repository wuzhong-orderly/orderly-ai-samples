# Market Data Sample (Orderly EVM)

This project displays live market data from the **Orderly Network (EVM)** API.

## Features
- Fetches real-time ticker data from `api-evm.orderly.org`
- Displays **Symbol**, **Price**, **24h Change**, and **Volume (USDC)**
- Client-side sorting and filtering
- Auto-refreshes every 5 seconds

## Setup
Simply open `index.html` in your web browser. No build server required.

## API Model
Uses the `v1/public/futures` endpoint.
- Price: `24h_close`
- Change: Calculated from `24h_open` and `24h_close`
- Volume: `24h_amount` (Quote volume in USDC)
