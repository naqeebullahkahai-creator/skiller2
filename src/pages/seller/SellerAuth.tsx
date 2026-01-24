import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, TrendingUp, ShieldCheck, Wallet, Package, AlertCircle } from "lucide-react";
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

const SellerAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, role, isLoading, isSuperAdmin, user } = useAuth();
  const { toast } = useToast();
  
  // Determine mode from URL
  const isLoginMode = location.pathname === "/seller/login";
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
  const [showLoggedInWarning, setShowLoggedInWarning] = useState(false);

  // Update mode when URL changes
  useEffect(() => {
    setMode(location.pathname === "/seller/login" ? "login" : "signup");
    setErrors({});
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  }, [location.pathname]);

  // Check if customer is already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "customer") {
      setShowLoggedInWarning(true);
    }
  }, [isAuthenticated, role, isLoading]);

  // Role-based redirection
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      if (isSuperAdmin || role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "seller") {
        navigate("/seller/dashboard", { replace: true });
      }
      // Customer case is handled by the warning modal
    }
  }, [isAuthenticated, role, isLoading, isSuperAdmin, navigate]);

  const handleLogoutAndContinue = async () => {
    await supabase.auth.signOut();
    setShowLoggedInWarning(false);
    toast({
      title: "Logged Out",
      description: "You can now sign up or log in as a seller.",
    });
  };

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
        // First, check if user is a seller before attempting login
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // After successful login, verify the role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
            .maybeSingle();
          
          if (roleData?.role !== "seller" && roleData?.role !== "admin") {
            // Not a seller - sign out and show error
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "This account is not a Seller account. Please use the Customer Login.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          
          toast({
            title: "Welcome back, Seller!",
            description: "You have successfully logged in to your Seller account.",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Signup - always as seller (isSeller = true)
        const result = await signup(formData.name, formData.email, formData.password, true);
        
        if (result.success) {
          toast({
            title: "Seller Account Created! 🎉",
            description: "Welcome to FANZON! Your seller account has been created. Start listing your products.",
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
    if (mode === "login") {
      navigate("/seller/signup");
    } else {
      navigate("/seller/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-3xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-slate-400 mt-4 animate-pulse">Loading...</p>
      </div>
    );
  }

  // Show warning if customer is logged in
  if (showLoggedInWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Already Logged In</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You are currently logged in as a Customer ({user?.email}). 
              Please logout to access the Seller Portal.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleLogoutAndContinue}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Logout & Continue to Seller Portal
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Back to Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex safe-area-top safe-area-bottom">
      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-2xl font-bold text-white">FANZON</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Grow Your Business<br />
            <span className="text-primary">with FANZON</span>
          </h1>
          
          <p className="text-slate-300 text-lg mb-10 max-w-md">
            Join Pakistan's fastest-growing marketplace and reach millions of customers nationwide.
          </p>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <TrendingUp className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-white font-semibold mb-1">Grow Sales</h3>
              <p className="text-slate-400 text-sm">Access millions of active buyers</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <ShieldCheck className="h-8 w-8 text-emerald-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Secure Payments</h3>
              <p className="text-slate-400 text-sm">Guaranteed payment protection</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Wallet className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Easy Withdrawals</h3>
              <p className="text-slate-400 text-sm">Direct bank transfers</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Package className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Free Listings</h3>
              <p className="text-slate-400 text-sm">No upfront costs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">FANZON</h1>
            <p className="text-primary mt-1 text-sm font-medium">Seller Center</p>
            <p className="text-slate-400 mt-2 text-sm">Grow Your Business with FANZON</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
                <Building2 className="h-3 w-3" />
                Business Partner Portal
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === "login" ? "Seller Login" : "Become a Seller"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "login" 
                  ? "Access your seller dashboard" 
                  : "Start selling on Pakistan's #1 marketplace"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name / Business Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name or Business Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 h-12 text-base bg-muted/50 border-border focus:bg-background focus:border-primary transition-colors touch-target",
                        errors.name && "border-destructive focus:ring-destructive"
                      )}
                    />
                  </div>
                  {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="seller@business.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={cn(
                      "pl-10 h-12 text-base bg-muted/50 border-border focus:bg-background focus:border-primary transition-colors touch-target",
                      errors.email && "border-destructive focus:ring-destructive"
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
                      "pl-10 pr-10 h-12 text-base bg-muted/50 border-border focus:bg-background focus:border-primary transition-colors touch-target",
                      errors.password && "border-destructive focus:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 touch-target"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                        "pl-10 pr-10 h-12 text-base bg-muted/50 border-border focus:bg-background focus:border-primary transition-colors touch-target",
                        errors.confirmPassword && "border-destructive focus:ring-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 touch-target"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all touch-target"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></span>
                    Please wait...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" ? "Sign In as Seller" : "Create Seller Account"}
                    <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-muted-foreground uppercase tracking-wider">Or</span>
              </div>
            </div>

            {/* Switch Mode */}
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to selling on FANZON?" : "Already have a seller account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {mode === "login" ? "Register Now" : "Sign In"}
              </button>
            </p>
          </div>

          {/* Customer Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400 mb-2">
              Looking to shop instead?
            </p>
            <Link
              to="/auth"
              className="text-sm text-primary font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              Go to Customer Login
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-4">
            By continuing, you agree to FANZON's Seller Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword}
        userType="seller"
      />
    </div>
  );
};

export default SellerAuth;
