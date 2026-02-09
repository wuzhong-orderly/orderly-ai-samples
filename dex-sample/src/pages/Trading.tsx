import { TradingPage } from "@orderly.network/react-app";
import { useParams } from "react-router-dom";

export const Trading = () => {
  const { symbol } = useParams();
  
  return (
    <div className="h-screen w-full">
      <TradingPage 
        symbol={symbol || "PERP_ETH_USDC"} 
        onSymbolChange={(newSymbol) => {
            // Updating URL without reload
            window.history.pushState(null, '', `/trading/${newSymbol}`);
        }}
      />
    </div>
  );
};
