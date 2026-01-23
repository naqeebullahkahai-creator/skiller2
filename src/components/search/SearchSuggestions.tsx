import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, Tag, X, Sparkles } from "lucide-react";
import { useActiveProducts } from "@/hooks/useProducts";
import { categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { fuzzySearch } from "@/utils/fuzzySearch";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchSuggestions = ({ query, isOpen, onClose, onSelect, inputRef }: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { products, isLoading } = useActiveProducts(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("fanzon_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, inputRef]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Fuzzy search products
  const matchingProducts = normalizedQuery
    ? fuzzySearch(
        products,
        normalizedQuery,
        (p) => [p.title, p.category, p.brand || ""],
        0.5
      ).slice(0, 6)
    : [];

  // Fuzzy search categories
  const matchingCategories = normalizedQuery
    ? fuzzySearch(
        categories,
        normalizedQuery,
        (c) => [c.name, c.slug],
        0.5
      ).slice(0, 3)
    : [];

  // Trending searches (static for now)
  const trendingSearches = ["iPhone", "Samsung", "Nike Shoes", "Laptop", "Watch"];

  const handleProductClick = (productSlug: string) => {
    saveRecentSearch(query);
    onClose();
    navigate(`/product/${productSlug}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    saveRecentSearch(query);
    onClose();
    navigate(`/category/${categorySlug}`);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("fanzon_recent_searches", JSON.stringify(updated));
  };

  const handleSearchClick = (searchTerm: string) => {
    saveRecentSearch(searchTerm);
    onSelect(searchTerm);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("fanzon_recent_searches");
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("fanzon_recent_searches", JSON.stringify(updated));
  };

  const hasResults = matchingProducts.length > 0 || matchingCategories.length > 0;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[420px] overflow-y-auto animate-fade-in"
    >
      {/* Show suggestions based on query */}
      {normalizedQuery ? (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (
            <>
              {/* Fuzzy Match Indicator */}
              {hasResults && matchingProducts.some(p => !p.title.toLowerCase().includes(normalizedQuery)) && (
                <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles size={12} className="text-primary" />
                  Showing results with typo corrections
                </div>
              )}

              {/* Matching Categories */}
              {matchingCategories.length > 0 && (
                <div className="p-2 border-b border-border">
                  <p className="text-xs text-muted-foreground px-2 mb-1 font-medium">{t("search.categories")}</p>
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-start transition-colors group"
                    >
                      <Tag size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Products */}
              {matchingProducts.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground px-2 mb-1 font-medium">{t("search.products")}</p>
                  {matchingProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug || product.id)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted rounded-lg text-start transition-colors group"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        Rs. {(product.discount_price_pkr || product.price_pkr).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!hasResults && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={28} className="text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground mb-1">{t("search.no_suggestions")}</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different spelling or browse categories
                  </p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs text-muted-foreground font-medium">{t("search.recent")}</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  {t("common.clear")}
                </button>
              </div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(term)}
                  className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-start transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="group-hover:text-primary transition-colors">{term}</span>
                  </div>
                  <button
                    onClick={(e) => removeRecentSearch(term, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10 rounded transition-all"
                  >
                    <X size={12} className="text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 mb-1 font-medium">{t("search.trending")}</p>
            {trendingSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(term)}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-start transition-colors group"
              >
                <TrendingUp size={14} className="text-primary" />
                <span className="group-hover:text-primary transition-colors">{term}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
