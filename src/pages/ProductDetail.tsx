import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
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
  ThumbsUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getProductById, allProducts, Product } from "@/data/mockData";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const product = getProductById(id || "");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [product]);

  if (!product) {
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

  const images = product.images || [product.image];

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.stockTotal - product.stockSold)));
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.title} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    toast({
      title: "Proceeding to Checkout",
      description: "Redirecting to checkout page...",
    });
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
          <Link to={`/category/${product.categorySlug}`} className="hover:text-primary">
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
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded">
                    -{product.discount}%
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
                      star <= Math.floor(product.rating)
                        ? "fill-fanzon-star text-fanzon-star"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.ratingCount} reviews)
              </span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                {product.soldCount} sold
              </span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-fanzon-success">
                      {product.discount}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Free Shipping Tag */}
            {product.freeShipping && (
              <div className="flex items-center gap-2 text-fanzon-success mb-4">
                <Truck size={18} />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
            )}

            {/* Quantity Selector */}
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
                    disabled={quantity >= product.stockTotal - product.stockSold}
                    className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stockTotal - product.stockSold} pieces available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-primary hover:bg-fanzon-orange-hover text-primary-foreground font-semibold"
              >
                Buy Now
              </Button>
              <Button
                onClick={handleAddToCart}
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
                    <p className="text-sm text-muted-foreground">Dhaka, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Standard Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {product.freeShipping ? "Free" : "৳60"}
                    </p>
                    <p className="text-xs text-muted-foreground">Estimated 3-5 days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Express Delivery</p>
                    <p className="text-sm text-muted-foreground">৳120</p>
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
                  <Link
                    to={`/seller/${product.vendor.toLowerCase().replace(/\s+/g, "-")}`}
                    className="font-medium hover:text-primary"
                  >
                    {product.vendor}
                  </Link>
                  {product.vendorRating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star size={12} className="fill-fanzon-star text-fanzon-star" />
                      {product.vendorRating}
                    </div>
                  )}
                </div>
              </div>

              {product.vendorPositiveRating && (
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Positive Seller Ratings</span>
                  <span className="font-medium text-fanzon-success">
                    {product.vendorPositiveRating}%
                  </span>
                </div>
              )}

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
                Reviews ({product.ratingCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                <table className="w-full">
                  <tbody>
                    {product.specifications?.map((spec, index) => (
                      <tr
                        key={index}
                        className={cn(
                          "border-b border-border last:border-0",
                          index % 2 === 0 ? "bg-muted/30" : ""
                        )}
                      >
                        <td className="py-3 px-4 text-sm font-medium w-1/3">
                          {spec.key}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-6">Customer Reviews</h3>

                <div className="space-y-6">
                  {product.reviews?.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-border pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={cn(
                                    star <= review.rating
                                      ? "fill-fanzon-star text-fanzon-star"
                                      : "text-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {review.comment}
                      </p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="Review"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                        <ThumbsUp size={14} />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
