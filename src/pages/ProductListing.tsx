import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Star, Package } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
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

const ProductListing = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { t } = useLanguage();

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

    // Filter by search query with fuzzy matching
    if (searchQuery) {
      filtered = fuzzySearch(
        filtered,
        searchQuery,
        (p) => [p.title, p.category, p.brand || ""],
        0.5
      );
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.some(
          (c) => p.category.toLowerCase().replace(/\s+/g, "-") === c
        )
      );
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) =>
        selectedBrands.includes(p.brand?.toLowerCase() || "")
      );
    }

    // Filter by price range
    const price = (p: typeof products[0]) => p.discount_price_pkr ?? p.price_pkr;
    filtered = filtered.filter(
      (p) => price(p) >= priceRange[0] && price(p) <= priceRange[1]
    );

    // Filter by minimum rating (skip if products don't have rating field)
    // Rating filter would require review aggregation - keeping for future use

    // Filter by stock availability
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock_count > 0);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered = filtered.sort((a, b) => price(a) - price(b));
        break;
      case "price-high":
        filtered = filtered.sort((a, b) => price(b) - price(a));
        break;
      case "newest":
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "rating":
        // Sort by newest as fallback since rating requires aggregation
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "bestseller":
        // Sort by newest as fallback
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
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

  const seoUrl = searchQuery
    ? `/search?q=${searchQuery}`
    : category
    ? `/category/${category}`
    : "/products";

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          {t("filter.categories")}
          {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={() => toggleCategory(cat.slug)}
                />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          {t("filter.price_range")}
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={500000}
              step={1000}
              className="mt-4"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Min (Rs.)</Label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="h-8 text-sm"
                  placeholder="0"
                />
              </div>
              <span className="text-muted-foreground mt-5">-</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Max (Rs.)</Label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="h-8 text-sm"
                  placeholder="500000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          {t("filter.rating")}
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={minRating === rating}
                  onCheckedChange={() => setMinRating(minRating === rating ? null : rating)}
                />
                <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                    />
                  ))}
                  <span className="ms-1">& above</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          {t("filter.availability")}
          {expandedSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.availability && (
          <div className="flex items-center justify-between">
            <Label htmlFor="in-stock-toggle" className="flex items-center gap-2 text-sm cursor-pointer">
              <Package size={16} className="text-muted-foreground" />
              {t("filter.in_stock_only")}
            </Label>
            <Switch
              id="in-stock-toggle"
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
            />
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          {t("filter.brands")}
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={() => toggleBrand(brand.slug)}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
                  {brand.name}
                </Label>
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={pageTitle}
        description={seoDescription}
        url={seoUrl}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page Title & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} {t("common.items_found")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  {t("filter.title")}
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t("filter.title")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
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
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {categories.find((c) => c.slug === cat)?.name}
                <button onClick={() => toggleCategory(cat)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {brands.find((b) => b.slug === brand)?.name}
                <button onClick={() => toggleBrand(brand)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {minRating !== null && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {minRating}★ & above
                <button onClick={() => setMinRating(null)}>
                  <X size={14} />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {t("filter.in_stock_only")}
                <button onClick={() => setInStockOnly(false)}>
                  <X size={14} />
                </button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                <button onClick={() => setPriceRange([0, 500000])}>
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">{t("filter.title")}</h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
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
                
                {/* Recommended Products */}
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
