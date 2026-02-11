import { Outlet } from "react-router-dom";
import OrderlyProvider from "@/components/OrderlyProvider";

export default function App() {
  return (
    <OrderlyProvider>
      <Outlet />
    </OrderlyProvider>
  );
}
