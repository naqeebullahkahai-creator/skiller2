import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "seller" | "customer" | "support_agent";

// Super Admin email - the only user allowed to access admin panel
export const SUPER_ADMIN_EMAIL = "alxteam001@gmail.com";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, isSeller?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: "login" | "signup";
  setAuthModalMode: (mode: "login" | "signup") => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const fetchUserData = async (userId: string, setLoadingFalse = false) => {
    try {
      // Fetch profile and role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);
      
      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (roleResult.data) {
        setRole(roleResult.data.role as UserRole);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      if (setLoadingFalse) {
        setIsLoading(false);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    let initialLoad = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer to avoid deadlock, but keep loading until role is fetched
          setTimeout(() => {
            fetchUserData(session.user.id, true);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialLoad) return;
      initialLoad = false;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Wait for role before setting isLoading=false
        fetchUserData(session.user.id, true);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setShowAuthModal(false);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    isSeller: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // For sellers, redirect to verification success page; for customers, redirect to home
      const redirectUrl = isSeller 
        ? `${window.location.origin}/business/verify-email-success`
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            is_seller: isSeller,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          return { success: false, error: "This email is already registered. Please login instead." };
        }
        return { success: false, error: error.message };
      }

      // Send welcome email via edge function (fire & forget)
      try {
        supabase.functions.invoke("send-order-emails", {
          body: {
            type: "welcome",
            customerEmail: email,
            customerName: name,
            isSeller: isSeller,
          },
        });
      } catch (e) {
        console.error("Welcome email failed:", e);
      }

      setShowAuthModal(false);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    // Import dynamically to avoid circular deps – toast is a standalone function
    const { toast } = await import("sonner");
    toast.success("Logged out. See you soon!");
  };

  // Check if current user is super admin
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAuthenticated: !!user,
        isLoading,
        isSuperAdmin,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
