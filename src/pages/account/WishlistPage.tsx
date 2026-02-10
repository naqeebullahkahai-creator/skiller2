import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";

const WishlistPage = () => {
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <FanzonSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart size={20} className="text-destructive" />
          My Wishlist ({wishlistItems.length})
        </CardTitle>
        <CardDescription>Products you've saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        {wishlistItems.length === 0 ? (
          <EmptyState type="wishlist" />
        ) : (
          <div className="grid gap-4">
            {wishlistItems.map((item: any) => {
              const product = item.products;
              if (!product) return null;
              const price = product.discount_price_pkr || product.price_pkr;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <Link to={`/product/${product.slug || product.id}`} className="shrink-0">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                    >
                      {product.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold text-sm">
                        Rs. {price.toLocaleString()}
                      </span>
                      {product.discount_price_pkr && (
                        <span className="text-muted-foreground text-xs line-through">
                          Rs. {product.price_pkr.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        product.stock_count > 0 ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {product.stock_count > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={product.stock_count === 0}
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart size={14} className="mr-1" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromWishlist.mutate(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WishlistPage;
