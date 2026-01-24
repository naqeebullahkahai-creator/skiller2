import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface VisualEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const VisualEditContext = createContext<VisualEditContextType | undefined>(undefined);

// Safe hook that returns defaults when used outside provider
export const useVisualEdit = () => {
  const context = useContext(VisualEditContext);
  // Return safe defaults if context is not available
  if (!context) {
    return {
      isEditMode: false,
      toggleEditMode: () => {},
      canEdit: false,
    };
  }
  return context;
};

export const VisualEditProvider = ({ children }: { children: ReactNode }) => {
  const { isSuperAdmin, role } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  // Only super admin or admin role can edit
  const canEdit = isSuperAdmin || role === "admin";

  const toggleEditMode = () => {
    if (canEdit) {
      setIsEditMode((prev) => !prev);
    }
  };

  return (
    <VisualEditContext.Provider value={{ isEditMode, toggleEditMode, canEdit }}>
      {children}
    </VisualEditContext.Provider>
  );
};
