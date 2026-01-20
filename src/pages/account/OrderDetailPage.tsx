import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  MapPin,
  CreditCard,
  ChevronLeft,
  CheckCircle,
  Circle,
  Clock,
  Star,
  Loader2,
  PackageCheck,
  Home,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateOrderInvoice } from "@/utils/generateOrderInvoice";

interface OrderItem {
  product_id: string;
  seller_id: string;
  title: string;
  price_pkr: number;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  order_number: string | null;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string;
  payment_method: string;
  total_amount_pkr: number;
  order_status: string;
  payment_status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  tracking_id: string | null;
  courier_name: string | null;
}

interface Review {
  product_id: string;
  rating: number;
  review_text: string;
}

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const statusColors: Record<string, string> = {
  pending: "text-orange-500",
  confirmed: "text-blue-500",
  processing: "text-orange-500",
  shipped: "text-indigo-500",
  delivered: "text-green-500",
  cancelled: "text-red-500",
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReviews, setExistingReviews] = useState<Record<string, boolean>>({});
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
      fetchExistingReviews();

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    ...payload.new,
                    items: (Array.isArray(payload.new.items) ? payload.new.items : prev.items) as OrderItem[],
                  }
                : null
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setOrder({
          ...data,
          items: (Array.isArray(data.items) ? data.items : []) as unknown as OrderItem[],
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingReviews = async () => {
    if (!user || !orderId) return;

    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("product_id")
        .eq("order_id", orderId)
        .eq("user_id", user.id);

      if (error) throw error;

      const reviewMap: Record<string, boolean> = {};
      (data || []).forEach((r) => {
        reviewMap[r.product_id] = true;
      });
      setExistingReviews(reviewMap);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleOpenReview = (product: OrderItem) => {
    setSelectedProduct(product);
    setRating(5);
    setReviewText("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !orderId || !selectedProduct) return;

    setIsSubmittingReview(true);

    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: selectedProduct.product_id,
        order_id: orderId,
        user_id: user.id,
        rating,
        review_text: reviewText || null,
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      setExistingReviews((prev) => ({ ...prev, [selectedProduct.product_id]: true }));
      setShowReviewModal(false);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.order_status === "cancelled") return -1;
    return ORDER_STEPS.findIndex((s) => s.key === order.order_status);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link to="/account/orders">Back to Orders</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.order_status === "cancelled";
  const isDelivered = order.order_status === "delivered";

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/account/orders">
              <ChevronLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {order.order_number || `Order #${order.id.slice(0, 8)}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString("en-PK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => generateOrderInvoice(order)}>
          <FileText className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* Tracking Info Card - Show when shipped */}
      {order.tracking_id && order.courier_name && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Shipment Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Courier: <span className="font-medium text-foreground">{order.courier_name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Tracking ID: <span className="font-medium text-foreground">{order.tracking_id}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck size={20} />
            Order Status
          </CardTitle>
          {isCancelled ? (
            <Badge variant="destructive">Order Cancelled</Badge>
          ) : (
            <CardDescription>
              {isDelivered ? "Your order has been delivered" : "Track your order progress"}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isCancelled ? (
            <div className="text-center py-4 text-destructive">
              <p>This order has been cancelled.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:flex items-center justify-between">
                {ORDER_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className="relative w-full flex items-center">
                        {index > 0 && (
                          <div
                            className={cn(
                              "absolute left-0 right-1/2 h-1 top-1/2 -translate-y-1/2 -z-10",
                              index <= currentStepIndex ? "bg-green-500" : "bg-muted"
                            )}
                          />
                        )}
                        {index < ORDER_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-1/2 right-0 h-1 top-1/2 -translate-y-1/2 -z-10",
                              index < currentStepIndex ? "bg-green-500" : "bg-muted"
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mx-auto z-10",
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <StepIcon size={24} />
                        </div>
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-sm font-medium",
                          isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-4">
                {ORDER_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <StepIcon size={20} />
                        </div>
                        {index < ORDER_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-8 mt-2",
                              index < currentStepIndex ? "bg-green-500" : "bg-muted"
                            )}
                          />
                        )}
                      </div>
                      <div className="pt-2">
                        <p
                          className={cn(
                            "font-medium",
                            isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Order Items ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <Link to={`/product/${item.product_id}`}>
                  <img
                    src={
                      item.image_url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
                    }
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="font-medium hover:text-primary line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatPKR(item.price_pkr)}
                  </p>
                  <p className="font-semibold text-primary mt-1">
                    {formatPKR(item.price_pkr * item.quantity)}
                  </p>

                  {/* Review Button for Delivered Orders */}
                  {isDelivered && !existingReviews[item.product_id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleOpenReview(item)}
                    >
                      <Star size={14} className="mr-2" />
                      Write a Review
                    </Button>
                  )}
                  {existingReviews[item.product_id] && (
                    <Badge variant="secondary" className="mt-2">
                      <CheckCircle size={12} className="mr-1" />
                      Reviewed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin size={18} />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.customer_name}</p>
            {order.customer_phone && (
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {order.shipping_address}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard size={18} />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPKR(order.total_amount_pkr)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <img
                  src={
                    selectedProduct.image_url ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
                  }
                  alt={selectedProduct.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium line-clamp-2">{selectedProduct.title}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        size={28}
                        className={cn(
                          star <= rating
                            ? "fill-fanzon-star text-fanzon-star"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <p className="text-sm font-medium mb-2">Your Review (Optional)</p>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailPage;
