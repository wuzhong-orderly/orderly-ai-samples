/**
 * TypeScript environment declarations
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BROKER_ID?: string;
  readonly VITE_NETWORK_ID?: "mainnet" | "testnet";
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
