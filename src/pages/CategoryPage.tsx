import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { ChevronRight, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types";
import { DatabaseProduct } from "@/hooks/useProducts";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  subcategories?: Category[];
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const isMobile = useIsMobile();
  const [realtimeProducts, setRealtimeProducts] = useState<Product[]>([]);

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!slug,
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", category.id)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!category?.id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["category-products", category?.name],
    queryFn: async () => {
      if (!category?.name) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .ilike("category", `%${category.name}%`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!category?.name,
  });

  useEffect(() => {
    if (products) setRealtimeProducts(products);
  }, [products]);

  useEffect(() => {
    if (!category?.name) return;
    const channel = supabase
      .channel(`category-products-${category.name}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, (payload) => {
        const updated = payload.new as Product;
        if (updated.category?.includes(category.name) && updated.status === "active") {
          setRealtimeProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [category?.name]);

  const { data: parentCategory } = useQuery({
    queryKey: ["parent-category", category?.parent_id],
    queryFn: async () => {
      if (!category?.parent_id) return null;
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", category.parent_id)
        .maybeSingle();
      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!category?.parent_id,
  });

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(parentCategory ? [{ name: parentCategory.name, url: `/category/${parentCategory.slug}` }] : []),
    ...(category ? [{ name: category.name, url: `/category/${category.slug}` }] : []),
  ];

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className={isMobile ? "p-3 pb-20" : "container mx-auto px-4 py-8"}>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-48 mb-6" />
          <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-2 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${category.name} - Shop Products | FANZON`}
        description={`Browse our collection of ${category.name} products. Find the best deals and latest arrivals.`}
        url={`/category/${category.slug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />

      <main className={isMobile ? "px-3 pt-3 pb-20" : "container mx-auto px-4 py-6 pb-8"}>
        {/* Breadcrumb - desktop only */}
        {!isMobile && (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            {parentCategory && (
              <>
                <ChevronRight size={14} />
                <Link to={`/category/${parentCategory.slug}`} className="hover:text-primary transition-colors">{parentCategory.name}</Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        )}

        {/* Category Header */}
        <div className="mb-4">
          <h1 className={isMobile ? "text-lg font-bold text-foreground" : "text-2xl md:text-3xl font-bold text-foreground mb-1"}>
            {category.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {realtimeProducts.length} products found
          </p>
        </div>

        {/* Subcategories */}
        {subcategories && subcategories.length > 0 && (
          <div className={isMobile ? "mb-4" : "mb-8"}>
            {!isMobile && <h2 className="text-lg font-semibold mb-4">Subcategories</h2>}
            <div className={isMobile ? "flex gap-2 overflow-x-auto no-scrollbar pb-1" : "flex flex-wrap gap-3"}>
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${sub.slug}`}
                  className={isMobile
                    ? "px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium whitespace-nowrap shrink-0 active:bg-primary active:text-primary-foreground transition-colors"
                    : "px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  }
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-2 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : realtimeProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
            <p className="text-muted-foreground">Check back soon for new arrivals in this category.</p>
          </div>
        ) : (
          <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"}>
            {realtimeProducts.map((product) => (
              isMobile
                ? <MobileProductCard key={product.id} product={product as DatabaseProduct} />
                : <ProductCard key={product.id} product={product as DatabaseProduct} />
            ))}
          </div>
        )}
      </main>

      {!isMobile && <Footer />}
      <MobileBottomNav />
    </div>
  );
};

export default CategoryPage;
