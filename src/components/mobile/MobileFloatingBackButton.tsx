import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Pages where back button should NOT show
const hideOnRoutes = ["/", "/account", "/admin/dashboard", "/seller/dashboard", "/agent/dashboard", "/agent-app"];

const MobileFloatingBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  // Don't show on root/dashboard pages
  const shouldHide = hideOnRoutes.some(
    (r) => location.pathname === r || location.pathname === r + "/"
  );
  if (shouldHide) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-[62px] left-2 z-[45] w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center active:scale-90 transition-all"
      aria-label="Go back"
    >
      <ChevronLeft size={20} className="text-foreground" />
    </button>
  );
};

export default MobileFloatingBackButton;
