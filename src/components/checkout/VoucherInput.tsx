import { useState } from "react";
import { Ticket, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoucherValidation } from "@/hooks/useMarketing";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

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
  const { validateVoucher, isValidating } = useVoucherValidation();

  const handleApply = async () => {
    if (!code.trim()) return;

    const result = await validateVoucher(code.trim(), orderTotal);
    if (result) {
      onDiscountApplied(result.discountAmount, code.toUpperCase());
      setCode("");
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
  );
};

export default VoucherInput;
