import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AdminAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Admin">
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default AdminAppShell;
