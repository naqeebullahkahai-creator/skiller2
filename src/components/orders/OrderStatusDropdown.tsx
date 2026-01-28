import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ShippingDialog from "./ShippingDialog";
import CancelOrderDialog from "./CancelOrderDialog";

interface OrderStatusDropdownProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  paymentStatus: string;
  totalAmount: number;
  role: "admin" | "seller";
  onStatusChange?: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    processing: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return styles[status] || styles.pending;
};

// Define allowed status transitions
const getNextStatuses = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };
  return transitions[currentStatus] || [];
};

const OrderStatusDropdown = ({
  orderId,
  orderNumber,
  currentStatus,
  paymentStatus,
  totalAmount,
  role,
  onStatusChange,
}: OrderStatusDropdownProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const allowedStatuses = getNextStatuses(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    // If changing to shipped, show the shipping dialog
    if (newStatus === "shipped") {
      setShippingDialogOpen(true);
      return;
    }

    // If changing to cancelled, show the cancel dialog
    if (newStatus === "cancelled") {
      setCancelDialogOpen(true);
      return;
    }

    await updateStatus(newStatus);
  };

  const updateStatus = async (newStatus: string, trackingInfo?: { tracking_id: string; courier_name: string }) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, unknown> = { order_status: newStatus };

      if (trackingInfo) {
        updateData.tracking_id = trackingInfo.tracking_id;
        updateData.courier_name = trackingInfo.courier_name;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });

      onStatusChange?.(newStatus);
    } catch (error: unknown) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShippingConfirm = async (trackingId: string, courierName: string) => {
    await updateStatus("shipped", {
      tracking_id: trackingId,
      courier_name: courierName,
    });
  };

  // If no transitions allowed, just show a badge
  if (allowedStatuses.length === 0) {
    return (
      <Badge className={cn("capitalize", getStatusBadgeStyle(currentStatus))}>
        {currentStatus}
      </Badge>
    );
  }

  return (
    <>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-40 h-9">
          <Badge className={cn("capitalize", getStatusBadgeStyle(currentStatus))}>
            {currentStatus}
          </Badge>
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          <SelectItem value={currentStatus} disabled>
            {currentStatus} (current)
          </SelectItem>
          {allowedStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Shipping Dialog */}
      <ShippingDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        orderId={orderId}
        orderNumber={orderNumber}
        onConfirm={handleShippingConfirm}
      />

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={orderId}
        orderNumber={orderNumber}
        orderStatus={currentStatus}
        paymentStatus={paymentStatus}
        totalAmount={totalAmount}
        role={role}
        onCancelled={() => onStatusChange?.("cancelled")}
      />
    </>
  );
};

export default OrderStatusDropdown;
