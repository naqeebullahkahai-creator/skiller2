import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Briefcase, Package, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Confetti from "@/components/ui/confetti";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If already authenticated as seller, can go to dashboard
    if (!isLoading && isAuthenticated && role === "seller") {
      // User is verified and authenticated
    }
  }, [isAuthenticated, role, isLoading]);

  const handleContinue = () => {
    if (isAuthenticated && role === "seller") {
      navigate("/seller/dashboard");
    } else {
      navigate("/business/login");
    }
  };

  return (
    <div className="min-h-screen bg-fanzon-dark flex safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fanzon-emerald rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Success Card */}
          <div className="bg-card rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-fanzon-emerald/20 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-fanzon-emerald" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Email Verified Successfully! 🎉
              </h1>
              <p className="text-muted-foreground">
                Welcome to FANZON Business Partner Program. Your account is now active!
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-secondary/50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
                What's Next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Complete KYC Verification</p>
                    <p className="text-xs text-muted-foreground">Submit your documents to start selling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-fanzon-emerald/20 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-fanzon-emerald" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Add Your Products</p>
                    <p className="text-xs text-muted-foreground">List items and set competitive prices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-fanzon-warning/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-fanzon-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Start Selling</p>
                    <p className="text-xs text-muted-foreground">Reach millions of customers nationwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full h-14 text-base font-semibold"
            >
              {isAuthenticated && role === "seller" ? (
                <>
                  Go to Seller Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Continue to Login
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Help Link */}
            <p className="text-xs text-muted-foreground mt-6">
              Need help getting started?{" "}
              <Link to="/help" className="text-primary hover:underline">
                Visit our Help Center
              </Link>
            </p>
          </div>

          {/* Logo */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">FANZON</span>
              <span className="text-xs text-primary font-medium">Business</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
