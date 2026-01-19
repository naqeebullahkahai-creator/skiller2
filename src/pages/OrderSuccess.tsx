import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home, FileText } from "lucide-react";

const OrderSuccess = () => {
  const { orderNumber } = useParams();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-fanzon-success/10 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle size={48} className="text-fanzon-success" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for shopping with FANZON. Your order has been confirmed and will be processed shortly.
          </p>

          {/* Order Number */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
            <p className="text-2xl font-bold text-primary">{orderNumber || "FZ-00001"}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please save this number for tracking your order
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4">What happens next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Order Confirmation</p>
                  <p className="text-xs text-muted-foreground">
                    You'll receive an SMS with order details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Order Processing</p>
                  <p className="text-xs text-muted-foreground">
                    Seller will prepare your order for shipping
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Expected delivery within 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/my-orders">
                <FileText size={18} className="mr-2" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <Home size={18} className="mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
