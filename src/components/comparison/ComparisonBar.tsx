import { X, GitCompareArrows, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const ComparisonBar = () => {
  const { items, removeFromCompare, clearComparison } = useComparison();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Comparison Items */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
              <GitCompareArrows size={18} className="text-primary" />
              <span className="hidden sm:inline">Compare ({items.length}/4)</span>
              <span className="sm:hidden">{items.length}/4</span>
            </div>

            <div className="flex items-center gap-2">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="relative group shrink-0 bg-muted rounded-lg p-1 flex items-center gap-2 pr-6"
                >
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="hidden sm:block max-w-[120px]">
                    <p className="text-xs font-medium truncate">{product.title}</p>
                    <p className="text-xs text-primary font-semibold">
                      {formatPKR(product.discount_price_pkr || product.price_pkr)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 4 - items.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className={cn(
                    "w-12 h-12 border-2 border-dashed border-muted-foreground/30 rounded-lg shrink-0",
                    "hidden sm:flex items-center justify-center"
                  )}
                >
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>

            <Link to="/compare">
              <Button
                size="sm"
                disabled={items.length < 2}
                className="bg-primary hover:bg-fanzon-orange-hover"
              >
                <GitCompareArrows size={16} className="mr-1" />
                <span className="hidden sm:inline">Compare Now</span>
                <span className="sm:hidden">Compare</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
