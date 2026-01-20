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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Loader2 } from "lucide-react";

interface ShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  onConfirm: (trackingId: string, courierName: string) => Promise<void>;
}

const COURIER_OPTIONS = [
  { value: "TCS", label: "TCS Express" },
  { value: "Leopards", label: "Leopards Courier" },
  { value: "TEZZ", label: "TEZZ Delivery" },
  { value: "Daewoo", label: "Daewoo Express" },
  { value: "M&P", label: "M&P Express" },
  { value: "Rider", label: "Bykea / Rider" },
  { value: "Other", label: "Other Courier" },
];

const ShippingDialog = ({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  onConfirm,
}: ShippingDialogProps) => {
  const [trackingId, setTrackingId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!trackingId.trim() || !courierName) return;

    setIsSubmitting(true);
    try {
      await onConfirm(trackingId.trim(), courierName);
      setTrackingId("");
      setCourierName("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Ship Order
          </DialogTitle>
          <DialogDescription>
            Enter the tracking details for order <strong>{orderNumber}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courier">Courier Service *</Label>
            <Select value={courierName} onValueChange={setCourierName}>
              <SelectTrigger id="courier">
                <SelectValue placeholder="Select courier service" />
              </SelectTrigger>
              <SelectContent>
                {COURIER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking ID / Consignment Number *</Label>
            <Input
              id="tracking"
              placeholder="e.g., TCS-123456789"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Customer will receive this tracking ID to track their package
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!trackingId.trim() || !courierName || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Mark as Shipped
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingDialog;
