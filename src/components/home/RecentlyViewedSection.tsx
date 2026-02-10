import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductCard from "@/components/product/ProductCard";
import { Clock } from "lucide-react";

const RecentlyViewedSection = () => {
  const { recentlyViewed, isLoading } = useRecentlyViewed();

  if (isLoading || recentlyViewed.length === 0) return null;

  return (
    <section className="bg-secondary py-4">
      <div className="container mx-auto">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-primary" />
            <h2 className="text-base md:text-lg font-bold">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentlyViewed.slice(0, 12).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
