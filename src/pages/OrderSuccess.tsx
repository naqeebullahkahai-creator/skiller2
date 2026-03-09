import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home, FileText, Truck, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const isMobile = useIsMobile();

  const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    const end = new Date();
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isMobile ? <MobileHeader /> : <Header />}

      <main className={cn(
        "flex-1",
        isMobile ? "px-4 py-6 pb-28" : "container mx-auto px-4 py-12"
      )}>
        <div className={cn("mx-auto text-center", isMobile ? "max-w-full" : "max-w-lg")}>
          {/* Success Animation */}
          <div className={cn("mb-6", isMobile && "mb-5")}>
            <div className={cn(
              "mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse",
              isMobile ? "w-20 h-20" : "w-24 h-24"
            )}>
              <CheckCircle size={isMobile ? 40 : 48} className="text-primary" />
            </div>
          </div>

          <h1 className={cn(
            "font-bold text-foreground mb-3",
            isMobile ? "text-xl" : "text-2xl md:text-3xl mb-4"
          )}>
            Order Placed Successfully! 🎉
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-sm mb-4" : "mb-6"
          )}>
            Thank you for shopping with FANZON. Your order has been confirmed.
          </p>

          {/* Order Details Card */}
          <div className={cn(
            "bg-card border border-border rounded-xl text-left",
            isMobile ? "p-4 mb-4" : "p-6 mb-6"
          )}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className={cn("font-bold text-primary", isMobile ? "text-lg" : "text-xl")}>
                    {orderNumber || "FZ-00001"}
                  </p>
                </div>
                <Package size={isMobile ? 28 : 32} className="text-primary" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold text-sm">{getEstimatedDelivery()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shipping</p>
                  <p className="font-semibold text-sm">Standard Delivery (3-5 days)</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className={cn(
            "bg-muted/50 rounded-xl text-left",
            isMobile ? "p-4 mb-6" : "p-6 mb-8"
          )}>
            <h2 className="font-semibold mb-3 text-sm">What happens next?</h2>
            <div className="space-y-3">
              {[
                { num: "1", title: "Order Confirmation", desc: "You'll receive an SMS with order details" },
                { num: "2", title: "Order Processing", desc: "Seller will prepare your order for shipping" },
                { num: "3", title: "Delivery", desc: "Expected delivery within 3-5 business days" },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className={cn("flex-1", isMobile && "h-12")}>
              <Link to="/account/orders">
                <FileText size={18} className="mr-2" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className={cn("flex-1", isMobile && "h-12")}>
              <Link to="/">
                <Home size={18} className="mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {!isMobile && <Footer />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default OrderSuccess;
