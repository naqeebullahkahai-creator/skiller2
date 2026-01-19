import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Skeleton } from "@/components/ui/skeleton";

const ProductListing = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { products, isLoading } = useActiveProducts();

  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
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
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
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
    }

    return filtered;
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, sortBy]);

  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : category
    ? categories.find((c) => c.slug === category)?.name || "Products"
    : "All Products";

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          Categories
          {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
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
          Price Range
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={10000}
              step={100}
              className="mt-4"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="h-8 text-sm"
                placeholder="Min"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="h-8 text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full text-sm font-semibold mb-3"
        >
          Brands
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2">
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

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page Title & Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} items found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="bestseller">Best Sellers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
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
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">Filters</h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
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
