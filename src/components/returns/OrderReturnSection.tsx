import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { RotateCcw, Loader2, ChevronRight, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReturnRequestForm from "@/components/returns/ReturnRequestForm";
import ReturnStatusStepper from "@/components/returns/ReturnStatusStepper";
import { useCustomerReturns, RETURN_STATUS_LABELS, canRequestReturn } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface OrderReturnSectionProps {
  orderId: string;
  orderStatus: string;
  orderUpdatedAt: string;
  orderItems: Array<{
    id: string;
    order_id: string;
    product_id: string;
    seller_id: string;
    title: string;
    price_pkr: number;
    quantity: number;
    image_url?: string;
  }>;
}

const OrderReturnSection = ({
  orderId,
  orderStatus,
  orderUpdatedAt,
  orderItems,
}: OrderReturnSectionProps) => {
  const { returns, refetch } = useCustomerReturns();
  const [canReturn, setCanReturn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);

  // Check return eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      setIsChecking(true);
      const eligible = await canRequestReturn(orderId);
      setCanReturn(eligible);
      setIsChecking(false);
    };
    if (orderStatus === "delivered") {
      checkEligibility();
    } else {
      setIsChecking(false);
    }
  }, [orderId, orderStatus]);

  // Calculate days remaining for return
  const daysRemaining = orderStatus === "delivered"
    ? Math.max(0, 7 - differenceInDays(new Date(), new Date(orderUpdatedAt)))
    : 0;

  // Get existing returns for this order
  const orderReturns = returns.filter((r) => r.order_id === orderId);
  const returnedItemIds = new Set(orderReturns.map((r) => r.order_item_id));

  // Items that can still be returned
  const returnableItems = orderItems.filter((item) => !returnedItemIds.has(item.id));

  const handleStartReturn = (item: any) => {
    setSelectedItem(item);
    setShowReturnForm(true);
  };

  const handleReturnSuccess = () => {
    refetch();
    setShowReturnForm(false);
    setSelectedItem(null);
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show existing returns
  if (orderReturns.length > 0) {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <RotateCcw size={18} />
          Return Requests
        </h4>

        {orderReturns.map((returnReq) => (
          <div key={returnReq.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={returnReq.product_image || "/placeholder.svg"}
                alt=""
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{returnReq.product_title}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {returnReq.quantity} • Refund: {formatPKR(returnReq.refund_amount)}
                </p>
                <Badge
                  variant={returnReq.status === "refund_issued" ? "default" : "secondary"}
                  className="mt-1"
                >
                  {RETURN_STATUS_LABELS[returnReq.status] || returnReq.status}
                </Badge>
              </div>
            </div>

            {/* Status Stepper */}
            <ReturnStatusStepper currentStatus={returnReq.status} />

            {/* Seller/Admin responses */}
            {returnReq.seller_response && (
              <div className="bg-muted/50 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Seller Response:</p>
                <p className="text-sm">{returnReq.seller_response}</p>
              </div>
            )}
            {returnReq.admin_decision && (
              <div className="bg-primary/10 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Admin Decision:</p>
                <p className="text-sm">{returnReq.admin_decision}</p>
              </div>
            )}

            {/* Tracking info */}
            {returnReq.status === "approved" && (
              <div className="bg-fanzon-success/10 border border-fanzon-success/20 rounded p-3">
                <p className="text-sm font-medium text-fanzon-success">
                  Return approved! Please ship the item back to the seller.
                </p>
              </div>
            )}

            {returnReq.status === "refund_issued" && returnReq.refund_processed_at && (
              <div className="bg-fanzon-success/10 border border-fanzon-success/20 rounded p-3">
                <p className="text-sm font-medium text-fanzon-success">
                  Refund of {formatPKR(returnReq.refund_amount)} credited to your FANZON Wallet
                </p>
                <p className="text-xs text-muted-foreground">
                  Processed on {format(new Date(returnReq.refund_processed_at), "PPp")}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Show remaining returnable items */}
        {canReturn && returnableItems.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Other items you can return ({daysRemaining} days remaining):
            </p>
            {returnableItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm line-clamp-1">{item.title}</span>
                <Button size="sm" variant="outline" onClick={() => handleStartReturn(item)}>
                  Return
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Return form modal */}
        {selectedItem && (
          <ReturnRequestForm
            open={showReturnForm}
            onClose={() => setShowReturnForm(false)}
            orderItem={selectedItem}
            onSuccess={handleReturnSuccess}
          />
        )}
      </div>
    );
  }

  // No returns yet - show return option if eligible
  if (orderStatus === "delivered" && canReturn) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {daysRemaining} days left to request a return
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartReturn(item)}
                className="gap-1"
              >
                <RotateCcw size={14} />
                Return
              </Button>
            </div>
          ))}
        </div>

        {selectedItem && (
          <ReturnRequestForm
            open={showReturnForm}
            onClose={() => setShowReturnForm(false)}
            orderItem={selectedItem}
            onSuccess={handleReturnSuccess}
          />
        )}
      </div>
    );
  }

  // Not eligible for return
  if (orderStatus === "delivered") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Package size={16} />
        <span>Return period has expired (7 days after delivery)</span>
      </div>
    );
  }

  return null;
};

export default OrderReturnSection;
