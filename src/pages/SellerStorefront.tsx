import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Store, Package, Calendar, MapPin, Loader2, Users, Heart, Grid3X3, UserPlus, UserMinus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useSellerFollow } from "@/hooks/useSellerFollow";

const SellerStorefront = () => {
  const { sellerId } = useParams();
  const queryClient = useQueryClient();
  const { followerCount, isFollowing, toggleFollow, isLoading: followLoading } = useSellerFollow(sellerId);

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["seller-storefront", sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", sellerId!)
        .eq("verification_status", "verified")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sellerId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seller-storefront-products", sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!sellerId,
  });

  const { data: reviewStats } = useQuery({
    queryKey: ["seller-review-stats", sellerId],
    queryFn: async () => {
      const productIds = products.map(p => p.id);
      if (productIds.length === 0) return { avg: 0, count: 0 };
      const { data } = await supabase
        .from("product_reviews")
        .select("rating")
        .in("product_id", productIds);
      const ratings = data || [];
      const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
      return { avg: Math.round(avg * 10) / 10, count: ratings.length };
    },
    enabled: products.length > 0,
  });

  // Realtime product updates
  useEffect(() => {
    if (!sellerId) return;
    const channel = supabase
      .channel(`seller-products-${sellerId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "products",
        filter: `seller_id=eq.${sellerId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["seller-storefront-products", sellerId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sellerId, queryClient]);

  const [sortBy, setSortBy] = useState("newest");

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.discount_price_pkr ?? a.price_pkr;
    const priceB = b.discount_price_pkr ?? b.price_pkr;
    switch (sortBy) {
      case "price-low": return priceA - priceB;
      case "price-high": return priceB - priceA;
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (sellerLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-6">This seller store doesn't exist or is not verified.</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const storeName = seller.shop_name || seller.legal_name;
  const storeInitials = storeName?.slice(0, 2)?.toUpperCase() || "ST";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${storeName} - FANZON Store`}
        description={`Shop from ${storeName} on FANZON. ${products.length} products available.`}
        url={`/store/${sellerId}`}
      />
      <Header />

      <main className="flex-1">
        {/* Store Banner */}
        <div className="relative">
          {/* Banner background */}
          <div className="h-40 md:h-56 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
            {seller.store_banner_url && (
              <img
                src={seller.store_banner_url}
                alt="Store banner"
                className="w-full h-full object-cover absolute inset-0 opacity-40"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Profile section overlapping banner */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-start md:items-end gap-4 pb-6">
              {/* Store Avatar */}
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-xl ring-2 ring-primary/20">
                {seller.store_logo_url ? (
                  <AvatarImage src={seller.store_logo_url} alt={storeName} />
                ) : null}
                <AvatarFallback className="text-3xl md:text-4xl font-bold bg-primary text-primary-foreground">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>

              {/* Store Info */}
              <div className="flex-1 min-w-0 pt-2 md:pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{storeName}</h1>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                    ✓ Verified
                  </Badge>
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{reviewStats?.avg || 0}</span>
                    <span>({reviewStats?.count || 0} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package size={15} />
                    <span className="font-semibold text-foreground">{products.length}</span> Products
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={15} />
                    <span className="font-semibold text-foreground">{followerCount}</span> Followers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} /> {seller.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} /> Joined {format(new Date(seller.created_at), "MMM yyyy")}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <div className="md:pb-1">
                <Button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                  size="lg"
                  className={`gap-2 min-w-[140px] ${isFollowing ? "border-destructive/50 text-destructive hover:bg-destructive/10" : ""}`}
                >
                  {followLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus size={18} />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-border" />

        {/* Products Section */}
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="products">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="products" className="gap-2">
                  <Grid3X3 size={16} />
                  All Products ({products.length})
                </TabsTrigger>
              </TabsList>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-background"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <TabsContent value="products">
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <p className="text-lg font-medium">No products available yet.</p>
                  <p className="text-sm mt-1">This store hasn't listed any products.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerStorefront;
