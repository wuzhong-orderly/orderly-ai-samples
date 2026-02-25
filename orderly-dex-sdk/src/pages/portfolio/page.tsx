import React from "react";
import { PortfolioLayout } from "../../components/layout";
import { Box } from "@orderly.network/ui";

/**
 * Portfolio Dashboard Page
 * Shows account overview, positions, orders, and assets
 */
export const PortfolioPage: React.FC = () => {
  return (
    <PortfolioLayout>
      <Box p={4}>
        <h1>Portfolio</h1>
        <p>Account overview, positions, orders, and assets</p>
        {/* Portfolio modules integration */}
      </Box>
    </PortfolioLayout>
  );
};

export default PortfolioPage;
