import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import FanzonLogo from "@/components/brand/FanzonLogo";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  const { profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-2xl border-b border-border/40 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <FanzonLogo size="sm" textClassName="text-foreground" />
          <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
            {title}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground active:scale-95 transition-all">
            <Bell size={20} />
          </button>
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive active:scale-95 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      {subtitle && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
