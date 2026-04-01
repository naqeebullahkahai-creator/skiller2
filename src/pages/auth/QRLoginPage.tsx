import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRLoginSection from "@/components/auth/QRLoginSection";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const QRLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, role, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-fanzon-dark flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
          <ShoppingBag className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">FANZON</h1>
        <p className="text-primary mt-1 text-sm font-medium">QR Code Login</p>
      </div>

      {/* QR Card */}
      <div className="bg-card rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm">
        <QRLoginSection
          onLoginSuccess={() => navigate("/")}
          className="py-2"
        />
      </div>

      {/* Back to login */}
      <Button
        variant="ghost"
        className="mt-6 text-muted-foreground hover:text-white gap-2"
        onClick={() => navigate("/auth/login")}
      >
        <ArrowLeft size={16} />
        Back to Login
      </Button>
    </div>
  );
};

export default QRLoginPage;
