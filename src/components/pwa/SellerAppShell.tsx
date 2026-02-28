import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const SellerAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Seller Center">
      <ProtectedRoute allowedRoles={["seller"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default SellerAppShell;
