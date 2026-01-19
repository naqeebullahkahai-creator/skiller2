import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

const DashboardContent = () => {
  const { sidebarOpen } = useDashboard();

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DashboardLayout;
