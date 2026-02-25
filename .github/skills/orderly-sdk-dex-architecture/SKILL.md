# Orderly SDK DEX Architecture

A comprehensive guide to architecting and scaffolding a complete DEX application using the Orderly Network SDK.

## Overview

This skill covers the complete architecture for building a production-ready DEX:

- Project structure and setup
- Provider hierarchy and configuration
- **Network configuration (REQUIRED)** - mainnet/testnet and supported chains
- **Page layouts with Scaffold (REQUIRED)** - navigation, footer, mobile nav
- **TradingView chart setup (REQUIRED for charts)** - charting library files
- Routing and page components
- Runtime configuration
- Build and deployment

**Critical Configuration**: Every DEX must have:
1. `brokerId` - Your Orderly broker ID
2. `networkId` - Either "mainnet" or "testnet"
3. Proper wallet connector setup with matching network
4. **Page layouts using `Scaffold` and `PortfolioLayoutWidget`** - Do NOT create custom navigation
5. **`useNav` hook** for routing adapter
6. TradingView charting library in `public/tradingview/` (for chart functionality)

---

## Project Structure

> **Official Template Structure**: This follows the official Orderly JS SDK Vite template pattern.

```
my-dex/
├── public/
│   ├── config.js              # Runtime configuration
│   ├── favicon.webp
│   ├── images/                # Brand images
│   │   ├── orderly-logo.svg
│   │   ├── orderly-logo-secondary.svg
│   │   └── pnl/               # PnL share poster backgrounds
│   │       ├── poster_bg_1.png
│   │       └── poster_bg_2.png
│   ├── locales/               # i18n translations
│   │   ├── en.json
│   │   ├── zh.json
│   │   └── extend/            # Custom translations
│   │       └── en.json
│   └── tradingview/           # TradingView library (REQUIRED for charts)
│       ├── chart.css          # Custom chart styles
│       └── charting_library/  # TradingView charting library files
│           ├── charting_library.js
│           └── ... (library files)
├── src/
│   ├── index.tsx              # Entry point
│   ├── routes.tsx             # Router configuration
│   ├── constant.ts            # Path enums and constants
│   ├── storage.ts             # Local storage utils
│   ├── utils.ts               # Helper functions
│   ├── vite-env.d.ts          # TypeScript declarations
│   ├── components/
│   │   ├── icons/             # Custom icons
│   │   │   └── orderly.tsx
│   │   ├── layout/            # Layout components (IMPORTANT)
│   │   │   ├── index.ts       # Export layouts
│   │   │   ├── baseLayout.tsx # Scaffold wrapper for most pages
│   │   │   ├── portfolioLayout.tsx # PortfolioLayoutWidget wrapper
│   │   │   └── tradingRewardsLayout.tsx # TradingRewardsLayoutWidget wrapper
│   │   └── orderlyProvider/   # SDK provider setup
│   │       └── index.tsx      # Main provider wrapper
│   ├── hooks/
│   │   ├── useNav.ts          # Navigation adapter (REQUIRED)
│   │   ├── useOrderlyConfig.tsx # App config hook (REQUIRED)
│   │   ├── usePageTitle.ts    # Page title management
│   │   └── usePathWithoutLang.ts # i18n path helper
│   ├── pages/
│   │   ├── perp/
│   │   │   └── page.tsx       # Trading page
│   │   ├── portfolio/
│   │   │   ├── page.tsx       # Portfolio overview
│   │   │   ├── positions/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── assets/page.tsx
│   │   │   ├── fee/page.tsx   # Fee tier
│   │   │   ├── api-key/page.tsx
│   │   │   ├── setting/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── markets/
│   │   │   └── page.tsx
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   └── rewards/
│   │       └── affiliate/page.tsx
│   └── styles/
│       ├── index.css          # Main CSS entry
│       ├── theme.css          # Custom theme variables
│       └── fonts.css          # Custom fonts
├── .env                       # Build-time env vars
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 7.x |
| Routing | React Router v7 (react-router) |
| Styling | Tailwind CSS + Orderly UI |
| State | Orderly hooks (SWR + Zustand) |
| UI Components | @orderly.network/ui |
| i18n | @orderly.network/i18n |

---

## 1. Project Setup

### Initialize Project

```bash
# Create Vite React project
npm create vite@latest my-dex -- --template react-ts
cd my-dex

# Install Orderly SDK packages
npm install @orderly.network/react-app \
            @orderly.network/trading \
            @orderly.network/portfolio \
            @orderly.network/markets \
            @orderly.network/affiliate \
            @orderly.network/trading-leaderboard \
            @orderly.network/trading-rewards \
            @orderly.network/hooks \
            @orderly.network/ui \
            @orderly.network/ui-scaffold \
            @orderly.network/wallet-connector \
            @orderly.network/i18n \
            @orderly.network/types

# Install routing (use react-router, not react-router-dom)
npm install react-router

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# REQUIRED: Install Node.js polyfills for browser
npm install -D vite-plugin-node-polyfills
```

### package.json

> **IMPORTANT**: Use `react-router` (not `react-router-dom`) and include `vite-plugin-node-polyfills`.

```json
{
  "name": "my-dex",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@orderly.network/affiliate": "^2.9.1",
    "@orderly.network/i18n": "^2.9.1",
    "@orderly.network/markets": "^2.9.1",
    "@orderly.network/portfolio": "^2.9.1",
    "@orderly.network/react-app": "^2.9.1",
    "@orderly.network/trading": "^2.9.1",
    "@orderly.network/trading-leaderboard": "^2.9.1",
    "@orderly.network/trading-rewards": "^2.9.1",
    "@orderly.network/types": "^2.9.1",
    "@orderly.network/ui": "^2.9.1",
    "@orderly.network/ui-scaffold": "^2.9.1",
    "@orderly.network/wallet-connector": "^2.9.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^7.7.1",
    "vite-plugin-node-polyfills": "^0.24.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.8.3",
    "vite": "^7.0.4"
  }
}
```

---

## 2. Provider Hierarchy

The SDK requires a specific provider nesting order:

```
LocaleProvider (i18n)
└── WalletConnectorProvider (or Privy)
    └── OrderlyAppProvider
        └── ModalProvider (from UI)
            └── TooltipProvider
                └── Your App
```

### Main Provider Component (Official Template Pattern)

```tsx
// src/components/orderlyProvider/index.tsx
import { Outlet } from "react-router";
import {
  LocaleCode,
  LocaleProvider,
  removeLangPrefix,
} from "@orderly.network/i18n";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";

export const OrderlyProvider = () => {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  const onLanguageChanged = async (lang: LocaleCode) => {
    const path = removeLangPrefix(window.location.pathname);
    window.history.replaceState({}, "", `/${lang}${path}`);
  };

  // Optional: Load custom translations
  const loadPath = (lang: LocaleCode) => {
    if (lang === "en") {
      return `/locales/extend/${lang}.json`;
    }
    return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  return (
    <LocaleProvider
      onLanguageChanged={onLanguageChanged}
      backend={{ loadPath }}
    >
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="your_broker_id"
          brokerName="Your DEX"
          networkId="testnet"
          appIcons={config.orderlyAppProvider.appIcons}
          onRouteChange={onRouteChange}
        >
          <Outlet />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
```

### Path Constants (REQUIRED)

```tsx
// src/constant.ts
export enum PathEnum {
  Root = "/",
  Perp = "/perp",

  Portfolio = "/portfolio",
  Positions = "/portfolio/positions",
  Orders = "/portfolio/orders",
  FeeTier = "/portfolio/fee",
  ApiKey = "/portfolio/api-key",
  Setting = "/portfolio/setting",
  History = "/portfolio/history",

  Markets = "/markets",
  Leaderboard = "/leaderboard",

  Rewards = "/rewards",
  RewardsAffiliate = "/rewards/affiliate",
}

export const PageTitleMap = {
  [PathEnum.Portfolio]: "Portfolio",
  [PathEnum.FeeTier]: "Fee tier",
  [PathEnum.ApiKey]: "API keys",
  [PathEnum.Orders]: "Orders",
  [PathEnum.Positions]: "Positions",
  [PathEnum.Setting]: "Settings",
  [PathEnum.History]: "History",
  [PathEnum.Markets]: "Markets",
  [PathEnum.Leaderboard]: "Leaderboard",
  [PathEnum.RewardsAffiliate]: "Affiliate program",
};
```

### Storage Utilities

```tsx
// src/storage.ts
export const DEFAULT_SYMBOL = "PERP_ETH_USDC";
export const ORDERLY_SYMBOL_KEY = "orderly-current-symbol";

export function getSymbol() {
  return localStorage.getItem(ORDERLY_SYMBOL_KEY) || DEFAULT_SYMBOL;
}

export function updateSymbol(symbol: string) {
  localStorage.setItem(ORDERLY_SYMBOL_KEY, symbol || DEFAULT_SYMBOL);
}
```

### Helper Utilities

```tsx
// src/utils.ts
import {
  i18n,
  parseI18nLang,
  getLocalePathFromPathname,
} from "@orderly.network/i18n";

export function generatePageTitle(title: string, suffix = "Your DEX") {
  return `${title} | ${suffix}`;
}

export function formatSymbol(symbol: string, format = "base-type") {
  const arr = symbol.split("_");
  const type = arr[0];
  const base = arr[1];
  const quote = arr[2];
  return format.replace("type", type).replace("base", base).replace("quote", quote);
}

/**
 * Generate path with locale prefix
 * /perp/PERP_BTC_USDC => /en/perp/PERP_BTC_USDC
 */
export function generateLocalePath(path: string) {
  let localePath = getLocalePathFromPathname(path);
  if (localePath) return path;
  localePath = parseI18nLang(i18n.language);
  return `/${localePath}${path}`;
}
```

---

## 2. Provider Hierarchy (Legacy Pattern)
            networkId={networkId}
            onChainChanged={onChainChanged}
            appIcons={config.appIcons}
          >
            {children}
          </OrderlyAppProvider>
        </WalletConnector>
      </Suspense>
    </LocaleProvider>
  );
};

export default OrderlyProvider;
```

### Wallet Connector Setup (REQUIRED)

> **IMPORTANT**: The `WalletConnectorProvider` MUST have both `evmInitial` AND `solanaInitial` configured. Without `evmInitial`, users cannot connect EVM wallets like MetaMask. Without `solanaInitial`, users cannot connect Solana wallets like Phantom.

```tsx
// src/components/orderlyProvider/walletConnector.tsx
import { ReactNode } from 'react';
import { WalletConnectorProvider } from '@orderly.network/wallet-connector';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { NetworkId } from "@orderly.network/types";
import { getEvmInitialConfig, getSolanaWallets } from '@/utils/walletConfig';

interface Props {
  children: ReactNode;
  networkId: NetworkId;
}

const WalletConnector = ({ children, networkId }: Props) => {
  // REQUIRED: EVM wallet config for MetaMask, WalletConnect, etc.
  const evmInitial = getEvmInitialConfig();

  // REQUIRED: Solana wallet config for Phantom, Solflare, etc.
  const solanaInitial = {
    network: networkId === 'mainnet' 
      ? WalletAdapterNetwork.Mainnet 
      : WalletAdapterNetwork.Devnet,
    wallets: getSolanaWallets(networkId),
  };

  return (
    <WalletConnectorProvider
      solanaInitial={solanaInitial}  // REQUIRED
      evmInitial={evmInitial}        // REQUIRED for EVM wallet support
    >
      {children}
    </WalletConnectorProvider>
  );
};

export default WalletConnector;
```

---

## 3. Network Configuration (REQUIRED)

**IMPORTANT**: Every Orderly DEX must configure the network properly. Without proper network configuration, the DEX will not function correctly.

### Supported Networks

Orderly Network supports the following chains:

#### Mainnet Chains (Production)

| Chain | Chain ID | Description |
|-------|----------|-------------|
| Arbitrum | 42161 | Primary mainnet chain |
| Optimism | 10 | OP mainnet |
| Base | 8453 | Base mainnet |
| Ethereum | 1 | Ethereum mainnet |
| BNB Chain | 56 | Binance Smart Chain |
| Polygon | 137 | Polygon mainnet |
| Mantle | 5000 | Mantle mainnet |
| Sei | 1329 | Sei Network |
| Solana | N/A | Solana mainnet |

#### Testnet Chains (Development)

| Chain | Chain ID | Description |
|-------|----------|-------------|
| Arbitrum Sepolia | 421614 | Primary testnet chain |
| Base Sepolia | 84532 | Base testnet |
| Optimism Sepolia | 11155420 | Optimism testnet |
| Solana Devnet | 901901901 | Solana devnet |

#### Default Chain Configuration

```typescript
// Default chains used by the SDK:
// Mainnet: Arbitrum (42161), Base (8453), Optimism (10)
// Testnet: Arbitrum Sepolia (421614)
```

### Network ID Configuration

The `networkId` prop determines whether your DEX connects to mainnet or testnet. **This is required on both OrderlyAppProvider and WalletConnectorProvider**.

```tsx
import type { NetworkId } from "@orderly.network/types";

// Network ID must be "mainnet" or "testnet"
const networkId: NetworkId = "mainnet"; // or "testnet"
```

### Complete Provider Setup with Network Config

```tsx
// src/components/orderlyProvider/index.tsx
import { ReactNode, useCallback, useState } from "react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { NetworkId } from "@orderly.network/types";

const NETWORK_ID_KEY = "orderly_network_id";

// Get current network from localStorage or default to mainnet
const getNetworkId = (): NetworkId => {
  if (typeof window === "undefined") return "mainnet";
  return (localStorage.getItem(NETWORK_ID_KEY) as NetworkId) || "mainnet";
};

const OrderlyProvider = ({ children }: { children: ReactNode }) => {
  const [networkId] = useState<NetworkId>(getNetworkId);

  // Handle chain changes between mainnet/testnet
  const onChainChanged = useCallback(
    (_chainId: number, { isTestnet }: { isTestnet: boolean }) => {
      const currentNetworkId = getNetworkId();
      if ((isTestnet && currentNetworkId === "mainnet") || 
          (!isTestnet && currentNetworkId === "testnet")) {
        const newNetworkId: NetworkId = isTestnet ? "testnet" : "mainnet";
        localStorage.setItem(NETWORK_ID_KEY, newNetworkId);
        window.location.reload();
      }
    },
    []
  );

  return (
    <WalletConnectorProvider
      // Solana network must match networkId
      solanaInitial={{
        network: networkId === "mainnet" 
          ? WalletAdapterNetwork.Mainnet 
          : WalletAdapterNetwork.Devnet,
        wallets: [], // Add your Solana wallets
      }}
      evmInitial={{
        options: {
          wallets: [], // Add your EVM wallets
        },
      }}
    >
      <OrderlyAppProvider
        brokerId="your_broker_id"
        brokerName="Your DEX Name"
        networkId={networkId}                    // REQUIRED: "mainnet" or "testnet"
        onChainChanged={onChainChanged}          // Handle network switching
      >
        {children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};
```

### Chain Filtering (Optional)

To restrict which chains users can select:

```tsx
// Filter to specific chains only
const chainFilter = {
  mainnet: [
    { id: 42161 },  // Arbitrum
    { id: 8453 },   // Base
    { id: 10 },     // Optimism
  ],
  testnet: [
    { id: 421614 }, // Arbitrum Sepolia
  ],
};

<OrderlyAppProvider
  brokerId="your_broker_id"
  networkId={networkId}
  chainFilter={chainFilter}  // Restrict available chains
>
```

### Default Chain (Optional)

Set a default chain for users:

```tsx
const defaultChain = {
  mainnet: { id: 42161 },  // Default to Arbitrum on mainnet
};

<OrderlyAppProvider
  brokerId="your_broker_id"
  networkId={networkId}
  defaultChain={defaultChain}
>
```

### Environment Variables for Network Config

```bash
# .env
VITE_ORDERLY_BROKER_ID=your_broker_id
VITE_ORDERLY_BROKER_NAME=Your DEX

# Chain configuration
VITE_ORDERLY_MAINNET_CHAINS=42161,10,8453
VITE_ORDERLY_TESTNET_CHAINS=421614
VITE_DEFAULT_CHAIN=42161

# Network toggles
VITE_DISABLE_MAINNET=false
VITE_DISABLE_TESTNET=false
```

---

## 4. Runtime Configuration

Use runtime configuration for deployment flexibility:

### public/config.js

```javascript
window.__RUNTIME_CONFIG__ = {
  "VITE_ORDERLY_BROKER_ID": "your_broker_id",
  "VITE_ORDERLY_BROKER_NAME": "Your DEX Name",
  "VITE_DISABLE_MAINNET": "false",
  "VITE_DISABLE_TESTNET": "false",
  "VITE_ORDERLY_MAINNET_CHAINS": "42161,10,8453,56,1",
  "VITE_ORDERLY_TESTNET_CHAINS": "421614,97",
  "VITE_DEFAULT_CHAIN": "42161",
  "VITE_WALLETCONNECT_PROJECT_ID": "your_project_id",
  "VITE_DISABLE_EVM_WALLETS": "false",
  "VITE_DISABLE_SOLANA_WALLETS": "false",
  "VITE_ENABLED_MENUS": "Trading,Portfolio,Markets,Leaderboard",
  "VITE_AVAILABLE_LANGUAGES": "en,zh,ja,ko",
};
```

### Runtime Config Loader

```tsx
// src/utils/runtime-config.ts

export function getRuntimeConfig(key: string): string {
  // Check runtime config first (from public/config.js)
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.[key]) {
    return window.__RUNTIME_CONFIG__[key];
  }
  // Fall back to build-time env vars
  return import.meta.env[key] || '';
}

export function getRuntimeConfigBoolean(key: string): boolean {
  return getRuntimeConfig(key) === 'true';
}

export function getRuntimeConfigArray(key: string): string[] {
  const value = getRuntimeConfig(key);
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

export function getRuntimeConfigNumber(key: string): number | undefined {
  const value = getRuntimeConfig(key);
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

// TypeScript declaration
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Record<string, string>;
  }
}
```

### Load Config Before App

```tsx
// src/main.tsx
import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Load runtime config before rendering
async function loadRuntimeConfig() {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = '/config.js';
    script.onload = () => resolve();
    script.onerror = () => resolve(); // Fallback to env vars
    document.head.appendChild(script);
  });
}

// Lazy load pages
const TradingPage = lazy(() => import('./pages/perp/Symbol'));
const PortfolioPage = lazy(() => import('./pages/portfolio/Index'));
const MarketsPage = lazy(() => import('./pages/markets/Index'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/perp/PERP_ETH_USDC" /> },
      {
        path: 'perp',
        children: [
          { index: true, element: <Navigate to="/perp/PERP_ETH_USDC" /> },
          { path: ':symbol', element: <TradingPage /> },
        ],
      },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'markets', element: <MarketsPage /> },
    ],
  },
]);

loadRuntimeConfig().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
```

---

## 5. App Root Component

```tsx
// src/App.tsx
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import OrderlyProvider from "@/components/orderlyProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <OrderlyProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </OrderlyProvider>
    </ErrorBoundary>
  );
}
```

---

## 6. Page Layouts (REQUIRED)

> **CRITICAL**: Every page must be wrapped in a proper layout component. The SDK provides `Scaffold` for trading pages and `PortfolioLayoutWidget` for portfolio pages. **Do not create custom navigation - use the SDK layout widgets.**

### Navigation Adapter Hook (Required)

The SDK scaffold components require a navigation adapter to handle routing:

```tsx
// src/hooks/useNav.ts
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { RouteOption } from "@orderly.network/types";
import { PathEnum } from "../constant";
import { getSymbol } from "../storage";
import { generateLocalePath } from "../utils";

export function useNav() {
  const navigate = useNavigate();

  const onRouteChange = useCallback(
    (option: RouteOption) => {
      // Handle external links
      if (option.target === "_blank") {
        window.open(option.href);
        return;
      }

      // Trading page - redirect to last symbol
      if (option.href === "/") {
        const symbol = getSymbol();
        navigate(generateLocalePath(`${PathEnum.Perp}/${symbol}`));
        return;
      }

      // Route mapping for portfolio sub-pages (SDK paths to your paths)
      const routeMap = {
        [PortfolioLeftSidebarPath.FeeTier]: PathEnum.FeeTier,
        [PortfolioLeftSidebarPath.ApiKey]: PathEnum.ApiKey,
      } as Record<string, string>;

      const path = routeMap[option.href] || option.href;
      navigate(generateLocalePath(path));
    },
    [navigate]
  );

  return { onRouteChange };
}
```

### Path Without Language Helper (for i18n)

```tsx
// src/hooks/usePathWithoutLang.ts
import { useMemo } from "react";
import { useLocation } from "react-router";
import { removeLangPrefix } from "@orderly.network/i18n";

/**
 * Get the pathname without the language prefix
 * /en/perp/PERP_BTC_USDC => /perp/PERP_BTC_USDC
 * /en/markets => /markets
 */
export function usePathWithoutLang() {
  const location = useLocation();
  return useMemo(() => removeLangPrefix(location.pathname), [location.pathname]);
}
```

### BaseLayout Component (Reusable Scaffold Wrapper)

```tsx
// src/components/layout/baseLayout.tsx
import { FC } from "react";
import { Scaffold, ScaffoldProps } from "@orderly.network/ui-scaffold";
import { PathEnum } from "../../constant";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";

export type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || PathEnum.Root,
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{ onRouteChange }}
      classNames={props.classNames}
    >
      {props.children}
    </Scaffold>
  );
};
```

### Portfolio Layout (PortfolioLayoutWidget)

```tsx
// src/components/layout/portfolioLayout.tsx
import { useMemo } from "react";
import { Outlet } from "react-router";
import {
  PortfolioLayoutWidget,
  PortfolioLeftSidebarPath,
} from "@orderly.network/portfolio";
import { PathEnum } from "../../constant";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export const PortfolioLayout = () => {
  const config = useOrderlyConfig();
  const path = usePathWithoutLang();
  const { onRouteChange } = useNav();

  // Map your paths to SDK sidebar paths
  const currentPath = useMemo(() => {
    if (path.endsWith(PathEnum.FeeTier)) return PortfolioLeftSidebarPath.FeeTier;
    if (path.endsWith(PathEnum.ApiKey)) return PortfolioLeftSidebarPath.ApiKey;
    return path;
  }, [path]);

  return (
    <PortfolioLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: PathEnum.Portfolio,
      }}
      routerAdapter={{ onRouteChange }}
      leftSideProps={{ current: currentPath }}
    >
      <Outlet />
    </PortfolioLayoutWidget>
  );
};
```

### Trading Rewards Layout

```tsx
// src/components/layout/tradingRewardsLayout.tsx
import { Outlet } from "react-router";
import { TradingRewardsLayoutWidget } from "@orderly.network/trading-rewards";
import { PathEnum } from "../../constant";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { usePathWithoutLang } from "../../hooks/usePathWithoutLang";

export const TradingRewardsLayout = () => {
  const config = useOrderlyConfig();
  const path = usePathWithoutLang();
  const { onRouteChange } = useNav();

  return (
    <TradingRewardsLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: PathEnum.Rewards,
      }}
      routerAdapter={{ onRouteChange }}
      leftSideProps={{ current: path }}
    >
      <Outlet />
    </TradingRewardsLayoutWidget>
  );
};
```

### Layout Exports

```tsx
// src/components/layout/index.ts
export { BaseLayout } from "./baseLayout";
export { PortfolioLayout } from "./portfolioLayout";
export { TradingRewardsLayout } from "./tradingRewardsLayout";
```

---

## 7. Complete Router Configuration (with i18n)

> **IMPORTANT**: The official template uses locale-prefixed routes (e.g., `/en/perp/PERP_ETH_USDC`). This enables proper i18n support.

```tsx
// src/routes.tsx
import { ComponentType, lazy, Suspense } from "react";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router";
import {
  getLocalePathFromPathname,
  i18n,
  parseI18nLang,
} from "@orderly.network/i18n";
import { Spinner } from "@orderly.network/ui";
import { PortfolioLayout, TradingRewardsLayout } from "./components/layout";
import { OrderlyProvider } from "./components/orderlyProvider";
import { PathEnum } from "./constant";
import { getSymbol } from "./storage";

// Loading fallback
const PageLoading = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
    <Spinner />
  </div>
);

// Lazy load helper
const lazyImportPage = (
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
): ComponentType<Record<string, unknown>> => {
  const LazyComponent = lazy(importFn);
  return (props: Record<string, unknown>) => (
    <Suspense fallback={<PageLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded pages
const PerpPage = lazyImportPage(() => import("./pages/perp/page"));
const PortfolioPage = lazyImportPage(() => import("./pages/portfolio/page"));
const PositionsPage = lazyImportPage(() => import("./pages/portfolio/positions/page"));
const OrdersPage = lazyImportPage(() => import("./pages/portfolio/orders/page"));
const AssetsPage = lazyImportPage(() => import("./pages/portfolio/assets/page"));
const FeeTierPage = lazyImportPage(() => import("./pages/portfolio/fee/page"));
const APIKeyPage = lazyImportPage(() => import("./pages/portfolio/api-key/page"));
const SettingsPage = lazyImportPage(() => import("./pages/portfolio/setting/page"));
const HistoryPage = lazyImportPage(() => import("./pages/portfolio/history/page"));
const MarketsPage = lazyImportPage(() => import("./pages/markets/page"));
const LeaderboardPage = lazyImportPage(() => import("./pages/leaderboard/page"));
const AffiliatePage = lazyImportPage(() => import("./pages/rewards/affiliate/page"));

const AppRoute = () => {
  // Get current locale
  let currentLocale = parseI18nLang(i18n?.language);
  const pathname = window.location.pathname;
  const localePath = getLocalePathFromPathname(pathname);

  // Redirect to locale path if missing
  if (!localePath && pathname !== PathEnum.Root) {
    const redirectPath = `/${currentLocale}${pathname}`;
    window.history.replaceState({}, "", redirectPath);
  }

  if (localePath && localePath !== currentLocale) {
    currentLocale = localePath;
    i18n.changeLanguage(localePath);
  }

  // Define base routes (without locale prefix)
  const baseRoutes: RouteObject[] = [
    {
      path: "perp",
      children: [
        { index: true, element: <Navigate to={`${getSymbol()}${window.location.search}`} /> },
        { path: ":symbol", element: <PerpPage /> },
      ],
    },
    {
      path: "portfolio",
      element: <PortfolioLayout />,
      children: [
        { index: true, element: <PortfolioPage /> },
        { path: "positions", element: <PositionsPage /> },
        { path: "orders", element: <OrdersPage /> },
        { path: "assets", element: <AssetsPage /> },
        { path: "fee", element: <FeeTierPage /> },
        { path: "api-key", element: <APIKeyPage /> },
        { path: "setting", element: <SettingsPage /> },
        { path: "history", element: <HistoryPage /> },
      ],
    },
    { path: "markets", element: <MarketsPage /> },
    { path: "leaderboard", element: <LeaderboardPage /> },
    {
      path: "rewards",
      element: <TradingRewardsLayout />,
      children: [
        { index: true, element: <Navigate to={`affiliate${window.location.search}`} /> },
        { path: "affiliate", element: <AffiliatePage /> },
      ],
    },
  ];

  const router = createBrowserRouter([
    {
      path: "/",
      element: <OrderlyProvider />,
      children: [
        {
          index: true,
          element: (
            <Navigate
              to={`/${currentLocale}${PathEnum.Perp}/${getSymbol()}${window.location.search}`}
            />
          ),
        },
        {
          path: ":lang",
          children: [
            { index: true, element: <Navigate to={`perp${window.location.search}`} /> },
            ...baseRoutes,
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoute;
```

### Entry Point

```tsx
// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppRoute from "./routes";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRoute />
  </React.StrictMode>
);
```

---

## 8. Page Components

### Trading Page (with BaseLayout)

```tsx
// src/pages/perp/page.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TradingPage, TradingPageProps } from "@orderly.network/trading";
import { API } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout";
import { PathEnum } from "../../constant";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { updateSymbol } from "../../storage";
import { generateLocalePath } from "../../utils";

export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const navigate = useNavigate();
  const config = useOrderlyConfig();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      setSymbol(data.symbol);
      navigate(generateLocalePath(`${PathEnum.Perp}/${data.symbol}`));
    },
    [navigate]
  );

  return (
    <BaseLayout>
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
    </BaseLayout>
  );
}
```

### Portfolio Overview Page

```tsx
// src/pages/portfolio/page.tsx
import { OverviewModule } from "@orderly.network/portfolio";

export default function PortfolioPage() {
  return <OverviewModule.OverviewPage />;
}
```

### Portfolio Positions Page

```tsx
// src/pages/portfolio/positions/page.tsx
import { PositionManagerModule } from "@orderly.network/portfolio";

export default function PositionsPage() {
  return <PositionManagerModule.PositionsPage />;
}
```

### Portfolio Orders Page

```tsx
// src/pages/portfolio/orders/page.tsx
import { OrdersModule } from "@orderly.network/portfolio";

export default function OrdersPage() {
  return <OrdersModule.OrdersPage />;
}
```

### Portfolio History Page

```tsx
// src/pages/portfolio/history/page.tsx
import { HistoryModule } from "@orderly.network/portfolio";

export default function HistoryPage() {
  return <HistoryModule.HistoryPage />;
}
```

### Portfolio Settings Page

```tsx
// src/pages/portfolio/setting/page.tsx
import { SettingModule } from "@orderly.network/portfolio";

export default function SettingsPage() {
  return <SettingModule.SettingPage />;
}
```

### Markets Page (with BaseLayout)

```tsx
// src/pages/markets/page.tsx
import { MarketsHomePage } from "@orderly.network/markets";
import { BaseLayout } from "../../components/layout";
import { PathEnum } from "../../constant";

export default function MarketsPage() {
  return (
    <BaseLayout initialMenu={PathEnum.Markets}>
      <MarketsHomePage />
    </BaseLayout>
  );
}
```

### Leaderboard Page (with BaseLayout)

```tsx
// src/pages/leaderboard/page.tsx
import { LeaderboardWidget } from "@orderly.network/trading-leaderboard";
import { BaseLayout } from "../../components/layout";
import { PathEnum } from "../../constant";

export default function LeaderboardPage() {
  return (
    <BaseLayout initialMenu={PathEnum.Leaderboard}>
      <LeaderboardWidget />
    </BaseLayout>
  );
}
```

### Affiliate Page

```tsx
// src/pages/rewards/affiliate/page.tsx
import { AffiliatePage as AffiliateWidget } from "@orderly.network/affiliate";

export default function AffiliatePage() {
  return <AffiliateWidget />;
}
```

---

---

## 9. App Configuration (REQUIRED)

> **CRITICAL**: The `useOrderlyConfig` hook must return scaffold props for navigation, footer, and app icons. These are required by the `Scaffold` and `PortfolioLayoutWidget` components.

```tsx
// src/hooks/useOrderlyConfig.tsx
import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AppLogos } from "@orderly.network/react-app";
import { TradingPageProps } from "@orderly.network/trading";
import { FooterProps, MainNavWidgetProps } from "@orderly.network/ui-scaffold";
import { PathEnum } from "../constant";

export type OrderlyConfig = {
  orderlyAppProvider: {
    appIcons: AppLogos;
  };
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    footerProps: FooterProps;
  };
  tradingPage: {
    tradingViewConfig: TradingPageProps["tradingViewConfig"];
    sharePnLConfig: TradingPageProps["sharePnLConfig"];
  };
};

export const useOrderlyConfig = () => {
  const { t } = useTranslation();

  return useMemo<OrderlyConfig>(() => {
    return {
      scaffold: {
        mainNavProps: {
          mainMenus: [
            { name: t("common.trading"), href: PathEnum.Root },
            { name: t("common.portfolio"), href: PathEnum.Portfolio },
            { name: t("common.markets"), href: PathEnum.Markets },
            { name: t("tradingLeaderboard.leaderboard"), href: PathEnum.Leaderboard },
            {
              name: t("tradingRewards.rewards"),
              href: PathEnum.Rewards,
              children: [
                {
                  name: t("common.affiliate"),
                  href: PathEnum.RewardsAffiliate,
                  description: "Earn rebates by referring traders",
                },
              ],
            },
          ],
          initialMenu: PathEnum.Root,
        },
        footerProps: {
          telegramUrl: "https://your-telegram-link",
          discordUrl: "https://discord.com/invite/your-discord",
          twitterUrl: "https://twitter.com/your-twitter",
        },
      },
      orderlyAppProvider: {
        appIcons: {
          main: {
            component: (
              <img
                alt="Logo"
                src="/images/orderly-logo.svg"
                style={{ width: 100, height: 40 }}
              />
            ),
          },
          secondary: {
            img: "/images/orderly-logo-secondary.svg",
          },
        },
      },
      tradingPage: {
        tradingViewConfig: {
          scriptSRC: "/tradingview/charting_library/charting_library.js",
          library_path: "/tradingview/charting_library/",
          customCssUrl: "/tradingview/chart.css",
        },
        sharePnLConfig: {
          backgroundImages: [
            "/images/pnl/poster_bg_1.png",
            "/images/pnl/poster_bg_2.png",
            "/images/pnl/poster_bg_3.png",
          ],
          color: "rgba(255, 255, 255, 0.98)",
          profitColor: "rgba(41, 223, 169, 1)",
          lossColor: "rgba(245, 97, 139, 1)",
          brandColor: "rgba(255, 255, 255, 0.98)",
          refLink: "https://your-dex.com",
          refSlogan: "Your referral slogan",
        },
      },
    };
  }, [t]);
};
```

---

## 10. TradingView Chart Setup (REQUIRED)

> **CRITICAL**: The TradingView charting library must be manually added to your `public/tradingview/` folder. The SDK does NOT include TradingView files due to licensing. Without these files, the chart will not render.

### Required Files Structure

```
public/
└── tradingview/
    ├── chart.css                    # Optional: custom chart styling
    └── charting_library/            # REQUIRED: TradingView library
        ├── charting_library.js      # Main library script
        ├── charting_library.d.ts
        ├── bundles/                 # Library bundles
        ├── datafeed-api.d.ts
        └── ... (other library files)
```

### How to Get TradingView Library

1. **Request access** from TradingView: https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/
2. **Download** the charting library package
3. **Copy** the `charting_library` folder to your `public/tradingview/` directory

### TradingView Configuration

```tsx
// In your TradingPage component
<TradingPage
  symbol={symbol}
  tradingViewConfig={{
    // REQUIRED: Path to the main library script
    scriptSRC: "/tradingview/charting_library/charting_library.js",
    // REQUIRED: Path to the library folder (must end with /)
    library_path: "/tradingview/charting_library/",
    // Optional: Custom CSS for chart styling
    customCssUrl: "/tradingview/chart.css",
    // Optional: Color configuration
    colorConfig: {
      upColor: "#26a69a",
      downColor: "#ef5350",
    },
  }}
/>
```

### Alternative: Use Without TradingView

If you don't have a TradingView license, you can omit the `tradingViewConfig` prop and the SDK will use a basic chart:

```tsx
<TradingPage
  symbol={symbol}
  onSymbolChange={onSymbolChange}
  // tradingViewConfig omitted - will use default chart
/>
```

### PnL Share Posters

For the share PnL feature, add poster background images:

```
public/
└── pnl/
    ├── poster_bg_1.png
    ├── poster_bg_2.png
    └── poster_bg_3.png
```

Configure in your TradingPage:

```tsx
<TradingPage
  symbol={symbol}
  sharePnLConfig={{
    backgroundImages: [
      "/pnl/poster_bg_1.png",
      "/pnl/poster_bg_2.png",
    ],
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgba(41, 223, 169, 1)",
    lossColor: "rgba(245, 97, 139, 1)",
  }}
/>
```

---

## 10. Wallet Configuration (REQUIRED)

> **CRITICAL**: Both EVM and Solana wallet configurations are required for a functional DEX. The `evmInitial` config enables MetaMask, WalletConnect, and other EVM wallets. The `solanaInitial` config enables Phantom, Solflare, etc. **You MUST pass both to `WalletConnectorProvider`.**

### Required Packages

```bash
# EVM wallet packages (REQUIRED for MetaMask, WalletConnect)
npm install @web3-onboard/injected-wallets @web3-onboard/walletconnect

# Solana wallet packages (REQUIRED for Phantom, Solflare)
npm install @solana/wallet-adapter-base @solana/wallet-adapter-wallets
```

### walletConfig.ts

```tsx
// src/utils/walletConfig.ts
import injectedOnboard from "@web3-onboard/injected-wallets";
import walletConnectOnboard from "@web3-onboard/walletconnect";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { NetworkId } from "@orderly.network/types";

// EVM WALLETS - Required for MetaMask, Coinbase, WalletConnect, etc.
export function getOnboardEvmWallets() {
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  const isBrowser = typeof window !== "undefined";
  
  // Always include injected wallets (MetaMask, Coinbase, Rabby, etc.)
  const wallets = [injectedOnboard()];
  
  // Add WalletConnect if project ID is configured
  if (walletConnectProjectId && isBrowser) {
    wallets.push(
      walletConnectOnboard({
        projectId: walletConnectProjectId,
        qrModalOptions: { themeMode: "dark" },
        dappUrl: window.location.origin,
      })
    );
  }

  return wallets;
}

// REQUIRED: Returns EVM wallet configuration for WalletConnectorProvider
export function getEvmInitialConfig() {
  const wallets = getOnboardEvmWallets();
  
  return {
    options: {
      wallets,
      appMetadata: {
        name: import.meta.env.VITE_ORDERLY_BROKER_NAME || "DEX",
        description: "Decentralized Perpetual Exchange",
      },
    },
  };
}

// SOLANA WALLETS - Required for Phantom, Solflare, etc.
export function getSolanaWallets(_networkId: NetworkId) {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return [];

  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];
}
}
```

---

## 12. Styling Setup

### src/styles/index.css

> **IMPORTANT**: Only import CSS from `@orderly.network/ui`. Other packages use the base UI styles. Import order matters!

```css
/* src/styles/index.css */
@import "@orderly.network/ui/dist/styles.css";
@import "./theme.css";
@import "./fonts.css";

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### src/styles/theme.css (Custom Theme)

> **CRITICAL**: CSS variables must be defined WITHOUT color space function. Only use space-separated RGB values.

```css
/* src/styles/theme.css */
:root {
  /* Base colors (backgrounds) */
  --oui-color-base-100: 93 83 123;
  --oui-color-base-200: 81 72 107;
  --oui-color-base-300: 68 61 89;
  --oui-color-base-400: 57 52 74;
  --oui-color-base-500: 51 46 66;
  --oui-color-base-600: 43 38 56;
  --oui-color-base-700: 36 32 47;
  --oui-color-base-800: 29 26 38;
  --oui-color-base-900: 22 20 28;

  /* Primary color (buttons, borders) */
  --oui-color-primary: 182 79 255;
  --oui-color-primary-light: 208 140 255;
  --oui-color-primary-darken: 152 62 214;

  /* Link color */
  --oui-color-link: 182 79 255;

  /* Error/destructive actions */
  --oui-color-danger: 232 88 175;
  --oui-color-danger-light: 255 103 191;
  --oui-color-danger-darken: 199 68 146;

  /* Success/constructive actions */
  --oui-color-success: 3 152 134;
  --oui-color-success-light: 0 181 159;
  --oui-color-success-darken: 0 119 105;

  /* Warning */
  --oui-color-warning: 255 207 115;
  --oui-color-warning-light: 229 199 0;
  --oui-color-warning-darken: 229 199 0;

  /* Trading colors */
  --oui-color-trading-loss: 255 103 194;
  --oui-color-trading-loss-contrast: 40 46 58;
  --oui-color-trading-profit: 0 181 159;
  --oui-color-trading-profit-contrast: 40 46 58;

  /* Background */
  --oui-color-background: 27 32 40;
  --oui-color-background-contrast: 255 255 255;

  /* Fill */
  --oui-color-fill: 36 32 47;
  --oui-color-fill-light: 40 46 58;

  /* Popover */
  --oui-color-popover: 43 38 56;
  --oui-color-popover-foreground: 255 255 255;

  /* Foreground */
  --oui-color-base-foreground: 255 255 255;

  /* Rounded corners */
  --oui-rounded: 6px;
  --oui-rounded-sm: 4px;
  --oui-rounded-lg: 8px;
  --oui-rounded-full: 9999px;

  /* Font */
  --oui-font-family: 'Manrope', sans-serif;
  --oui-font-size-base: 16px;

  /* Divider */
  --oui-color-divider: 42 46 52;

  /* Button */
  --oui-button-shadow: none;
}
```

### CSS Variable Rules

❌ **DON'T** - Include color space function:
```css
--oui-color-primary: rgb(182 79 255);
```

✅ **DO** - Use space-separated RGB values:
```css
--oui-color-primary: 182 79 255;
```

### Style Overrides

Override specific component styles using class selectors:

```css
/* General buttons */
.oui-button {
  background-color: #000;
  color: #fff;
}

/* Primary buttons */
.oui-button-primary {
  background-color: #7b61ff;
}

/* Disabled buttons */
.oui-button-disabled {
  background-color: rgba(0, 0, 0, 0.3);
  color: #999;
}

/* Specific component by ID */
#orderly-order-entry-confirm-button {
  background-color: #000;
  color: #fff;
}
```

### Theme Tool

Use the official [Theme Tool](https://sdk.orderly.network/theme) to quickly create custom themes!

---

## 13. Vite Configuration

> **Important**: The wallet connector packages use Node.js built-ins like `Buffer`. You must add polyfills for browser compatibility.

### vite.config.ts (Official Template)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    // Required for wallet libraries that use Node.js built-ins
    nodePolyfills({
      include: ["path", "stream", "util", "assert", "crypto"],
      exclude: ["http"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: "memfs",
      },
      protocolImports: true,
    }),
  ],
  server: {
    open: true,
    host: true,
  },
});
```

### Alternative vite.config.ts (with chunks)
            '@orderly.network/trading',
          ],
          'orderly-portfolio': [
            '@orderly.network/portfolio',
          ],
        },
      },
    },
  },
});
```

---

## 13. High-Level Page Widgets

### Available Page Widgets

| Package | Component | Description |
|---------|-----------|-------------|
| `@orderly.network/trading` | `TradingPage` | Full trading interface with orderbook, chart, order entry |
| `@orderly.network/portfolio` | `Portfolio` | Portfolio overview with positions, orders, history |
| `@orderly.network/markets` | `MarketsHomePage` | Markets listing with prices, volumes |
| `@orderly.network/trading-leaderboard` | `LeaderboardPage` | Trading leaderboard |
| `@orderly.network/trading-rewards` | `TradingRewardsPage` | Trading rewards/affiliate program |
| `@orderly.network/vaults` | `VaultsPage` | Vault/earn products |

### TradingPage Props

```tsx
interface TradingPageProps {
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  tradingViewConfig?: {
    scriptSRC: string;
    library_path: string;
    customCssUrl?: string;
    overrides?: Record<string, any>;
  };
  sharePnLConfig?: {
    backgroundImages?: string[];
    color?: "brand" | "profit" | "loss";
  };
}
```

### Portfolio Modules

```tsx
import { 
  OverviewModule,
  PositionsModule,
  OrdersModule,
  AssetsModule,
  HistoryModule,
} from "@orderly.network/portfolio";

// Full overview page
<OverviewModule.OverviewPage />

// Individual sections
<PositionsModule.PositionsPage />
<OrdersModule.OrdersPage />
<AssetsModule.AssetsPage />
<HistoryModule.HistoryPage />
```

---

## 14. Custom Layout with Scaffold

```tsx
import { 
  Scaffold,
  MainNavWidget,
  BottomNavWidget,
  AccountMenuWidget,
  ChainMenuWidget,
} from "@orderly.network/ui-scaffold";

function CustomLayout({ children }) {
  return (
    <Scaffold
      header={
        <MainNavWidget
          logo={<Logo />}
          items={navigationItems}
          trailing={
            <>
              <ChainMenuWidget />
              <AccountMenuWidget />
            </>
          }
        />
      }
      footer={<BottomNavWidget items={bottomNavItems} />}
    >
      {children}
    </Scaffold>
  );
}
```

---

## 15. Environment Variables

### .env (Build-time)

```bash
# Orderly Configuration
VITE_ORDERLY_BROKER_ID=your_broker_id
VITE_ORDERLY_BROKER_NAME=Your DEX

# Network
VITE_DEFAULT_NETWORK=mainnet

# Wallet Connect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Features
VITE_ENABLE_TRADING_VIEW=true
```

### Build vs Runtime Config

| Config Type | When to Use |
|-------------|-------------|
| Build-time (.env) | Static values, API keys (during development) |
| Runtime (config.js) | Deployment-specific values, multi-tenant deployments |

---

## 16. Deployment

### Build Command

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime config is mounted at deployment
# COPY config.js /usr/share/nginx/html/config.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache config.js (runtime config)
    location = /config.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

## 17. Complete File Examples

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/webp" href="/favicon.webp" />
    <title>My DEX</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### ErrorBoundary.tsx

```tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { Button, Text, Flex } from "@orderly.network/ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex direction="column" align="center" justify="center" className="h-screen">
          <Text size="xl" weight="bold">Something went wrong</Text>
          <Text color="neutral">{this.state.error?.message}</Text>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Flex>
      );
    }

    return this.props.children;
  }
}
```

### LoadingSpinner.tsx

```tsx
import { Spinner, Flex } from "@orderly.network/ui";

export function LoadingSpinner() {
  return (
    <Flex align="center" justify="center" className="h-screen w-full">
      <Spinner size="lg" />
    </Flex>
  );
}
```

---

## Best Practices

### 1. Use Lazy Loading for Pages
```tsx
const TradingPage = lazy(() => import('./pages/perp/Symbol'));
```

### 2. Separate Runtime from Build Config
```tsx
// Runtime config can be changed without rebuild
const brokerId = getRuntimeConfig('VITE_ORDERLY_BROKER_ID');
```

### 3. Code Split by Feature
```ts
// vite.config.ts
manualChunks: {
  'orderly-trading': ['@orderly.network/trading'],
  'orderly-portfolio': ['@orderly.network/portfolio'],
}
```

### 4. Handle Loading States
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <TradingPage />
</Suspense>
```

### 5. Use Error Boundaries
```tsx
<ErrorBoundary>
  <OrderlyProvider>
    <App />
  </OrderlyProvider>
</ErrorBoundary>
```

### 6. Persist User Preferences
```tsx
const symbol = localStorage.getItem("lastSymbol") || "PERP_ETH_USDC";
const networkId = localStorage.getItem("networkId") || "mainnet";
```

### 7. Support SEO (if needed)
```tsx
import { Helmet } from "react-helmet-async";

<Helmet>
  <title>{`${symbol} Trading | My DEX`}</title>
  <meta name="description" content="Trade perpetual futures" />
</Helmet>
```

---

## Checklist for Production

- [ ] Broker ID configured
- [ ] WalletConnect project ID (for mobile wallets)
- [ ] Runtime config.js deployed
- [ ] TradingView library (if using charts)
- [ ] Custom branding (logo, favicon, colors)
- [ ] i18n translations (if multi-language)
- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics integration
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for API
- [ ] Rate limiting (if custom backend)
