import { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface BuyerViewToggleProps {
  className?: string;
}

const BuyerViewToggle = ({ className }: BuyerViewToggleProps) => {
  const { isSuperAdmin, role } = useAuth();
  const [isBuyerView, setIsBuyerView] = useState(false);

  // Only show for admins
  if (!isSuperAdmin && role !== "admin") return null;

  return (
    <Button
      onClick={() => setIsBuyerView(!isBuyerView)}
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 transition-all duration-300",
        isBuyerView && "bg-blue-50 border-blue-300 text-blue-700",
        className
      )}
    >
      {isBuyerView ? (
        <>
          <ShoppingBag size={16} />
          <span className="hidden sm:inline">Buyer View</span>
        </>
      ) : (
        <>
          <Eye size={16} />
          <span className="hidden sm:inline">Switch to Buyer</span>
        </>
      )}
    </Button>
  );
};

export default BuyerViewToggle;
