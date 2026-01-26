import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { supabase } from "@/integrations/supabase/client";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const CustomerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, role, isLoading, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const isLoginMode = location.pathname === "/auth/login";
  const [mode, setMode] = useState<"login" | "signup">(isLoginMode ? "login" : "signup");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    setMode(location.pathname === "/auth/login" ? "login" : "signup");
    setErrors({});
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      if (isSuperAdmin || role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "seller") {
        toast({
          title: "Redirecting to Seller Portal",
          description: "You have a seller account. Redirecting to your dashboard.",
        });
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, role, isLoading, isSuperAdmin, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    try {
      if (mode === "login") {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } else {
        signupSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
            .maybeSingle();
          
          if (roleData?.role === "seller") {
            return;
          }
          
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const result = await signup(formData.name, formData.email, formData.password, false);
        
        if (result.success) {
          toast({
            title: "Account created!",
            description: "Welcome to FANZON! Start shopping now.",
          });
          setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    navigate(mode === "login" ? "/auth/signup" : "/auth/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-3xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 via-background to-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="/fanzon-icon-512.png" 
            alt="FANZON" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg shadow-primary/25"
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">FANZON</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pakistan's Premier Marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-secondary text-foreground px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <ShoppingBag className="h-3 w-3" />
              Customer Portal
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login" 
                ? "Sign in to continue shopping" 
                : "Join FANZON today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={cn(
                      "pl-10 h-12 text-base bg-secondary border-border focus:border-primary transition-colors touch-target",
                      errors.name && "border-destructive"
                    )}
                  />
                </div>
                {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 h-12 text-base bg-secondary border-border focus:border-primary transition-colors touch-target",
                    errors.email && "border-destructive"
                  )}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 pr-10 h-12 text-base bg-secondary border-border focus:border-primary transition-colors touch-target",
                    errors.password && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      "pl-10 pr-10 h-12 text-base bg-secondary border-border focus:border-primary transition-colors touch-target",
                      errors.confirmPassword && "border-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></span>
                  Please wait...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">Or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        {/* Seller Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground mb-2">
            Want to sell on FANZON?
          </p>
          <Link
            to="/business/signup"
            className="text-sm text-primary font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            Become a Partner
            <ArrowRight size={14} />
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to FANZON's Terms of Service and Privacy Policy
        </p>
      </div>

      <ForgotPasswordModal 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword}
        userType="customer"
      />
    </div>
  );
};

export default CustomerAuth;
