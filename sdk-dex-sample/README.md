# Orderly SDK Trading Page Sample

A fully functional trading page built with Orderly Network SDK. This sample demonstrates how to integrate Orderly's perpetual trading functionality into your React application.

## Features

- ✅ Full trading interface with order book, charts, and order entry
- ✅ TradingView integration for advanced charting
- ✅ Wallet connection (EVM & Solana)
- ✅ Symbol switching
- ✅ PnL sharing functionality
- ✅ Dark theme with customizable CSS variables

## Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm

## Quick Start

1. **Install dependencies:**

```bash
pnpm install
```

2. **Start the development server:**

```bash
pnpm dev
```

3. **Open your browser:**

Navigate to `http://localhost:5173`

## Configuration

### Broker Configuration

Edit `src/components/OrderlyProvider.tsx` to configure your broker:

```typescript
const BROKER_ID = "orderly";        // Replace with your broker ID
const BROKER_NAME = "Orderly DEX";  // Replace with your broker name
const NETWORK_ID = "testnet";       // Use "mainnet" for production
```

### TradingView Charts

The trading page requires TradingView Charting Library for advanced charts. You can:

1. **Use Basic Charts:** The SDK includes a basic charting solution that works without TradingView
2. **Add TradingView:** Place the TradingView Charting Library in `public/tradingview/` if you have a license

### Theme Customization

Edit `src/styles/index.css` to customize the theme using CSS variables:

```css
:root {
  --oui-color-primary: 187 52% 76%;
  --oui-color-success: 168 83% 59%;
  --oui-color-danger: 0 91% 71%;
  /* ... more variables */
}
```

## Project Structure

```
sdk-dex-sample/
├── src/
│   ├── components/
│   │   └── OrderlyProvider.tsx  # SDK provider setup
│   ├── pages/
│   │   └── Trading.tsx          # Trading page component
│   ├── styles/
│   │   └── index.css            # Global styles and theme
│   ├── utils/
│   │   └── walletConfig.ts      # Wallet configuration
│   ├── App.tsx                  # Root app component
│   └── main.tsx                 # Entry point
├── public/
│   ├── tradingview/             # TradingView assets (optional)
│   └── pnl/                     # PnL sharing backgrounds
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## SDK Packages Used

- `@orderly.network/react-app` - Core React application provider
- `@orderly.network/trading` - Trading page component
- `@orderly.network/wallet-connector` - Wallet connection
- `@orderly.network/ui` - UI components and styling
- `@orderly.network/i18n` - Internationalization

## URL Routing

- `/` - Default trading page (ETH/USDC perpetual)
- `/perp/:symbol` - Trading page for specific symbol (e.g., `/perp/PERP_BTC_USDC`)

## Building for Production

```bash
pnpm build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
pnpm preview
```

## Learn More

- [Orderly Network Documentation](https://docs.orderly.network/)
- [Orderly SDK NPM Packages](https://www.npmjs.com/org/orderly.network)
- [TradingView Charting Library](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/)

## License

MIT
