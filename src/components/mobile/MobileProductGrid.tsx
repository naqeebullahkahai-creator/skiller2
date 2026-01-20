import { DatabaseProduct } from "@/hooks/useProducts";
import MobileProductCard from "./MobileProductCard";

interface MobileProductGridProps {
  products: DatabaseProduct[];
  isLoading?: boolean;
}

const MobileProductGrid = ({ products, isLoading }: MobileProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-2 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {products.map((product) => (
        <MobileProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default MobileProductGrid;
