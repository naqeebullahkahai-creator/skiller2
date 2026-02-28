import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const CustomerAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Shopping">
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex flex-col">
          <MobileHeader />
          <main className="flex-1 pb-20">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default CustomerAppShell;
