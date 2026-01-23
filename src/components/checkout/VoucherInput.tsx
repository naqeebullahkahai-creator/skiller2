import { useState, useEffect } from "react";
import { Ticket, X, Loader2, Check, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoucherValidation } from "@/hooks/useMarketing";
import { useCollectedVouchers } from "@/hooks/useSellerVouchers";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VoucherInputProps {
  orderTotal: number;
  onDiscountApplied: (discount: number, code: string) => void;
  onDiscountRemoved: () => void;
  appliedDiscount: { code: string; amount: number } | null;
}

const VoucherInput = ({
  orderTotal,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
}: VoucherInputProps) => {
  const [code, setCode] = useState("");
  const [showCollected, setShowCollected] = useState(false);
  const { validateVoucher, isValidating } = useVoucherValidation();
  const { collectedVouchers, isLoading: isLoadingCollected } = useCollectedVouchers();

  // Filter collected vouchers that meet minimum spend requirements
  const applicableVouchers = collectedVouchers.filter((cv: any) => {
    const voucher = cv.voucher;
    if (!voucher || !voucher.is_active) return false;
    if (new Date(voucher.expiry_date) < new Date()) return false;
    return voucher.minimum_spend_pkr <= orderTotal;
  });

  const handleApply = async () => {
    if (!code.trim()) return;

    const result = await validateVoucher(code.trim(), orderTotal);
    if (result) {
      onDiscountApplied(result.discountAmount, code.toUpperCase());
      setCode("");
    }
  };

  const handleApplyCollected = async (voucherCode: string) => {
    const result = await validateVoucher(voucherCode, orderTotal);
    if (result) {
      onDiscountApplied(result.discountAmount, voucherCode.toUpperCase());
      setShowCollected(false);
    }
  };

  const handleRemove = () => {
    onDiscountRemoved();
  };

  if (appliedDiscount) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Voucher Applied!
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">
                <code className="bg-emerald-100 dark:bg-emerald-900 px-1 rounded">
                  {appliedDiscount.code}
                </code>
                {" "}— You save {formatPKR(appliedDiscount.amount)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-emerald-600 hover:text-destructive"
            onClick={handleRemove}
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Code input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Ticket size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Have a promo code?</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter voucher code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="uppercase"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          <Button
            variant="outline"
            onClick={handleApply}
            disabled={!code.trim() || isValidating}
          >
            {isValidating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>

      {/* Collected vouchers section */}
      {!isLoadingCollected && applicableVouchers.length > 0 && (
        <div className="border border-dashed border-primary/40 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowCollected(!showCollected)}
            className="w-full flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-primary" />
              <span className="text-sm font-medium">
                Your Collected Vouchers
              </span>
              <Badge variant="secondary" className="text-xs">
                {applicableVouchers.length}
              </Badge>
            </div>
            {showCollected ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>

          {showCollected && (
            <div className="p-3 space-y-2 bg-background">
              {applicableVouchers.map((cv: any) => {
                const voucher = cv.voucher;
                return (
                  <div
                    key={cv.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Ticket size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-background px-1.5 py-0.5 rounded">
                            {voucher.code}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {voucher.discount_type === "percentage"
                              ? `${voucher.discount_value}% OFF`
                              : `${formatPKR(voucher.discount_value)} OFF`}
                          </Badge>
                        </div>
                        {voucher.title && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {voucher.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyCollected(voucher.code)}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Use"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Show message when no applicable vouchers */}
      {!isLoadingCollected && collectedVouchers.length > 0 && applicableVouchers.length === 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Gift size={12} />
          Your collected vouchers require a higher order amount
        </p>
      )}
    </div>
  );
};

export default VoucherInput;
