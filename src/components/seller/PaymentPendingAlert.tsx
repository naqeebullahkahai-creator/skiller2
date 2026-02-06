import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet } from "lucide-react";
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { formatPKR } from "@/hooks/useSellerWallet";
import { Link } from "react-router-dom";

const PaymentPendingAlert = () => {
  const { hasPaymentPending, pendingAmount, subscription } = useSellerSubscription();

  if (!hasPaymentPending) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Payment Pending</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>
          Your platform fee of <strong>{formatPKR(pendingAmount)}</strong> could not be deducted 
          due to insufficient wallet balance. Please add funds to continue using the platform.
        </span>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/seller-center/wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Go to Wallet
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PaymentPendingAlert;
