/**
 * Runtime Configuration
 * This config is loaded at runtime and can be overridden via environment variables
 */
export const runtimeConfig = {
  // Orderly API Configuration
  brokerId: import.meta.env.VITE_BROKER_ID || "orderly",
  networkId: (import.meta.env.VITE_NETWORK_ID || "testnet") as "mainnet" | "testnet",
  chainId: import.meta.env.VITE_CHAIN_ID || "arbitrum",

  // API Endpoints (automatically set based on network)
  apiBaseUrl: import.meta.env.VITE_API_URL,

  // Feature flags
  enableWalletConnect: true,
  enableSolana: true,
  enableAffiliate: true,
  enableLeaderboard: true,
  enableRewards: true,

  // UI Configuration
  theme: "dark" as const,
  locale: "en",
};

// Export for use in config.js (public/config.js)
export type RuntimeConfig = typeof runtimeConfig;
