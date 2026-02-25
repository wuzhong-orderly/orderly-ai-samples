import { createBrowserRouter } from "react-router";
import PerpPage from "./pages/perp/page";
import PortfolioPage from "./pages/portfolio/page";
import MarketsPage from "./pages/markets/page";

/**
 * Application Routes
 * Defines all pages and their paths in the DEX
 */
export const routes = [
  {
    path: "/",
    element: <PerpPage />,
    index: true,
  },
  {
    path: "/perp",
    element: <PerpPage />,
  },
  {
    path: "/portfolio",
    element: <PortfolioPage />,
  },
  {
    path: "/markets",
    element: <MarketsPage />,
  },
];

export const router = createBrowserRouter(routes);
