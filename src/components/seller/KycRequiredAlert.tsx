import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface KycRequiredAlertProps {
  message?: string;
}

const KycRequiredAlert = ({ message }: KycRequiredAlertProps) => {
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
            <Link to="/seller-center/kyc">Complete Verification</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycRequiredAlert;
