import { Link } from "react-router-dom";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
            <span className="text-3xl font-bold tracking-tight">FANZON</span>
          </Link>
        </div>

        {/* 403 Display */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-destructive/10 leading-none select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldX className="w-20 h-20 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Access Forbidden
          </h2>
          <p className="text-muted-foreground">
            رسائی ممنوع ہے
          </p>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this page.
            This area is restricted to authorized administrators only.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <p className="text-xs text-destructive">
            ⚠️ Unauthorized access attempts are logged and monitored.
          </p>
        </div>

        {/* Help */}
        <p className="text-xs text-muted-foreground">
          If you believe this is an error, please contact{" "}
          <a href="mailto:support@fanzon.pk" className="text-primary hover:underline">
            support@fanzon.pk
          </a>
        </p>
      </div>
    </div>
  );
};

export default Forbidden;
