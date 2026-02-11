import type { Adapter, WalletError } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import type { NetworkId } from "@orderly.network/types";

export const getSolanaWallets = (_networkId: NetworkId) => {
  const isBrowser = typeof window !== "undefined";

  if (!isBrowser) {
    return [];
  }

  return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
};

export const getSolanaConfig = (networkId: NetworkId) => {
  return {
    wallets: getSolanaWallets(networkId),
    onError: (error: WalletError, adapter?: Adapter) => {
      console.log("Solana wallet error:", error, adapter);
    },
  };
};
