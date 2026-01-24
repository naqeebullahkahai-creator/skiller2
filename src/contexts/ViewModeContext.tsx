import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface ViewModeContextType {
  isCustomerView: boolean;
  enableCustomerView: () => void;
  disableCustomerView: () => void;
  toggleCustomerView: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
};

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const { role, isSuperAdmin, isAuthenticated } = useAuth();
  const [isCustomerView, setIsCustomerView] = useState(false);

  // Reset view mode when user logs out or role changes
  useEffect(() => {
    if (!isAuthenticated) {
      setIsCustomerView(false);
    }
  }, [isAuthenticated]);

  const enableCustomerView = () => {
    if (role === "admin" || role === "seller" || isSuperAdmin) {
      setIsCustomerView(true);
      // Store in session for persistence during navigation
      sessionStorage.setItem("customerViewMode", "true");
    }
  };

  const disableCustomerView = () => {
    setIsCustomerView(false);
    sessionStorage.removeItem("customerViewMode");
  };

  const toggleCustomerView = () => {
    if (isCustomerView) {
      disableCustomerView();
    } else {
      enableCustomerView();
    }
  };

  // Restore view mode from session on mount
  useEffect(() => {
    const savedMode = sessionStorage.getItem("customerViewMode");
    if (savedMode === "true" && (role === "admin" || role === "seller" || isSuperAdmin)) {
      setIsCustomerView(true);
    }
  }, [role, isSuperAdmin]);

  return (
    <ViewModeContext.Provider
      value={{
        isCustomerView,
        enableCustomerView,
        disableCustomerView,
        toggleCustomerView,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};
