import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

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

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, role, isLoading, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSeller, setIsSeller] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-based redirection - Admin/Seller go to their dashboards IMMEDIATELY
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      // Super Admin always goes to admin dashboard
      if (isSuperAdmin || role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "seller") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        // Customer goes to homepage
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, role, isLoading, isSuperAdmin, navigate]);

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
      let result;
      if (mode === "login") {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.name, formData.email, formData.password, isSeller);
      }

      if (result.success) {
        toast({
          title: mode === "login" ? "Welcome back!" : "Account created!",
          description: mode === "login" 
            ? "You have successfully logged in." 
            : isSeller 
              ? "Your seller account has been created. Welcome to FANZON!"
              : "Your account has been created successfully.",
        });
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
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
    setMode(mode === "login" ? "signup" : "login");
    setErrors({});
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setIsSeller(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary/30 to-background">
        <div className="text-3xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
            <span className="text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">FANZON</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pakistan's Premier Marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
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
                      "pl-10 h-12 text-base bg-muted/50 border-border focus:bg-background transition-colors touch-target",
                      errors.name && "border-destructive focus:ring-destructive"
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
                    "pl-10 h-12 text-base bg-muted/50 border-border focus:bg-background transition-colors touch-target",
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
                    "pl-10 pr-10 h-12 text-base bg-muted/50 border-border focus:bg-background transition-colors touch-target",
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
              <>
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
                        "pl-10 pr-10 h-12 text-base bg-muted/50 border-border focus:bg-background transition-colors touch-target",
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

                {/* Seller Registration */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <Checkbox
                    id="isSeller"
                    checked={isSeller}
                    onCheckedChange={(checked) => setIsSeller(checked === true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <Label htmlFor="isSeller" className="text-sm font-medium cursor-pointer">
                      Register as a Seller
                    </Label>
                  </div>
                </div>
                {isSeller && (
                  <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                    ✓ You'll be able to list products and manage orders on FANZON.
                  </p>
                )}
              </>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
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
                  {mode === "login" ? "Sign In" : "Create Account"}
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
              <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">Or</span>
            </div>
          </div>

          {/* Switch Mode */}
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

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to FANZON's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
