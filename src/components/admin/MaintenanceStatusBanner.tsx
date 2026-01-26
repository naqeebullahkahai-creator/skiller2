import { AlertTriangle } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";

const MaintenanceStatusBanner = () => {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();

  if (isLoading || !isMaintenanceMode) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground"></span>
      </span>
      <AlertTriangle size={16} />
      <span>System is currently OFFLINE to public</span>
    </div>
  );
};

export default MaintenanceStatusBanner;
