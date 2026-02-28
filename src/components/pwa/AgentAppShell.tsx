import { Outlet } from "react-router-dom";
import MobileOnlyGuard from "./MobileOnlyGuard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppHeader from "./AppHeader";
import AgentBottomNav from "./AgentBottomNav";

const AgentAppShell = () => {
  return (
    <MobileOnlyGuard appName="FANZON Support">
      <ProtectedRoute allowedRoles={["support_agent"]}>
        <div className="min-h-screen bg-background flex flex-col">
          <AppHeader title="Agent" subtitle="Customer support" />
          <main className="flex-1 pb-20">
            <Outlet />
          </main>
          <AgentBottomNav />
        </div>
      </ProtectedRoute>
    </MobileOnlyGuard>
  );
};

export default AgentAppShell;
