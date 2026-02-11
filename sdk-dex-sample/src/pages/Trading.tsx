import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";

// Default symbol for trading
const DEFAULT_SYMBOL = "PERP_ETH_USDC";

export default function TradingPageView() {
  const params = useParams();
  const navigate = useNavigate();

  // Get symbol from URL params or use default
  const initialSymbol = params.symbol || DEFAULT_SYMBOL;
  const [symbol, setSymbol] = useState(initialSymbol);

  // Update symbol when URL changes
  useEffect(() => {
    if (params.symbol && params.symbol !== symbol) {
      setSymbol(params.symbol);
    }
  }, [params.symbol, symbol]);

  // Handle symbol change from the trading interface
  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const newSymbol = data.symbol;
      setSymbol(newSymbol);
      navigate(`/perp/${newSymbol}`);
    },
    [navigate]
  );

  return (
    <TradingPage
      symbol={symbol}
      onSymbolChange={onSymbolChange}
      tradingViewConfig={{
        scriptSRC: "/tradingview/charting_library/charting_library.js",
        library_path: "/tradingview/charting_library/",
        customCssUrl: "/tradingview/chart.css",
      }}
      sharePnLConfig={{
        backgroundImages: [
          "/pnl/poster_bg_1.png",
          "/pnl/poster_bg_2.png",
          "/pnl/poster_bg_3.png",
        ],
      }}
    />
  );
}
