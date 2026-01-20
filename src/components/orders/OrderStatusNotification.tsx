import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusMessages: Record<string, string> = {
  pending: "Your order has been placed and is awaiting confirmation.",
  confirmed: "Great news! Your order has been confirmed.",
  processing: "Your order is being processed and prepared for shipping.",
  shipped: "Your order has been shipped and is on its way!",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "Your order has been cancelled.",
};

interface OrderStatusNotificationProps {
  children: React.ReactNode;
}

const OrderStatusNotification = ({ children }: OrderStatusNotificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [emailDetails, setEmailDetails] = useState<{
    orderNumber: string;
    status: string;
    trackingId?: string;
    courierName?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("order-status-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          const oldStatus = (payload.old as any)?.order_status;
          const newStatus = payload.new.order_status as string;
          
          // Only show notification if status actually changed
          if (oldStatus !== newStatus) {
            const Icon = statusIcons[newStatus] || Package;
            
            // Show toast notification
            toast({
              title: `Order ${payload.new.order_number || "Update"}`,
              description: statusMessages[newStatus] || `Status changed to ${newStatus}`,
            });

            // Show simulated email notification
            setEmailDetails({
              orderNumber: payload.new.order_number as string || `#${(payload.new.id as string).slice(0, 8)}`,
              status: newStatus,
              trackingId: payload.new.tracking_id as string | undefined,
              courierName: payload.new.courier_name as string | undefined,
            });
            setShowEmailNotification(true);

            // Auto-hide after 8 seconds
            setTimeout(() => {
              setShowEmailNotification(false);
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return (
    <>
      {children}
      
      {/* Simulated Email Notification */}
      {showEmailNotification && emailDetails && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Mail className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Email Notification Sent</p>
                <p className="text-xs text-muted-foreground">to your registered email</p>
              </div>
              <button
                onClick={() => setShowEmailNotification(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            {/* Email Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = statusIcons[emailDetails.status] || Package;
                  return (
                    <div className={`p-2 rounded-full ${
                      emailDetails.status === "cancelled" 
                        ? "bg-destructive/10 text-destructive" 
                        : emailDetails.status === "delivered"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-primary/10 text-primary"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  );
                })()}
                <div>
                  <p className="font-medium text-sm">
                    Order {emailDetails.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Status: {emailDetails.status}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {statusMessages[emailDetails.status]}
              </p>
              
              {emailDetails.trackingId && emailDetails.courierName && (
                <div className="bg-muted/50 rounded-md p-3 text-sm">
                  <p className="font-medium">Tracking Information</p>
                  <p className="text-muted-foreground">
                    {emailDetails.courierName}: {emailDetails.trackingId}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground italic">
                📧 A copy of this notification has been sent to your email
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderStatusNotification;
