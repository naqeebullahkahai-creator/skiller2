import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Check if there's an error in the URL (from Supabase redirect)
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (error) {
          setIsValidToken(false);
          toast({
            title: "Invalid or Expired Link",
            description: errorDescription || "This password reset link is no longer valid. Please request a new one.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [searchParams, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    try {
      passwordSchema.parse(formData);
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
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful! 🎉",
          description: "Your password has been updated. You can now login with your new password.",
        });
        
        // Sign out and redirect to login after 2 seconds
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate("/auth");
        }, 2000);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary/30 to-background">
        <div className="text-3xl font-bold text-primary tracking-tight mb-4">FANZON</div>
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Verifying reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Expired</h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Button onClick={() => navigate("/auth")} className="gap-2">
            Back to Login
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Your password has been successfully updated. Redirecting to login...
          </p>
          <FanzonSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">FANZON</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create New Password</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Reset Your Password</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
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

            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></span>
                  Updating Password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Update Password
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
