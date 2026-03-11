import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./AuthContext";

interface ImpersonatedUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  startImpersonation: (userId: string) => Promise<{ success: boolean; redirectPath: string }>;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error("useImpersonation must be used within an ImpersonationProvider");
  }
  return context;
};

const SESSION_KEY = "fanzon_impersonation";

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (impersonatedUser) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(impersonatedUser));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [impersonatedUser]);

  const startImpersonation = async (userId: string): Promise<{ success: boolean; redirectPath: string }> => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);

      if (!profileResult.data) {
        return { success: false, redirectPath: "/admin/dashboard" };
      }

      const role = (roleResult.data?.role as UserRole) || "customer";

      const user: ImpersonatedUser = {
        id: profileResult.data.id,
        full_name: profileResult.data.full_name || "Unknown",
        email: profileResult.data.email || "",
        phone_number: profileResult.data.phone_number,
        avatar_url: profileResult.data.avatar_url,
        role,
      };

      setImpersonatedUser(user);

      const redirectPath = role === "seller" 
        ? "/seller/dashboard" 
        : role === "support_agent" 
          ? "/agent/dashboard" 
          : "/account/profile";

      return { success: true, redirectPath };
    } catch (error) {
      console.error("Impersonation failed:", error);
      return { success: false, redirectPath: "/admin/dashboard" };
    }
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: !!impersonatedUser,
        impersonatedUser,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};
