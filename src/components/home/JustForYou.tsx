import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useActiveProducts, DatabaseProduct } from "@/hooks/useProducts";

const JustForYou = () => {
  const { products, isLoading } = useActiveProducts();
  const [displayCount, setDisplayCount] = useState(12);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };

  if (isLoading) {
    return (
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
          </div>
          <div className="bg-card p-4 rounded-b-lg flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-secondary py-6">
        <div className="container mx-auto">
          <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
            <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
          </div>
          <div className="bg-card p-4 rounded-b-lg text-center py-12 text-muted-foreground">
            No products available yet
          </div>
        </div>
      </section>
    );
  }

  const displayedProducts = products.slice(0, displayCount);

  return (
    <section className="bg-secondary py-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
          <h2 className="text-lg md:text-xl font-bold text-center">Just For You</h2>
        </div>

        {/* Product Grid */}
        <div className="bg-card p-4 rounded-b-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < products.length && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-fanzon-orange-light hover:text-primary px-8"
                onClick={loadMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JustForYou;
