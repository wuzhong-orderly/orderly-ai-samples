import React from "react";
import { BaseLayout } from "../../components/layout";
import { Box } from "@orderly.network/ui";

/**
 * Perpetuals Trading Page
 * Full trading interface with chart, orderbook, order entry, and positions
 */
export const PerpPage: React.FC = () => {
  return (
    <BaseLayout>
      <Box p={4}>
        <h1>Trading (Perpetuals)</h1>
        <p>Complete trading interface with chart, order book, and positions</p>
        {/* TradingPage component integration */}
      </Box>
    </BaseLayout>
  );
};

export default PerpPage;
