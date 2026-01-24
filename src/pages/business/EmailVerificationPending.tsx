import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const EmailVerificationPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already verified
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        navigate("/business/verify-email-success", { replace: true });
      }
      setCheckingAuth(false);
    };
    checkAuth();

    // Listen for auth state changes (email verification)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        navigate("/business/verify-email-success", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/business/verify-email-success`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent!",
          description: "A new verification email has been sent to your inbox.",
        });
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-fanzon-dark flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fanzon-dark flex safe-area-top safe-area-bottom">
      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-fanzon-emerald rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">FANZON</span>
              <span className="block text-xs text-primary font-medium">Business Partner</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Almost There!<br />
            <span className="text-primary">Verify Your Email</span>
          </h1>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-md">
            We've sent a verification link to your email. Click it to activate your seller account.
          </p>

          {/* Steps indicator */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-medium">Account Created</p>
                <p className="text-muted-foreground text-sm">Your details have been saved</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-fanzon-warning/20 flex items-center justify-center animate-pulse">
                <Clock className="h-5 w-5 text-fanzon-warning" />
              </div>
              <div>
                <p className="text-white font-medium">Awaiting Verification</p>
                <p className="text-muted-foreground text-sm">Check your inbox for the link</p>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-white font-medium">Start Selling</p>
                <p className="text-muted-foreground text-sm">Complete KYC and list products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Card */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Check Your Email</h1>
            <p className="text-muted-foreground mt-1 text-sm">Verification link sent</p>
          </div>

          {/* Verification Card */}
          <div className="bg-card rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Email Icon Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-fanzon-warning rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Verify Your Email Address
              </h2>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to:
              </p>
              {email && (
                <p className="text-primary font-medium mt-2 break-all">{email}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-foreground mb-2">What to do:</h3>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Open your email inbox
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Look for email from FANZON
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  Click the verification link
                </li>
              </ol>
            </div>

            {/* Resend Button */}
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full h-12 mb-4"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            {/* Spam Notice */}
            <p className="text-xs text-muted-foreground text-center mb-6">
              Didn't receive the email? Check your spam folder or try resending.
            </p>

            {/* Back to Login */}
            <div className="border-t border-border pt-4">
              <Link to="/business/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Having trouble?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
