import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateReturnRequest, RETURN_REASONS, uploadReturnPhoto } from "@/hooks/useReturns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ReturnRequestFormProps {
  open: boolean;
  onClose: () => void;
  orderItem: {
    id: string;
    order_id: string;
    seller_id: string;
    product_id: string;
    title: string;
    price_pkr: number;
    quantity: number;
    image_url?: string;
  };
  onSuccess?: () => void;
}

const ReturnRequestForm = ({ open, onClose, orderItem, onSuccess }: ReturnRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createReturn, isLoading } = useCreateReturnRequest();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length && photos.length + uploadedUrls.length < 5; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const url = await uploadReturnPhoto(file, user.id);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Select a reason",
        description: "Please select a reason for return",
        variant: "destructive",
      });
      return;
    }

    const success = await createReturn({
      order_id: orderItem.order_id,
      order_item_id: orderItem.id,
      seller_id: orderItem.seller_id,
      product_id: orderItem.product_id,
      reason,
      additional_comments: comments || undefined,
      photos,
      refund_amount: orderItem.price_pkr * orderItem.quantity,
      quantity: orderItem.quantity,
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Return</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-muted rounded-lg">
            <img
              src={orderItem.image_url || "/placeholder.svg"}
              alt={orderItem.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-2">{orderItem.title}</p>
              <p className="text-sm text-muted-foreground">Qty: {orderItem.quantity}</p>
              <p className="text-primary font-semibold">
                Refund: Rs. {(orderItem.price_pkr * orderItem.quantity).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for Return *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Upload Photos (Max 5)</Label>
            <p className="text-xs text-muted-foreground">
              Add photos showing the issue with the product
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-16 h-16">
                  <img src={photo} alt="" className="w-full h-full object-cover rounded" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center hover:border-primary"
                >
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  ) : (
                    <Upload size={20} className="text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label>Additional Comments</Label>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !reason} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestForm;
