import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardPageWrapperProps {
  children: ReactNode;
  title: string;
  backHref?: string;
  showBackButton?: boolean;
}

const DashboardPageWrapper = ({ 
  children, 
  title, 
  backHref,
  showBackButton = true 
}: DashboardPageWrapperProps) => {
  const navigate = useNavigate();
  const { logout, role, isSuperAdmin } = useAuth();

  const handleBack = () => {
    if (backHref) {
      navigate(backHref);
    } else {
      // Navigate to appropriate dashboard based on role
      if (isSuperAdmin || role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate(-1);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="h-9 w-9"
            >
              <Store size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-destructive hover:text-destructive"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardPageWrapper;
