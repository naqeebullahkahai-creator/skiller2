import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/hooks/useProducts";
import { useUserAddresses, UserAddress, PROVINCES, CITIES_BY_PROVINCE, ADDRESS_LABELS } from "@/hooks/useAddresses";
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
  Plus,
  Home,
  Phone,
  User,
  Trash2,
  Building2,
  MoreHorizontal,
  Star,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  full_name: z.string().min(3, "Full name must be at least 3 characters").max(100),
  phone: z
    .string()
    .regex(/^03[0-9]{2}-?[0-9]{7}$/, "Enter a valid Pakistan phone number (e.g., 0300-1234567)"),
  province: z.string().min(1, "Please select a province"),
  city: z.string().min(1, "Please select a city"),
  area: z.string().optional(),
  full_address: z.string().min(10, "Address must be at least 10 characters").max(500),
  is_default: z.boolean().default(false),
  label: z.string().default("Home"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const PAYMENT_METHODS = [
  { id: "cod", name: "Cash on Delivery (COD)", description: "Pay when you receive your order", icon: "💵" },
  { id: "easypaisa", name: "EasyPaisa / JazzCash", description: "Mobile wallet payment", icon: "📱" },
  { id: "bank", name: "Bank Transfer", description: "Direct bank transfer", icon: "🏦" },
];

const SHIPPING_FEE = 150;

const getLabelIcon = (label: string) => {
  switch (label) {
    case "Office":
      return Building2;
    case "Other":
      return MoreHorizontal;
    default:
      return Home;
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { items, getSubtotal, getShippingFee, getCartTotal, clearCart } = useCart();
  const { addresses, isLoading: addressesLoading, addAddress, deleteAddress } = useUserAddresses();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      province: "",
      city: "",
      area: "",
      full_address: "",
      is_default: false,
      label: "Home",
    },
  });

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Show add address form if no addresses exist
  useEffect(() => {
    if (!addressesLoading && addresses.length === 0) {
      setShowAddressModal(true);
    }
  }, [addressesLoading, addresses]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

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

  const handleAddAddress = async (data: AddressFormData) => {
    const newAddress = await addAddress({
      full_name: data.full_name,
      phone: data.phone,
      province: data.province,
      city: data.city,
      area: data.area || "",
      full_address: data.full_address,
      is_default: data.is_default,
      label: data.label,
    });
    if (newAddress) {
      setSelectedAddressId(newAddress.id);
      setShowAddressModal(false);
      form.reset();
      setSelectedProvince("");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
    if (selectedAddressId === id) {
      setSelectedAddressId(addresses.find((a) => a.id !== id)?.id || null);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      toast({
        title: "Please select an address",
        description: "You need to select or add a delivery address.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) return;

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
          customer_name: selectedAddress.full_name,
          customer_phone: selectedAddress.phone,
          shipping_address: `${selectedAddress.full_address}, ${selectedAddress.area ? selectedAddress.area + ", " : ""}${selectedAddress.city}, ${selectedAddress.province}`,
          address_id: selectedAddress.id,
          payment_method: paymentMethod.toUpperCase(),
          total_amount_pkr: getCartTotal(),
          items: orderItems,
          order_status: "pending" as const,
          payment_status: "unpaid" as const,
          delivery_instructions: deliveryInstructions || null,
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

      // Send order confirmation email to customer
      try {
        await supabase.functions.invoke("send-order-emails", {
          body: {
            type: "new_order",
            customerEmail: user.email,
            customerName: selectedAddress.full_name,
            orderNumber: order.order_number,
            totalAmount: getCartTotal(),
            itemCount: items.length,
          },
        });
      } catch (emailErr) {
        console.error("Failed to send order email:", emailErr);
      }

      // Send seller alert emails for each unique seller
      const sellerIds = [...new Set(items.map((i) => i.product.seller_id))];
      for (const sellerId of sellerIds) {
        try {
          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", sellerId)
            .single();

          if (sellerProfile) {
            const sellerItems = items.filter((i) => i.product.seller_id === sellerId);
            await supabase.functions.invoke("send-order-emails", {
              body: {
                type: "order_seller_alert",
                sellerEmail: sellerProfile.email,
                sellerName: sellerProfile.full_name,
                orderNumber: order.order_number,
                productTitle: sellerItems.map((i) => i.product.title).join(", "),
                quantity: sellerItems.reduce((sum, i) => sum + i.quantity, 0),
                orderAmount: sellerItems.reduce((sum, i) => sum + (i.product.discount_price_pkr || i.product.price_pkr) * i.quantity, 0),
              },
            });
          }
        } catch (sellerEmailErr) {
          console.error("Failed to send seller alert:", sellerEmailErr);
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

  // Get estimated delivery date (3-5 days from now)
  const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString("en-PK", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-PK", { month: "short", day: "numeric" })}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6 overflow-x-hidden">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <button
                onClick={() => s.number < step && setStep(s.number)}
                disabled={s.number > step}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  step >= s.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  s.number < step && "cursor-pointer hover:bg-primary/80"
                )}
              >
                {step > s.number ? (
                  <Check size={18} />
                ) : (
                  <s.icon size={18} />
                )}
                <span className="font-medium hidden sm:inline">{s.title}</span>
              </button>
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
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin size={20} />
                      Select Delivery Address
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add New
                    </Button>
                  </div>

                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <Home size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No saved addresses yet</p>
                      <Button onClick={() => setShowAddressModal(true)}>
                        <Plus size={16} className="mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedAddressId || ""}
                      onValueChange={setSelectedAddressId}
                      className="space-y-3"
                    >
                      {addresses.map((address) => {
                        const LabelIcon = getLabelIcon(address.label || "Home");
                        return (
                          <div
                            key={address.id}
                            className={cn(
                              "relative flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                              selectedAddressId === address.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border hover:border-muted-foreground"
                            )}
                          >
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={cn(
                                  "p-1 rounded",
                                  selectedAddressId === address.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                  <LabelIcon size={12} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                  {address.label || "Home"}
                                </span>
                                {address.is_default && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star size={10} />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold">{address.full_name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone size={12} />
                                {address.phone}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {address.full_address}
                                {address.area && `, ${address.area}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.province}
                              </p>
                            </Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </div>

                {/* Delivery Instructions */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <MessageSquare size={16} />
                    Delivery Instructions (Optional)
                  </h3>
                  <Textarea
                    placeholder="e.g., Ghar ki bell kharab hai, Please deliver after 2 PM, Leave at the door..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Add any special instructions for the delivery person
                  </p>
                </div>

                {/* Selected Address Summary */}
                {selectedAddress && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">Deliver to:</p>
                    <p className="text-sm">
                      <span className="font-semibold">{selectedAddress.full_name}</span>, {selectedAddress.full_address}
                      {selectedAddress.area && `, ${selectedAddress.area}`}, {selectedAddress.city}, {selectedAddress.province}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated Delivery: {getEstimatedDelivery()}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleContinueToPayment}
                  disabled={!selectedAddressId}
                  className="w-full"
                >
                  Continue to Payment
                  <ChevronRight size={18} className="ml-2" />
                </Button>
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
                      <span className="text-2xl">{method.icon}</span>
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
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Review Order
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && selectedAddress && (
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
                    <p className="font-medium flex items-center gap-2">
                      <User size={14} />
                      {selectedAddress.full_name}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone size={14} />
                      {selectedAddress.phone}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedAddress.full_address}
                      {selectedAddress.area && `, ${selectedAddress.area}`}, {selectedAddress.city}, {selectedAddress.province}
                    </p>
                  </div>
                  {deliveryInstructions && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Instructions:</p>
                      <p className="text-sm italic">"{deliveryInstructions}"</p>
                    </div>
                  )}
                  <p className="text-xs text-primary mt-3">
                    📦 Estimated Delivery: {getEstimatedDelivery()}
                  </p>
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon}
                    </span>
                    <p className="text-sm font-medium">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                    </p>
                  </div>
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
                              Qty: {item.quantity} × {formatPKR(price)}
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
                  <span>{formatPKR(SHIPPING_FEE)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPKR(getCartTotal())}</span>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedAddress && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Deliver to:</p>
                  <p className="text-sm font-medium">{selectedAddress.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAddress.city}, {selectedAddress.province}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Add New Address
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAddress)} className="space-y-4">
              {/* Address Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Label</FormLabel>
                    <div className="flex gap-2">
                      {ADDRESS_LABELS.map((label) => {
                        const Icon = getLabelIcon(label);
                        return (
                          <Button
                            key={label}
                            type="button"
                            variant={field.value === label ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => field.onChange(label)}
                          >
                            <Icon size={14} className="mr-1" />
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipient's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0300-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedProvince(value);
                        form.setValue("city", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedProvince}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(CITIES_BY_PROVINCE[selectedProvince] || []).map((city) => (
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
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area / Sector (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DHA Phase 5, Gulberg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House/Flat No., Street, Landmark"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default address</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Address
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Checkout;
