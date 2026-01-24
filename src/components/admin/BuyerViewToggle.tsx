import { Eye, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";

interface BuyerViewToggleProps {
  className?: string;
  variant?: "button" | "link";
}

const BuyerViewToggle = ({ className, variant = "button" }: BuyerViewToggleProps) => {
  const navigate = useNavigate();
  const { isSuperAdmin, role } = useAuth();
  const { isCustomerView, enableCustomerView, disableCustomerView } = useViewMode();

  // Only show for admins and sellers
  if (!isSuperAdmin && role !== "admin" && role !== "seller") return null;

  const handleToggle = () => {
    if (isCustomerView) {
      disableCustomerView();
      // Navigate back to appropriate dashboard
      if (isSuperAdmin || role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "seller") {
        navigate("/seller/dashboard");
      }
    } else {
      enableCustomerView();
      navigate("/");
    }
  };

  const isAdmin = isSuperAdmin || role === "admin";
  const label = isCustomerView 
    ? (isAdmin ? "Back to Admin" : "Back to Dashboard")
    : (isAdmin ? "View as Customer" : "View My Store");

  if (variant === "link") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isCustomerView 
            ? "bg-primary/10 text-primary hover:bg-primary/20" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
      >
        {isCustomerView ? (
          <ShoppingBag size={18} />
        ) : (
          <Eye size={18} />
        )}
        {label}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 transition-all duration-300",
        isCustomerView && "bg-primary/10 border-primary/30 text-primary",
        className
      )}
    >
      {isCustomerView ? (
        <>
          <ShoppingBag size={16} />
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        <>
          <Eye size={16} />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </Button>
  );
};

export default BuyerViewToggle;
