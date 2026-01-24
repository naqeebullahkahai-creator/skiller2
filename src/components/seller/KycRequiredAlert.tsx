import { ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSellerKyc } from "@/hooks/useSellerKyc";

interface KycRequiredAlertProps {
  message?: string;
}

const KycRequiredAlert = ({ message }: KycRequiredAlertProps) => {
  const { isRejected, sellerProfile } = useSellerKyc();
  
  // For rejected status, show a more severe warning
  if (isRejected && sellerProfile) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-destructive">Account Restricted</h2>
            <p className="text-muted-foreground mb-4">
              Your seller verification was rejected. You cannot add products, manage inventory, or apply for flash sales until you complete verification.
            </p>
            {sellerProfile.rejection_reason && (
              <div className="w-full p-3 bg-destructive/10 rounded-lg mb-4 text-left">
                <p className="text-sm font-medium text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Rejection Reason:
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {sellerProfile.rejection_reason}
                </p>
              </div>
            )}
            <Button asChild variant="destructive">
              <Link to="/seller/kyc">Resubmit Verification</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">KYC Verification Required</h2>
          <p className="text-muted-foreground mb-6">
            {message ||
              "You need to complete your seller verification before you can access this feature. This helps us maintain a trusted marketplace."}
          </p>
          <Button asChild>
            <Link to="/seller/kyc">Complete Verification</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycRequiredAlert;
