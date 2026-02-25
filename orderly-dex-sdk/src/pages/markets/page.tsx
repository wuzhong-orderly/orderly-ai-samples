import React from "react";
import { BaseLayout } from "../../components/layout";
import { Box } from "@orderly.network/ui";

/**
 * Markets Listing Page
 * Browse all available trading pairs with prices, volumes, and statistics
 */
export const MarketsPage: React.FC = () => {
  return (
    <BaseLayout>
      <Box p={4}>
        <h1>Markets</h1>
        <p>Browse all available trading pairs</p>
        {/* Markets listing integration */}
      </Box>
    </BaseLayout>
  );
};

export default MarketsPage;
