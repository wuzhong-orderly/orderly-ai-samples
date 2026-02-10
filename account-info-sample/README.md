# Orderly Account Info Sample

A simple web page to view your assets (holdings) and open positions on Orderly Network.

## Features

- View current token holdings/balances
- View open perpetual positions with PnL
- Account summary (total collateral, margin ratio, unrealized PnL)
- Support for both Testnet and Mainnet
- Ed25519 signature authentication

## Usage

1. Open `index.html` in a web browser (you may need to serve it via a local server due to ES module imports)
2. Enter your Orderly **Account ID** (starts with `0x...`)
3. Enter your **Secret Key** (supports Base58 or Hex format)
4. Select the **Network** (Testnet or Mainnet)
5. Click **Fetch Account Info**

## Running Locally

Since this uses ES modules, you need to serve it via a local HTTP server:

```bash
# Using Python 3
python -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8080
```

Then open http://localhost:8080 in your browser.

## API Endpoints Used

- `GET /v1/client/holding` - Fetches token balances
- `GET /v1/positions` - Fetches open positions and account summary

## Authentication

This sample implements the Orderly API authentication:

1. Constructs a message: `timestamp + method + path + body`
2. Signs with ed25519 using your secret key
3. Sends headers: `orderly-account-id`, `orderly-key`, `orderly-timestamp`, `orderly-signature`

## Security Notes

⚠️ **Never share your secret key with anyone!**

This sample runs entirely in your browser - your credentials are never sent to any server other than Orderly's official API endpoints.

For production use, consider:
- Using environment variables or secure key management
- Running on HTTPS only
- Implementing rate limiting on your end

## Dependencies

- [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) - For ed25519 signing (loaded via CDN)
