import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnector } from "@orderly.network/wallet-connector";
import { ReactNode } from "react";
import { theme, appIcons } from "./config";

interface Props {
    children: ReactNode;
}

export const OrderlyProvider = ({ children }: Props) => {
  return (
    <OrderlyAppProvider
      brokerId={import.meta.env.VITE_BROKER_ID}
      networkId={import.meta.env.VITE_NETWORK as "testnet" | "mainnet"}
      appIcons={appIcons}
      theme={theme}
    >
      <WalletConnector>
        {children}
      </WalletConnector>
    </OrderlyAppProvider>
  );
};
