import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";

const trackSchema = z.object({
  orderNumber: z.string().min(1, "Please enter your order number"),
  email: z.string().email("Please enter a valid email"),
});

type TrackFormData = z.infer<typeof trackSchema>;

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

interface OrderResult {
  order_number: string;
  order_status: string;
  payment_method: string;
  total_amount_pkr: number;
  created_at: string;
  shipped_at: string | null;
  tracking_id: string | null;
  courier_name: string | null;
}

const TrackOrder = () => {
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderNumber: "", email: "" },
  });

  const onSubmit = async (data: TrackFormData) => {
    setIsSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      // Look up order by order_number — we verify email via profiles join
      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_number, order_status, payment_method, total_amount_pkr, created_at, shipped_at, tracking_id, courier_name, customer_id")
        .eq("order_number", data.orderNumber.trim().toUpperCase())
        .limit(1);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        setNotFound(true);
        return;
      }

      const order = orders[0];

      // Verify email matches profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", order.customer_id)
        .single();

      if (!profile || profile.email.toLowerCase() !== data.email.toLowerCase()) {
        setNotFound(true);
        return;
      }

      setResult({
        order_number: order.order_number!,
        order_status: order.order_status,
        payment_method: order.payment_method,
        total_amount_pkr: order.total_amount_pkr,
        created_at: order.created_at,
        shipped_at: order.shipped_at,
        tracking_id: order.tracking_id,
        courier_name: order.courier_name,
      });
    } catch (err) {
      console.error("Track order error:", err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const currentStep = result ? statusIndex[result.order_status] ?? -1 : -1;
  const isCancelled = result?.order_status === "cancelled";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Track Your Order | FANZON"
        description="Track your FANZON order status in real-time using your order number."
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">
            Enter your order number and email to see the current status.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FZN-ORD-1001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your registered email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSearching}>
                  {isSearching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" /> Track Order</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {notFound && (
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Order Not Found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Please check your order number and email address and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="text-lg font-bold text-primary">{result.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">
                    PKR {result.total_amount_pkr.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Placed on {new Date(result.created_at).toLocaleDateString("en-PK", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>

              {isCancelled ? (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground">This order has been cancelled.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {statusSteps.map((step, i) => {
                    const isComplete = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              isComplete
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div
                              className={cn(
                                "w-0.5 h-6",
                                i < currentStep ? "bg-primary" : "bg-muted"
                              )}
                            />
                          )}
                        </div>
                        <div className={cn("pb-4", isCurrent && "font-semibold")}>
                          <p className={cn(
                            "text-sm",
                            isComplete ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                          </p>
                          {isCurrent && step.key === "shipped" && result.tracking_id && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {result.courier_name}: {result.tracking_id}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.tracking_id && result.courier_name && !isCancelled && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium">Tracking Information</p>
                  <p className="text-sm text-muted-foreground">
                    {result.courier_name}: {result.tracking_id}
                  </p>
                </div>
              )}

              {/* QR Code for this order */}
              <div className="flex items-center justify-center pt-2">
                <QRCodeDisplay
                  url={`/track-order?order=${result.order_number}`}
                  title={`Order ${result.order_number}`}
                  subtitle="Share this QR code to track your order"
                  triggerVariant="button"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TrackOrder;
