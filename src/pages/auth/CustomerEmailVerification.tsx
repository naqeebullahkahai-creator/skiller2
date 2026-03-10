import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CustomerEmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Listen for auth state changes (email verification)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    });

    // Also poll every 5 seconds
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => navigate("/", { replace: true }), 2000);
        clearInterval(interval);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [navigate]);

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
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email Sent!", description: "A new verification email has been sent." });
        setResendCooldown(60);
      }
    } catch {
      toast({ title: "Error", description: "Failed to resend email.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-fanzon-dark flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Email Verified! ✅</h2>
          <p className="text-muted-foreground text-sm">Your account has been verified. Redirecting to store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fanzon-dark flex safe-area-top safe-area-bottom">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-fanzon-emerald rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">FANZON</span>
              <span className="block text-xs text-primary font-medium">Verify Your Email</span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Almost There!<br />
            <span className="text-primary">Check Your Inbox</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            We've sent a verification link to your email. Click it to activate your account and start shopping.
          </p>

          <div className="mt-10 space-y-4">
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
                <p className="text-muted-foreground text-sm">Check your inbox</p>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-white font-medium">Start Shopping</p>
                <p className="text-muted-foreground text-sm">Browse millions of products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
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

          <div className="bg-card rounded-2xl shadow-2xl p-6 sm:p-8">
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
              <h2 className="text-xl font-semibold text-foreground mb-2">Verify Your Email Address</h2>
              <p className="text-muted-foreground text-sm">We've sent a verification link to:</p>
              {email && <p className="text-primary font-medium mt-2 break-all">{email}</p>}
            </div>

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

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4 text-center">
              <p className="text-xs text-primary font-medium">⏳ This page auto-updates when your email is verified</p>
            </div>

            <Button onClick={handleResendEmail} disabled={isResending || resendCooldown > 0} variant="outline" className="w-full h-12 mb-4">
              {isResending ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : resendCooldown > 0 ? (
                <><Clock className="h-4 w-4 mr-2" />Resend in {resendCooldown}s</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" />Resend Verification Email</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mb-6">
              Didn't receive? Check your spam folder or try resending.
            </p>

            <div className="border-t border-border pt-4">
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerEmailVerification;
