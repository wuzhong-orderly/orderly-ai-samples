import { useMemo } from "react";
import { runtimeConfig } from "../constant";

/**
 * Application configuration hook
 * Centralizes all app configuration in one place
 */
export const useOrderlyConfig = () => {
  return useMemo(() => ({
    brokerId: runtimeConfig.brokerId,
    networkId: runtimeConfig.networkId,
    chainId: runtimeConfig.chainId,
    apiBaseUrl: runtimeConfig.apiBaseUrl,
    theme: runtimeConfig.theme,
    locale: runtimeConfig.locale,
    enableWalletConnect: runtimeConfig.enableWalletConnect,
    enableSolana: runtimeConfig.enableSolana,
  }), []);
};
