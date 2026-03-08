import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Star, Package } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import RecommendedProducts from "@/components/product/RecommendedProducts";
import EmptyState from "@/components/ui/empty-state";
import ProductCardSkeleton from "@/components/ui/product-card-skeleton";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories, brands } from "@/data/mockData";
import { useActiveProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";
import { fuzzySearch } from "@/utils/fuzzySearch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const MobileProductSkeleton = () => (
  <div className="bg-card rounded-xl overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-2 space-y-1.5">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-2 w-1/3" />
    </div>
  </div>
);

const ProductListing = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const { products, isLoading } = useActiveProducts();

  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    rating: true,
    availability: true,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug)
        ? prev.filter((b) => b !== brandSlug)
        : [...prev, brandSlug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 500000]);
    setMinRating(null);
    setInStockOnly(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || minRating !== null || inStockOnly || priceRange[0] > 0 || priceRange[1] < 500000;

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = fuzzySearch(filtered, searchQuery, (p) => [p.title, p.category, p.brand || ""], 0.5);
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.some((c) => p.category.toLowerCase().replace(/\s+/g, "-") === c)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand?.toLowerCase() || ""));
    }

    const price = (p: typeof products[0]) => p.discount_price_pkr ?? p.price_pkr;
    filtered = filtered.filter((p) => price(p) >= priceRange[0] && price(p) <= priceRange[1]);

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock_count > 0);
    }

    switch (sortBy) {
      case "price-low":
        filtered = filtered.sort((a, b) => price(a) - price(b));
        break;
      case "price-high":
        filtered = filtered.sort((a, b) => price(b) - price(a));
        break;
      case "newest":
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
      case "bestseller":
        filtered = filtered.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, sortBy, minRating, inStockOnly]);

  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : category
    ? categories.find((c) => c.slug === category)?.name || "Products"
    : "All Products";

  const seoDescription = searchQuery
    ? `Find ${searchQuery} products at FANZON Pakistan. Best prices, fast delivery!`
    : category
    ? `Shop ${pageTitle} at FANZON Pakistan. Authentic products, great prices in PKR!`
    : "Browse all products at FANZON Pakistan. Electronics, Fashion, Home & more!";

  const seoUrl = searchQuery ? `/search?q=${searchQuery}` : category ? `/category/${category}` : "/products";

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-border pb-4">
        <button onClick={() => toggleSection("categories")} className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          {t("filter.categories")}
          {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox id={`cat-${cat.id}`} checked={selectedCategories.includes(cat.slug)} onCheckedChange={() => toggleCategory(cat.slug)} />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">{cat.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-border pb-4">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          {t("filter.price_range")}
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} max={500000} step={1000} className="mt-4" />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Min (Rs.)</Label>
                <Input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="h-8 text-sm" />
              </div>
              <span className="text-muted-foreground mt-5">-</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Max (Rs.)</Label>
                <Input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="h-8 text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-b border-border pb-4">
        <button onClick={() => toggleSection("rating")} className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          {t("filter.rating")}
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox id={`rating-${rating}`} checked={minRating === rating} onCheckedChange={() => setMinRating(minRating === rating ? null : rating)} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className={star <= rating ? "fill-fanzon-star text-fanzon-star" : "text-muted-foreground"} />
                  ))}
                  <span className="ms-1">& above</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border-b border-border pb-4">
        <button onClick={() => toggleSection("availability")} className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          {t("filter.availability")}
          {expandedSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.availability && (
          <div className="flex items-center justify-between">
            <Label htmlFor="in-stock-toggle" className="flex items-center gap-2 text-sm cursor-pointer">
              <Package size={16} className="text-muted-foreground" />
              {t("filter.in_stock_only")}
            </Label>
            <Switch id="in-stock-toggle" checked={inStockOnly} onCheckedChange={setInStockOnly} />
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-border pb-4">
        <button onClick={() => toggleSection("brands")} className="flex items-center justify-between w-full text-sm font-semibold mb-3">
          {t("filter.brands")}
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox id={`brand-${brand.id}`} checked={selectedBrands.includes(brand.slug)} onCheckedChange={() => toggleBrand(brand.slug)} />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">{brand.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full" disabled={!hasActiveFilters}>
        {t("filter.clear_all")}
      </Button>
    </div>
  );

  // Mobile sort/filter bar
  const MobileSortFilterBar = () => (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border sticky top-0 z-20">
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-9 text-xs">
            <SlidersHorizontal size={14} />
            Filter
            {hasActiveFilters && (
              <span className="bg-accent text-accent-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t("filter.title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 pb-6">
            <FilterSidebar />
          </div>
        </SheetContent>
      </Sheet>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="flex-1 h-9 text-xs">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          <SelectItem value="price-low">Price: Low→High</SelectItem>
          <SelectItem value="price-high">Price: High→Low</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="bestseller">Best Selling</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Mobile active filter pills
  const MobileActiveFilters = () => {
    if (!hasActiveFilters) return null;
    return (
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar">
        {selectedCategories.map((cat) => (
          <button key={cat} onClick={() => toggleCategory(cat)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[11px] rounded-full whitespace-nowrap shrink-0">
            {categories.find((c) => c.slug === cat)?.name}
            <X size={12} />
          </button>
        ))}
        {inStockOnly && (
          <button onClick={() => setInStockOnly(false)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[11px] rounded-full whitespace-nowrap shrink-0">
            In Stock <X size={12} />
          </button>
        )}
        {(priceRange[0] > 0 || priceRange[1] < 500000) && (
          <button onClick={() => setPriceRange([0, 500000])} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[11px] rounded-full whitespace-nowrap shrink-0">
            Rs.{priceRange[0].toLocaleString()}-{priceRange[1].toLocaleString()} <X size={12} />
          </button>
        )}
        <button onClick={clearFilters} className="inline-flex items-center px-2.5 py-1 text-destructive text-[11px] rounded-full whitespace-nowrap shrink-0 font-medium">
          Clear All
        </button>
      </div>
    );
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead title={pageTitle} description={seoDescription} url={seoUrl} />
        <Header />

        {/* Title */}
        <div className="px-3 pt-3 pb-1">
          <h1 className="text-base font-bold text-foreground">{pageTitle}</h1>
          <p className="text-[11px] text-muted-foreground">{filteredProducts.length} items found</p>
        </div>

        <MobileSortFilterBar />
        <MobileActiveFilters />

        <main className="flex-1 pb-20">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <MobileProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 p-2">
              {filteredProducts.map((product) => (
                <MobileProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="px-4 pt-8">
              <EmptyState
                type="search"
                title={t("search.no_results_title")}
                description={t("search.no_results_desc")}
                actionLabel={t("filter.clear_all")}
                onAction={clearFilters}
              />
              <RecommendedProducts limit={6} />
            </div>
          )}
        </main>

        <MobileBottomNav />
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={pageTitle} description={seoDescription} url={seoUrl} />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page Title & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} {t("common.items_found")}</p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("sort.title")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t("sort.relevance")}</SelectItem>
              <SelectItem value="price-low">{t("sort.price_low")}</SelectItem>
              <SelectItem value="price-high">{t("sort.price_high")}</SelectItem>
              <SelectItem value="newest">{t("sort.newest")}</SelectItem>
              <SelectItem value="rating">{t("sort.rating")}</SelectItem>
              <SelectItem value="bestseller">{t("sort.bestseller")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {categories.find((c) => c.slug === cat)?.name}
                <button onClick={() => toggleCategory(cat)}><X size={14} /></button>
              </span>
            ))}
            {selectedBrands.map((brand) => (
              <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {brands.find((b) => b.slug === brand)?.name}
                <button onClick={() => toggleBrand(brand)}><X size={14} /></button>
              </span>
            ))}
            {minRating !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {minRating}★ & above
                <button onClick={() => setMinRating(null)}><X size={14} /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {t("filter.in_stock_only")}
                <button onClick={() => setInStockOnly(false)}><X size={14} /></button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                <button onClick={() => setPriceRange([0, 500000])}><X size={14} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">{t("filter.title")}</h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div>
                <EmptyState
                  type="search"
                  title={t("search.no_results_title")}
                  description={t("search.no_results_desc")}
                  actionLabel={t("filter.clear_all")}
                  onAction={clearFilters}
                />
                <RecommendedProducts limit={6} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductListing;
