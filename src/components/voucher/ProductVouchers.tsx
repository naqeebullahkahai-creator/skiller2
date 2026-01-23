import { useProductVouchers, useCollectedVouchers } from "@/hooks/useSellerVouchers";
import { formatPKR } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Check, Percent, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProductVouchersProps {
  productId: string;
  sellerId: string;
}

const ProductVouchers = ({ productId, sellerId }: ProductVouchersProps) => {
  const { vouchers, isLoading } = useProductVouchers(productId, sellerId);
  const { collectVoucher, isCollecting, isVoucherCollected } = useCollectedVouchers();
  const { user, setShowAuthModal, setAuthModalMode } = useAuth();

  if (isLoading || vouchers.length === 0) return null;

  const handleCollect = (voucherId: string) => {
    if (!user) {
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
    }
    collectVoucher(voucherId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Ticket size={16} className="text-primary" />
        <span className="text-sm font-medium">Available Vouchers</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {vouchers.slice(0, 3).map((voucher) => {
          const isCollected = isVoucherCollected(voucher.id);
          const isCollectible = voucher.voucher_type === "collectible";
          
          return (
            <div
              key={voucher.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                isCollected 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-muted/50 border-dashed border-primary/40 hover:border-primary"
              }`}
            >
              <Badge variant="secondary" className="font-medium">
                {voucher.discount_type === "percentage" ? (
                  <><Percent size={10} className="mr-1" />{voucher.discount_value}%</>
                ) : (
                  <><Banknote size={10} className="mr-1" />{formatPKR(voucher.discount_value)}</>
                )}
              </Badge>
              
              <span className="text-muted-foreground">
                {voucher.minimum_spend_pkr > 0 
                  ? `on ${formatPKR(voucher.minimum_spend_pkr)}+` 
                  : "No min."}
              </span>

              {isCollectible && (
                isCollected ? (
                  <Button variant="ghost" size="sm" disabled className="h-6 px-2 text-primary">
                    <Check size={12} className="mr-1" />
                    Got it
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCollect(voucher.id)}
                    disabled={isCollecting}
                    className="h-6 px-2 text-primary hover:text-primary"
                  >
                    Collect
                  </Button>
                )
              )}

              {!isCollectible && (
                <code className="text-xs bg-background px-1.5 py-0.5 rounded font-mono">
                  {voucher.code}
                </code>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVouchers;
