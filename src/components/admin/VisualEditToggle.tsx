import { Edit3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVisualEdit } from "@/contexts/VisualEditContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const VisualEditToggle = () => {
  const { isAuthenticated, role, isSuperAdmin } = useAuth();
  const { isEditMode, toggleEditMode, canEdit } = useVisualEdit();

  // Only show for admin users who are authenticated
  if (!isAuthenticated || (!isSuperAdmin && role !== "admin")) return null;
  if (!canEdit) return null;

  return (
    <Button
      onClick={toggleEditMode}
      variant={isEditMode ? "default" : "outline"}
      size="sm"
      className={cn(
        "fixed bottom-20 right-4 z-50 shadow-lg transition-all duration-300",
        "flex items-center gap-2 rounded-full px-4",
        isEditMode && "bg-primary text-primary-foreground animate-pulse"
      )}
    >
      {isEditMode ? (
        <>
          <Eye size={16} />
          <span>Exit Edit</span>
        </>
      ) : (
        <>
          <Edit3 size={16} />
          <span>Edit Mode</span>
        </>
      )}
    </Button>
  );
};

export default VisualEditToggle;
