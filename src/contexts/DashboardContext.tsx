import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "seller";

interface DashboardContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentSellerId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // For demo purposes, seller1 is the current seller when in seller mode
  const currentSellerId = "seller1";

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
        currentSellerId,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
