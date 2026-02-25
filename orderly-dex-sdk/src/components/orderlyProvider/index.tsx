import React from "react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { LocaleProvider } from "@orderly.network/i18n";
import { OrderlyThemeProvider } from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { runtimeConfig } from "../../constant";

interface OrderlyProviderProps {
  children: React.ReactNode;
}

/**
 * Main Orderly Provider Wrapper
 * Combines all necessary providers from Orderly SDK in correct order:
 * 1. LocaleProvider - Internationalization
 * 2. OrderlyThemeProvider - Theme management
 * 3. WalletConnectorProvider - Wallet connection (EVM + Solana)
 * 4. OrderlyAppProvider - Main Orderly app context
 */
export const OrderlyProvider: React.FC<OrderlyProviderProps> = ({
  children,
}) => {
  return (
    <LocaleProvider locale={runtimeConfig.locale}>
      <OrderlyThemeProvider>
        <WalletConnectorProvider>
          <OrderlyAppProvider
            brokerId={runtimeConfig.brokerId}
            networkId={runtimeConfig.networkId}
          >
            {children}
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      </OrderlyThemeProvider>
    </LocaleProvider>
  );
};
