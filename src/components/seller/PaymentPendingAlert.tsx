import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet, Ban } from "lucide-react";
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { formatPKR } from "@/hooks/useSellerWallet";
import { Link } from "react-router-dom";

const PaymentPendingAlert = () => {
  const { hasPaymentPending, pendingAmount, isSuspended } = useSellerSubscription();

  if (!hasPaymentPending && !isSuspended) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      {isSuspended ? <Ban className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle>{isSuspended ? 'Account Suspended' : 'Payment Pending'}</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>
          {isSuspended 
            ? `Your account is suspended. Pending fees: ${formatPKR(pendingAmount)}. Products are hidden.`
            : `Platform fee of ${formatPKR(pendingAmount)} could not be deducted. Please add funds.`
          }
        </span>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/seller/wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Go to Wallet
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PaymentPendingAlert;
