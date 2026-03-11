import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

/**
 * Starts impersonation for a given user and redirects to their dashboard.
 * Works on both preview/localhost and production domains.
 */
const AdminViewAsPage = () => {
  const { userId } = useParams();
  const { isSuperAdmin, isLoading } = useAuth();
  const { startImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isLoading || !userId || hasStarted.current) return;

    if (!isSuperAdmin) {
      navigate("/forbidden", { replace: true });
      return;
    }

    hasStarted.current = true;

    startImpersonation(userId).then(({ success, redirectPath }) => {
      if (success) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/admin/users", { replace: true });
      }
    });
  }, [userId, isSuperAdmin, isLoading, startImpersonation, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-2xl font-bold text-primary tracking-tight mb-4">FANZON</div>
      <FanzonSpinner size="lg" />
      <p className="text-sm text-muted-foreground mt-4 animate-pulse">Opening user dashboard...</p>
    </div>
  );
};

export default AdminViewAsPage;
