import { useNavigate } from "react-router-dom";
import { ShieldAlert, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/contexts/ImpersonationContext";

const ImpersonationBanner = () => {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();

  if (!isImpersonating || !impersonatedUser) return null;

  const handleExit = () => {
    stopImpersonation();
    navigate("/admin/users");
  };

  const roleLabelMap: Record<string, string> = {
    customer: "Customer",
    seller: "Seller",
    admin: "Admin",
    support_agent: "Agent",
  };

  return (
    <>
      {/* Spacer to push content below fixed banner */}
      <div className="h-10" />
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground">
        <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert size={16} />
            <span>Admin View Mode</span>
            <span className="mx-1">•</span>
            <User size={14} />
            <span className="font-bold">{impersonatedUser.full_name}</span>
            <span className="opacity-75">({roleLabelMap[impersonatedUser.role] || impersonatedUser.role})</span>
            <span className="opacity-75 hidden sm:inline">— {impersonatedUser.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-destructive-foreground hover:bg-destructive-foreground/20 gap-1"
          >
            <X size={14} />
            Exit View
          </Button>
        </div>
      </div>
    </>
  );
};

export default ImpersonationBanner;
