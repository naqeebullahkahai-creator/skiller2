import { justForYouProducts } from "@/data/mockData";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

const JustForYou = () => {
  return (
    <section className="bg-secondary py-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-3 px-4 md:px-6 rounded-t-lg">
          <h2 className="text-lg md:text-xl font-bold text-center">
            Just For You
          </h2>
        </div>

        {/* Product Grid */}
        <div className="bg-card p-4 rounded-b-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {justForYouProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-fanzon-orange-light hover:text-primary px-8"
            >
              Load More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JustForYou;
