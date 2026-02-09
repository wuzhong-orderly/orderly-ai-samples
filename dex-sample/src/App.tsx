import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { OrderlyProvider } from "./orderly/provider";
import { Trading } from "./pages/Trading";
import "@orderly.network/react-app/dist/styles.css";

function App() {
  return (
    <OrderlyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/trading/PERP_ETH_USDC" />} />
          <Route path="/trading/:symbol" element={<Trading />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/trading/PERP_ETH_USDC" />} />
        </Routes>
      </Router>
    </OrderlyProvider>
  );
}

export default App;
