import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Store, Package, Calendar, MapPin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const SellerStorefront = () => {
  const { sellerId } = useParams();

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
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-primary-foreground/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Store size={40} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{storeName}</h1>
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80 mt-2">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-300 text-yellow-300" />
                    {reviewStats?.avg || 0} ({reviewStats?.count || 0} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Package size={14} /> {products.length} Products
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {seller.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Joined {format(new Date(seller.created_at), "MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="products">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="products">All Products</TabsTrigger>
              </TabsList>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
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
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3" />
                  <p>No products available yet.</p>
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
