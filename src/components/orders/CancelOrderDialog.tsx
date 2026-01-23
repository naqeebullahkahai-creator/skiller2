import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Wallet } from "lucide-react";
import {
  useOrderCancellation,
  CUSTOMER_CANCELLATION_REASONS,
  SELLER_CANCELLATION_REASONS,
} from "@/hooks/useOrderCancellation";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  role: "customer" | "seller" | "admin";
  onCancelled?: () => void;
}

const CancelOrderDialog = ({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  orderStatus,
  paymentStatus,
  totalAmount,
  role,
  onCancelled,
}: CancelOrderDialogProps) => {
  const { cancelOrder, canCancelOrder, isLoading } = useOrderCancellation();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const { canCancel, message: statusMessage } = canCancelOrder(orderStatus);
  const reasons = role === "customer" ? CUSTOMER_CANCELLATION_REASONS : SELLER_CANCELLATION_REASONS;
  const isPrepaid = paymentStatus === "paid";

  const handleCancel = async () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    
    if (!reason.trim()) {
      return;
    }

    const result = await cancelOrder(orderId, reason, role);

    if (result.success) {
      onOpenChange(false);
      onCancelled?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            {role === "customer"
              ? `Are you sure you want to cancel order ${orderNumber}?`
              : `Cancel order ${orderNumber} for customer.`}
          </DialogDescription>
        </DialogHeader>

        {!canCancel ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Refund Info */}
            {isPrepaid && (
              <Alert className="border-primary/20 bg-primary/5">
                <Wallet className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <span className="font-medium">Refund:</span> Rs.{" "}
                  {totalAmount.toLocaleString()} will be credited to your FANZON
                  Wallet upon cancellation.
                </AlertDescription>
              </Alert>
            )}

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Cancellation</label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Reason */}
            {selectedReason === "Other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Please specify</label>
                <Textarea
                  placeholder="Enter your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {role === "seller" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  The customer will be notified about this cancellation with your reason.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Order
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading || !selectedReason || (selectedReason === "Other" && !customReason.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderDialog;
