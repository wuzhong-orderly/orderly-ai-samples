import React from "react";
import { Scaffold } from "@orderly.network/ui-scaffold";

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * Base Layout Wrapper
 * Uses official Scaffold component from Orderly for consistent navigation and structure
 */
export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Scaffold>
      {children}
    </Scaffold>
  );
};

/**
 * Portfolio Layout Wrapper
 * Uses Scaffold for portfolio pages
 */
export const PortfolioLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Scaffold>
      {children}
    </Scaffold>
  );
};

export { BaseLayout as default };
