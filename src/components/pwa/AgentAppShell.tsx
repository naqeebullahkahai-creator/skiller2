import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AgentAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Support">
      <ProtectedRoute allowedRoles={["support_agent"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default AgentAppShell;
