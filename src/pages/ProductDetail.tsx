import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Star, Heart, Minus, Plus, ShoppingCart, Truck, Shield,
  RotateCcw, Store, Package, MapPin, Clock, CreditCard, Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import ProductReviews from "@/components/product/ProductReviews";
import ProductQASection from "@/components/product/ProductQASection";
import ChatWithSellerButton from "@/components/messaging/ChatWithSellerButton";
import VariantSelector from "@/components/product/VariantSelector";
import SocialShareButtons from "@/components/product/SocialShareButtons";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCompareButton from "@/components/comparison/AddToCompareButton";
import SEOHead from "@/components/seo/SEOHead";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import MobileProductDetail from "@/components/mobile/MobileProductDetail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useActiveProducts, formatPKR } from "@/hooks/useProducts";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2 mt-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="w-16 h-16 rounded-lg" />)}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const MobileProductDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const { product, isLoading, error } = useProduct(id);
  const { products: allProducts } = useActiveProducts(20);
  const { stats: reviewStats } = useProductReviews(id);
  const { groupedVariants, variants } = useProductVariants(id);
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    if (id) trackView.mutate(id);
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant | null>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  // Auto-select first variant of each type
  useEffect(() => {
    if (!autoSelected && variants.length > 0 && Object.keys(groupedVariants).length > 0) {
      const initialSelection: Record<string, ProductVariant | null> = {};
      Object.entries(groupedVariants).forEach(([name, variantList]) => {
        const firstAvailable = variantList.find(v => v.stock_count > 0) || variantList[0];
        initialSelection[name] = firstAvailable;
      });
      setSelectedVariants(initialSelection);
      setAutoSelected(true);
    }
  }, [variants, groupedVariants, autoSelected]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [product, allProducts]);

  // Fetch seller profile
  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile-mini", product?.seller_id],
    queryFn: async () => {
      // Try seller_profiles first
      const { data: sp } = await supabase
        .from("seller_profiles")
        .select("shop_name, legal_name, city, verification_status, store_logo_url")
        .eq("user_id", product!.seller_id)
        .maybeSingle();
      
      // Also get profile name as fallback
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", product!.seller_id)
        .maybeSingle();
      
      return {
        shop_name: sp?.shop_name || null,
        legal_name: sp?.legal_name || null,
        city: sp?.city || null,
        verification_status: sp?.verification_status || null,
        store_logo_url: sp?.store_logo_url || null,
        profile_name: profile?.full_name || null,
      };
    },
    enabled: !!product?.seller_id,
  });

  if (isLoading) {
    return isMobile ? <MobileProductDetailSkeleton /> : <ProductDetailSkeleton />;
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">This product doesn't exist or has been removed.</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"];
  const selectedVariant = Object.values(selectedVariants).find(v => v !== null) || null;
  
  // Variant price IS the display price (not added to base)
  const hasVariants = variants.length > 0;
  const variantPrice = selectedVariant?.additional_price_pkr || 0;
  const displayPrice = hasVariants && selectedVariant && variantPrice > 0 
    ? variantPrice 
    : (product.discount_price_pkr || product.price_pkr);
  const originalPrice = hasVariants && selectedVariant && variantPrice > 0 
    ? product.price_pkr 
    : product.price_pkr;
  const discount = displayPrice < originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const availableStock = selectedVariant ? selectedVariant.stock_count : product.stock_count;
  const needsVariantSelection = hasVariants && !selectedVariant;

  // Get variant-specific images for mobile
  const variantImages = selectedVariant?.image_urls?.length 
    ? selectedVariant.image_urls 
    : images;

  const sellerName = sellerProfile?.shop_name || sellerProfile?.legal_name || "FANZON Seller";

  const handleVariantSelect = (variantName: string, variant: ProductVariant) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: variant }));
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, availableStock)));
  };

  const handleAddToCart = () => {
    if (product && !isAddingToCart && !needsVariantSelection) {
      setIsAddingToCart(true);
      addToCart(product, quantity, selectedVariant);
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  const handleBuyNow = () => {
    if (product && !isAddingToCart && !needsVariantSelection) {
      setIsAddingToCart(true);
      addToCart(product, quantity, selectedVariant);
      navigate("/checkout");
    }
  };

  const productUrl = `/product/${product.slug || product.id}`;
  const productImage = images[0];
  const seoDescription = `Buy ${product.title} at FANZON Pakistan for only ${formatPKR(displayPrice)}. ${product.brand ? `Original ${product.brand} product.` : ""} Fast delivery, Cash on Delivery available!`;
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: product.category, url: `/category/${product.category.toLowerCase().replace(/\s+/g, "-")}` },
    { name: product.title, url: productUrl },
  ];

  // SEO tags (shared)
  const seoTags = (
    <>
      <SEOHead title={`${product.title} - Buy at FANZON Pakistan`} description={seoDescription} image={productImage} url={productUrl} type="product" price={displayPrice} availability={availableStock > 0 ? "in stock" : "out of stock"} category={product.category} />
      <ProductJsonLd product={product} reviewCount={reviewStats.totalReviews} averageRating={reviewStats.averageRating} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
    </>
  );

  // ─── MOBILE LAYOUT ───
  if (isMobile) {
    return (
      <>
        {seoTags}
        <MobileProductDetail
          product={product}
          images={variantImages}
          displayPrice={displayPrice}
          discount={discount}
          availableStock={availableStock}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isAddingToCart={isAddingToCart}
          isWishlisted={isWishlisted}
          onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
          hasVariants={hasVariants}
          needsVariantSelection={needsVariantSelection}
          groupedVariants={groupedVariants}
          selectedVariants={selectedVariants}
          onVariantSelect={handleVariantSelect}
          selectedVariant={selectedVariant}
          reviewStats={reviewStats}
          sellerName={sellerName}
        />
      </>
    );
  }

  // ─── DESKTOP LAYOUT ───
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {seoTags}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <ProductBreadcrumb category={product.category} productTitle={product.title} categorySlug={product.category.toLowerCase().replace(/\s+/g, "-")} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-5">
            <ProductGallery images={images} videoUrl={product.video_url} productTitle={product.title} discount={discount} selectedVariant={selectedVariant} variants={variants} />
          </div>

          {/* Product Info */}
          <div className="lg:col-span-4">
            <div className="mb-4">
              {product.brand && (
                <Link to={`/brand/${product.brand.toLowerCase()}`} className="text-sm text-primary hover:underline">{product.brand}</Link>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-foreground mt-1">{product.title}</h1>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16} className={cn(s <= Math.round(reviewStats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                ))}
              </div>
              <span className="text-sm font-medium">{reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "No ratings"}</span>
              <span className="text-sm text-muted-foreground">({reviewStats.totalReviews} reviews)</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{formatPKR(displayPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatPKR(product.price_pkr)}</span>
                    <span className="text-sm font-medium text-primary">{discount}% off</span>
                  </>
                )}
              </div>
              {hasVariants && selectedVariant && variantPrice > 0 && <p className="text-xs text-muted-foreground mt-1">Price for selected variant: {selectedVariant.variant_value}</p>}
            </div>

            {hasVariants && (
              <div className="mb-6">
                <VariantSelector groupedVariants={groupedVariants} selectedVariants={selectedVariants} onVariantSelect={handleVariantSelect} />
              </div>
            )}

            {availableStock > 0 ? (
              <div className="flex items-center gap-2 text-primary mb-4">
                <Package size={18} />
                <span className="text-sm font-medium">In Stock ({availableStock} available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive mb-4">
                <Package size={18} />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            )}

            {availableStock > 0 && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="p-2 hover:bg-muted disabled:opacity-50"><Minus size={16} /></button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= availableStock} className="p-2 hover:bg-muted disabled:opacity-50"><Plus size={16} /></button>
                  </div>
                  <span className="text-sm text-muted-foreground">{availableStock} pieces available</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <Button onClick={handleBuyNow} disabled={availableStock === 0 || needsVariantSelection || isAddingToCart} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : needsVariantSelection ? "Select Variant" : "Buy Now"}
              </Button>
              <Button onClick={handleAddToCart} disabled={availableStock === 0 || needsVariantSelection || isAddingToCart} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart size={18} className="mr-2" />Add to Cart</>}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <Heart size={18} className={cn(isWishlisted && "fill-destructive text-destructive")} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <AddToCompareButton product={product} variant="text" />
              <SocialShareButtons productName={product.title} productUrl={productUrl} productPrice={displayPrice} compact />
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm"><Shield size={18} className="text-primary" /><span>100% Authentic Products</span></div>
              <div className="flex items-center gap-3 text-sm"><RotateCcw size={18} className="text-primary" /><span>7 Days Easy Return</span></div>
              <div className="flex items-center gap-3 text-sm"><Package size={18} className="text-primary" /><span>Secure Packaging</span></div>
            </div>
          </div>

          {/* Delivery & Seller */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-4">Delivery Options</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin size={18} className="text-muted-foreground mt-0.5" /><div><p className="text-sm font-medium">Deliver to</p><p className="text-sm text-muted-foreground">Pakistan</p></div></div>
                <div className="flex items-start gap-3"><Truck size={18} className="text-muted-foreground mt-0.5" /><div><p className="text-sm font-medium">Standard Delivery</p><p className="text-sm text-muted-foreground">Rs. 150</p><p className="text-xs text-muted-foreground">Estimated 3-5 days</p></div></div>
                <div className="flex items-start gap-3"><Clock size={18} className="text-muted-foreground mt-0.5" /><div><p className="text-sm font-medium">Express Delivery</p><p className="text-sm text-muted-foreground">Rs. 300</p><p className="text-xs text-muted-foreground">Estimated 1-2 days</p></div></div>
                <div className="flex items-start gap-3"><CreditCard size={18} className="text-muted-foreground mt-0.5" /><div><p className="text-sm font-medium">Cash on Delivery</p><p className="text-xs text-primary">Available</p></div></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Sold by</h3>
              <Link to={`/store/${product.seller_id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><Store size={24} className="text-primary" /></div>
                <div>
                  <p className="font-medium text-primary hover:underline">{sellerName}</p>
                  {sellerProfile?.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} />{sellerProfile.city}</p>}
                </div>
              </Link>
              <div className="flex gap-2 mb-3">
                <Link to={`/store/${product.seller_id}`}>
                  <Button variant="outline" size="sm" className="text-xs">Visit Store</Button>
                </Link>
              </div>
              <ChatWithSellerButton sellerId={product.seller_id} productId={product.id} productTitle={product.title} sellerName={sellerName} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{product.description || "No description available."}</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["SKU", product.sku || "N/A"],
                  ["Category", product.category],
                  ["Brand", product.brand || "N/A"],
                  ["Stock", `${product.stock_count} units`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>

        <ProductQASection productId={product.id} sellerId={product.seller_id} productTitle={product.title} />

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
