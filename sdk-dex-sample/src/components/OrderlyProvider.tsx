import { ReactNode, useCallback } from "react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { NetworkId } from "@orderly.network/types";
import { LocaleProvider, LocaleEnum } from "@orderly.network/i18n";
import { getSolanaWallets } from "@/utils/walletConfig";

// Configuration - You should replace these with your own values
const BROKER_ID = "orderly"; // Replace with your broker ID
const BROKER_NAME = "Orderly DEX"; // Replace with your broker name
const NETWORK_ID: NetworkId = "testnet"; // Use "mainnet" for production

const OrderlyProvider = ({ children }: { children: ReactNode }) => {
  const networkId = NETWORK_ID;

  const onChainChanged = useCallback(
    (_chainId: number, { isTestnet }: { isTestnet: boolean }) => {
      console.log("Chain changed:", _chainId, "isTestnet:", isTestnet);
    },
    []
  );

  // Solana wallet configuration
  const solanaInitial = {
    network:
      networkId === "mainnet"
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet,
    wallets: getSolanaWallets(networkId),
  };

  return (
    <LocaleProvider locale={LocaleEnum.en}>
      <WalletConnectorProvider solanaInitial={solanaInitial}>
        <OrderlyAppProvider
          brokerId={BROKER_ID}
          brokerName={BROKER_NAME}
          networkId={networkId}
          onChainChanged={onChainChanged}
          appIcons={{
            main: {
              img: "/vite.svg",
            },
            secondary: {
              img: "/vite.svg",
            },
          }}
        >
          {children}
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};

export default OrderlyProvider;
