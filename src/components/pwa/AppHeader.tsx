import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-primary safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary-foreground">{title}</span>
            {subtitle && (
              <span className="text-[10px] text-primary-foreground/70">• {subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-black tracking-tight text-primary-foreground/80">
            FANZOON
          </span>
          <button
            onClick={() => logout()}
            className="p-2 text-primary-foreground/70 active:scale-95 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
