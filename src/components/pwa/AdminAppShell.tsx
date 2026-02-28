import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppHeader from "./AppHeader";
import AdminBottomNav from "./AdminBottomNav";

const AdminAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Admin">
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <AppHeader title="Admin" subtitle="Platform management" />
          <main className="flex-1 pb-20">
            <Outlet />
          </main>
          <AdminBottomNav />
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default AdminAppShell;
