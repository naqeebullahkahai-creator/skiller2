import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Store,
  Package,
  MapPin,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
import ProductReviews from "@/components/product/ProductReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct, useActiveProducts, formatPKR } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { product, isLoading, error } = useProduct(id);
  const { products: allProducts } = useActiveProducts(20);
  const { stats: reviewStats } = useProductReviews(id);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Related products (same category)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [product, allProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"];

  const displayPrice = product.discount_price_pkr || product.price_pkr;
  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.stock_count)));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate("/checkout");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${product.category}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.title.slice(0, 30)}...</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              {/* Main Image */}
              <div
                className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4 cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={product.title}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-200",
                    isZoomed && "scale-150"
                  )}
                  style={
                    isZoomed
                      ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                      : undefined
                  }
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="lg:col-span-4">
            {/* Title & Brand */}
            <div className="mb-4">
              {product.brand && (
                <Link
                  to={`/brand/${product.brand.toLowerCase()}`}
                  className="text-sm text-primary hover:underline"
                >
                  {product.brand}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-foreground mt-1">
                {product.title}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={cn(
                      star <= Math.round(reviewStats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "No ratings"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPKR(displayPrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPKR(product.price_pkr)}
                    </span>
                    <span className="text-sm font-medium text-fanzon-success">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {product.stock_count > 0 ? (
              <div className="flex items-center gap-2 text-fanzon-success mb-4">
                <Package size={18} />
                <span className="text-sm font-medium">In Stock ({product.stock_count} available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive mb-4">
                <Package size={18} />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock_count > 0 && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock_count}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock_count} pieces available
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleBuyNow}
                disabled={product.stock_count === 0}
                className="flex-1 bg-primary hover:bg-fanzon-orange-hover text-primary-foreground font-semibold"
              >
                Buy Now
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_count === 0}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Heart
                  size={18}
                  className={cn(isWishlisted && "fill-destructive text-destructive")}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* Guarantees */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield size={18} className="text-fanzon-success" />
                <span>100% Authentic Products</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={18} className="text-fanzon-success" />
                <span>7 Days Easy Return</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package size={18} className="text-fanzon-success" />
                <span>Secure Packaging</span>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Seller Info */}
          <div className="lg:col-span-3">
            {/* Delivery Info */}
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-4">Delivery Options</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Deliver to</p>
                    <p className="text-sm text-muted-foreground">Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Standard Delivery</p>
                    <p className="text-sm text-muted-foreground">Rs. 150</p>
                    <p className="text-xs text-muted-foreground">Estimated 3-5 days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Express Delivery</p>
                    <p className="text-sm text-muted-foreground">Rs. 300</p>
                    <p className="text-xs text-muted-foreground">Estimated 1-2 days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-fanzon-success">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Sold by</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">FANZON Seller</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star size={12} className="fill-fanzon-star text-fanzon-star" />
                    4.8
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle size={16} className="mr-2" />
                Chat Now
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none text-foreground">
                <p className="whitespace-pre-wrap">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium">{product.sku || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{product.brand || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{product.stock_count} units</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
