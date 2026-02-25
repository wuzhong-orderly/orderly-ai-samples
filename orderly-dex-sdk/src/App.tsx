import { RouterProvider } from "react-router";
import { OrderlyProvider } from "./components/orderlyProvider";
import { router } from "./routes";
import "./styles/index.css";

/**
 * Main App Component
 * Wraps entire application with Orderly providers and router
 */
function App() {
  return (
    <OrderlyProvider>
      <RouterProvider router={router} />
    </OrderlyProvider>
  );
}

export default App;
