import { Link } from "react-router-dom";
import { X, Star, ShoppingCart, Package, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { useCart } from "@/contexts/CartContext";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const ComparePage = () => {
  const { items, removeFromCompare, clearComparison } = useComparison();
  const { addToCart } = useCart();

  // Find the lowest price among compared items
  const lowestPrice = items.length > 0
    ? Math.min(...items.map((p) => p.discount_price_pkr || p.price_pkr))
    : 0;

  // Extract all unique specification keys from product descriptions
  // For now, we'll use standard attributes
  const specificationRows = [
    { key: "category", label: "Category" },
    { key: "brand", label: "Brand" },
    { key: "sku", label: "SKU" },
  ];

  if (items.length < 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Compare Products - FANZON"
          description="Compare products side by side to make the best choice."
        />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Not Enough Products</h1>
            <p className="text-muted-foreground mb-6">
              You need at least 2 products to compare. Add more products from our catalog.
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-fanzon-orange-hover">
                <ArrowLeft size={18} className="mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Compare Products - FANZON"
        description="Compare products side by side to find the best deal."
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Compare Products</h1>
            <p className="text-muted-foreground">
              Comparing {items.length} products side by side
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-1" />
                Add More
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[600px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-muted/50 rounded-tl-lg w-[150px] min-w-[150px]">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Attribute
                    </span>
                  </th>
                  {items.map((product, index) => (
                    <th
                      key={product.id}
                      className={cn(
                        "p-4 bg-muted/50 min-w-[200px]",
                        index === items.length - 1 && "rounded-tr-lg"
                      )}
                    >
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Product Image */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-sm">Image</td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <Link to={`/product/${product.slug || product.id}`}>
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.title}
                          className="w-32 h-32 object-cover rounded-lg mx-auto hover:scale-105 transition-transform"
                        />
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Title */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-sm">Title</td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4">
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {product.title}
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr className="border-b border-border bg-muted/30">
                  <td className="p-4 font-medium text-sm">Price</td>
                  {items.map((product) => {
                    const price = product.discount_price_pkr || product.price_pkr;
                    const isLowest = price === lowestPrice;
                    const hasDiscount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr;

                    return (
                      <td key={product.id} className="p-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={cn(
                              "text-lg font-bold",
                              isLowest ? "text-fanzon-success" : "text-primary"
                            )}
                          >
                            {formatPKR(price)}
                            {isLowest && (
                              <span className="ml-2 text-xs bg-fanzon-success/20 text-fanzon-success px-2 py-0.5 rounded-full">
                                Lowest
                              </span>
                            )}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPKR(product.price_pkr)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Rating */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-sm">Rating</td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={cn(
                                star <= 4
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          4.5 (100+)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Availability */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-sm">Availability</td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <Package
                          size={16}
                          className={cn(
                            product.stock_count > 0
                              ? "text-fanzon-success"
                              : "text-destructive"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            product.stock_count > 0
                              ? "text-fanzon-success"
                              : "text-destructive"
                          )}
                        >
                          {product.stock_count > 0
                            ? `In Stock (${product.stock_count})`
                            : "Out of Stock"}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Specifications */}
                {specificationRows.map((spec) => (
                  <tr key={spec.key} className="border-b border-border">
                    <td className="p-4 font-medium text-sm">{spec.label}</td>
                    {items.map((product) => (
                      <td key={product.id} className="p-4 text-sm">
                        {(product as any)[spec.key] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Description */}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-sm align-top">Description</td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {product.description || "No description available."}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Add to Cart */}
                <tr className="bg-muted/30">
                  <td className="p-4 font-medium text-sm rounded-bl-lg">Action</td>
                  {items.map((product, index) => (
                    <td
                      key={product.id}
                      className={cn(
                        "p-4",
                        index === items.length - 1 && "rounded-br-lg"
                      )}
                    >
                      <Button
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stock_count === 0}
                        className="w-full bg-primary hover:bg-fanzon-orange-hover"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Hint */}
        <p className="text-xs text-muted-foreground text-center mt-4 md:hidden">
          ← Scroll horizontally to see all products →
        </p>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ComparePage;
