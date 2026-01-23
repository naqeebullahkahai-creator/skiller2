import { useSellerCollectibleVouchers, useCollectedVouchers } from "@/hooks/useSellerVouchers";
import { formatPKR } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Gift, Check, Clock, Percent, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface VoucherWallProps {
  sellerId: string;
  sellerName?: string;
}

const VoucherWall = ({ sellerId, sellerName }: VoucherWallProps) => {
  const { vouchers, isLoading } = useSellerCollectibleVouchers(sellerId);
  const { collectVoucher, isCollecting, isVoucherCollected } = useCollectedVouchers();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();
  

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (vouchers.length === 0) {
    return null;
  }

  const handleCollect = (voucherId: string) => {
    if (!user) {
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
    }
    collectVoucher(voucherId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="text-primary" size={20} />
        <h3 className="text-lg font-semibold">
          {sellerName ? `${sellerName}'s Vouchers` : "Available Vouchers"}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((voucher) => {
          const isCollected = isVoucherCollected(voucher.id);
          const isExpiringSoon = new Date(voucher.expiry_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
          
          return (
            <Card 
              key={voucher.id} 
              className={`relative overflow-hidden border-2 transition-all ${
                isCollected 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-dashed border-primary/50 hover:border-primary"
              }`}
            >
              {/* Decorative ticket edge */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary/10" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary/20" />
              
              <CardContent className="p-4 pl-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {/* Discount badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="text-sm font-bold">
                        {voucher.discount_type === "percentage" ? (
                          <><Percent size={12} className="mr-1" />{voucher.discount_value}% OFF</>
                        ) : (
                          <><Banknote size={12} className="mr-1" />{formatPKR(voucher.discount_value)} OFF</>
                        )}
                      </Badge>
                      {isExpiringSoon && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock size={10} className="mr-1" />
                          Ending Soon
                        </Badge>
                      )}
                    </div>

                    {/* Title and description */}
                    {voucher.title && (
                      <h4 className="font-medium text-sm">{voucher.title}</h4>
                    )}
                    {voucher.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {voucher.description}
                      </p>
                    )}

                    {/* Conditions */}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                      {voucher.minimum_spend_pkr > 0 && (
                        <span>Min. spend: {formatPKR(voucher.minimum_spend_pkr)}</span>
                      )}
                      <span>Expires: {format(new Date(voucher.expiry_date), "MMM dd")}</span>
                    </div>
                  </div>

                  {/* Collect button */}
                  <div className="flex-shrink-0">
                    {isCollected ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled 
                        className="border-primary text-primary"
                      >
                        <Check size={14} className="mr-1" />
                        Collected
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleCollect(voucher.id)}
                        disabled={isCollecting}
                      >
                        <Ticket size={14} className="mr-1" />
                        Collect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Voucher code (shown after collection) */}
                {isCollected && (
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Code:</span>
                      <code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono">
                        {voucher.code}
                      </code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VoucherWall;
