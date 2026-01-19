import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  ClipboardList,
  Loader2,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
];

const shippingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters").max(100),
  phoneNumber: z
    .string()
    .regex(/^(03[0-9]{9}|0[0-9]{10})$/, "Enter a valid Pakistan phone number (e.g., 03001234567)"),
  city: z.string().min(1, "Please select a city"),
  address: z.string().min(10, "Address must be at least 10 characters").max(500),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const PAYMENT_METHODS = [
  { id: "cod", name: "Cash on Delivery (COD)", description: "Pay when you receive your order" },
  { id: "easypaisa", name: "EasyPaisa / JazzCash", description: "Mobile wallet payment" },
  { id: "bank", name: "Bank Transfer", description: "Direct bank transfer" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, getSubtotal, getShippingFee, getCartTotal, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      city: "",
      address: "",
    },
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to proceed to checkout.</p>
          <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    navigate("/auth?redirect=/checkout");
    return null;
  }

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep(2);
  };

  const handlePaymentSubmit = () => {
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!shippingData || !user) return;

    setIsSubmitting(true);

    try {
      // Check stock availability for all items
      for (const item of items) {
        const { data: product, error } = await supabase
          .from("products")
          .select("stock_count")
          .eq("id", item.product.id)
          .single();

        if (error || !product) {
          throw new Error(`Product ${item.product.title} is no longer available.`);
        }

        if (product.stock_count < item.quantity) {
          throw new Error(
            `Only ${product.stock_count} units of ${item.product.title} available.`
          );
        }
      }

      // Create order items JSON for the orders table
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        seller_id: item.product.seller_id,
        title: item.product.title,
        price_pkr: item.product.discount_price_pkr || item.product.price_pkr,
        quantity: item.quantity,
        image_url: item.product.images?.[0] || null,
      }));

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_id: user.id,
          customer_name: shippingData.fullName,
          customer_phone: shippingData.phoneNumber,
          shipping_address: `${shippingData.address}, ${shippingData.city}`,
          payment_method: paymentMethod.toUpperCase(),
          total_amount_pkr: getCartTotal(),
          items: orderItems,
          order_status: "pending" as const,
          payment_status: "unpaid" as const,
        }])
        .select("id, order_number")
        .single();

      if (orderError) {
        throw orderError;
      }

      // Insert order items into order_items table
      const orderItemsToInsert = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        seller_id: item.product.seller_id,
        title: item.product.title,
        price_pkr: item.product.discount_price_pkr || item.product.price_pkr,
        quantity: item.quantity,
        image_url: item.product.images?.[0] || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error("Error inserting order items:", itemsError);
      }

      // Decrease stock for each product
      for (const item of items) {
        const { error: stockError } = await supabase.rpc("decrease_product_stock", {
          p_product_id: item.product.id,
          p_quantity: item.quantity,
        });

        if (stockError) {
          console.error("Error decreasing stock:", stockError);
        }
      }

      // Clear cart and navigate to success
      clearCart();
      navigate(`/order-success/${order.order_number}`);
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Shipping", icon: MapPin },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Review", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  step >= s.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.number ? (
                  <Check size={18} />
                ) : (
                  <s.icon size={18} />
                )}
                <span className="font-medium hidden sm:inline">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 md:w-16 h-0.5 mx-2",
                    step > s.number ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Information
                </h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleShippingSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="03001234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="House/Flat No., Street, Area, Landmark"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Continue to Payment
                      <ChevronRight size={18} className="ml-2" />
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Payment Method
                </h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronLeft size={18} className="mr-2" />
                    Back
                  </Button>
                  <Button onClick={handlePaymentSubmit} className="flex-1">
                    Review Order
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && shippingData && (
              <div className="space-y-4">
                {/* Shipping Summary */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Truck size={20} />
                      Shipping Details
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{shippingData.fullName}</p>
                    <p className="text-muted-foreground">{shippingData.phoneNumber}</p>
                    <p className="text-muted-foreground">
                      {shippingData.address}, {shippingData.city}
                    </p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Method
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm">
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList size={20} />
                    Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const price = item.product.discount_price_pkr || item.product.price_pkr;
                      const image =
                        item.product.images?.[0] ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100";
                      return (
                        <div key={item.product.id} className="flex gap-3">
                          <img
                            src={image}
                            alt={item.product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {item.product.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPKR(price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronLeft size={18} className="mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item) => {
                  const price = item.product.discount_price_pkr || item.product.price_pkr;
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                        {item.product.title} × {item.quantity}
                      </span>
                      <span>{formatPKR(price * item.quantity)}</span>
                    </div>
                  );
                })}
                {items.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPKR(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPKR(getShippingFee())}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPKR(getCartTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
