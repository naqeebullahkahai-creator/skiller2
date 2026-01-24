import { ArrowLeft, Shield, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";

const BackToDashboardBar = () => {
  const navigate = useNavigate();
  const { role, isSuperAdmin } = useAuth();
  const { isCustomerView, disableCustomerView } = useViewMode();

  // Only show when admin/seller is in customer view mode
  if (!isCustomerView) return null;

  const isAdmin = isSuperAdmin || role === "admin";
  const isSeller = role === "seller";

  if (!isAdmin && !isSeller) return null;

  const handleBackToDashboard = () => {
    disableCustomerView();
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else if (isSeller) {
      navigate("/seller/dashboard");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-lg safe-area-top">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Shield size={18} />
          ) : (
            <Store size={18} />
          )}
          <span className="text-sm font-medium">
            {isAdmin ? "Viewing as Customer" : "Viewing Your Storefront"}
          </span>
        </div>
        <Button
          onClick={handleBackToDashboard}
          variant="secondary"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-semibold"
        >
          <ArrowLeft size={16} className="mr-1" />
          {isAdmin ? "Back to Admin Panel" : "Back to Dashboard"}
        </Button>
      </div>
    </div>
  );
};

export default BackToDashboardBar;
