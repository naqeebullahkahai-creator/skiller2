import { GitCompareArrows, Check } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";
import { DatabaseProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCompareButtonProps {
  product: DatabaseProduct;
  variant?: "icon" | "button" | "text";
  className?: string;
}

const AddToCompareButton = ({
  product,
  variant = "icon",
  className,
}: AddToCompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInComparison, canAddMore } = useComparison();
  const isComparing = isInComparison(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isComparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={!isComparing && !canAddMore}
        className={cn(
          "p-1.5 bg-card/80 hover:bg-card rounded-full transition-all",
          isComparing && "bg-primary text-primary-foreground hover:bg-primary/90",
          !isComparing && !canAddMore && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isComparing ? "Remove from comparison" : "Add to comparison"}
      >
        {isComparing ? <Check size={16} /> : <GitCompareArrows size={16} />}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleClick}
        disabled={!isComparing && !canAddMore}
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors",
          isComparing && "text-primary",
          !isComparing && !canAddMore && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {isComparing ? <Check size={18} /> : <GitCompareArrows size={18} />}
        {isComparing ? "Added to Compare" : "Add to Compare"}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!isComparing && !canAddMore}
      variant={isComparing ? "default" : "outline"}
      size="sm"
      className={cn(
        isComparing && "bg-primary text-primary-foreground",
        className
      )}
    >
      {isComparing ? <Check size={16} className="mr-1" /> : <GitCompareArrows size={16} className="mr-1" />}
      {isComparing ? "Comparing" : "Compare"}
    </Button>
  );
};

export default AddToCompareButton;
