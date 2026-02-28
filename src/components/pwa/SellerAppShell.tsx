import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppHeader from "./AppHeader";
import SellerBottomNav from "./SellerBottomNav";

const SellerAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Seller Center">
      <ProtectedRoute allowedRoles={["seller"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <AppHeader title="Seller" subtitle="Manage your store" />
          <main className="flex-1 pb-20">
            <Outlet />
          </main>
          <SellerBottomNav />
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default SellerAppShell;
